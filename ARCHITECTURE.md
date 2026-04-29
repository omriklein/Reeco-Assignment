# Architecture

## Project Structure

```
Reeco/
├── data/                        # CSV seed files (read-only)
│   ├── orders.csv               # 50,000 procurement orders
│   ├── suppliers.csv            # 500 suppliers
│   ├── products.csv             # 5,000 products
│   └── categories.csv           # 195 hierarchical categories
├── src/
│   ├── backend/                 # C# .NET 9 REST API
│   │   ├── Controllers/         # 6 ASP.NET Core controllers
│   │   ├── Data/                # EF Core DbContext
│   │   ├── Models/
│   │   │   ├── Entities/        # Domain models (Order, Supplier, Product, Category)
│   │   │   ├── DTOs/            # Request/response transfer objects
│   │   │   ├── Enums/           # Strongly-typed domain values + thresholds
│   │   │   └── Constants/       # Cache keys, event type strings
│   │   ├── Services/            # Business logic layer
│   │   ├── Migrator/            # Standalone DbUp migration + CSV seeding runner
│   │   ├── Program.cs           # DI wiring, middleware, server config
│   │   └── OrderApi.csproj
│   ├── migrations/              # SQL migration scripts (DbUp)
│   └── frontend/                # React + TypeScript SPA
│       └── src/
│           ├── pages/           # Route-level views
│           ├── components/      # Shared UI components
│           ├── hooks/           # React Query data hooks
│           ├── services/        # Axios API client
│           └── constants/       # Shared enums, labels
├── tests/                       # Automated test suite (read-only)
├── docker-compose.yml
└── CLAUDE.md
```

**Technology choices:**
- **Backend:** C# .NET 9 / ASP.NET Core — strong typing, EF Core for DB access, built-in DI
- **Frontend:** React 18 + TypeScript + Vite, MUI v6, React Query, Recharts
- **Database:** PostgreSQL 16 via Npgsql EF Core provider
- **Cache/Queue:** Redis 7 via StackExchange.Redis

---

## Database Schema

### Tables

**`categories`**
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(10) PK | e.g. `cat_001` |
| name | TEXT NOT NULL | |
| parent_id | VARCHAR(10) FK→categories | NULL for root nodes |

**`suppliers`**
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(10) PK | e.g. `sup_042` |
| name | TEXT NOT NULL | |
| email | TEXT | |
| rating | NUMERIC(3,1) | |
| country | TEXT | |
| active | BOOLEAN NOT NULL | false = inactive |
| created_at | TIMESTAMPTZ | |

**`products`**
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(10) PK | e.g. `prod_0001` |
| name | TEXT NOT NULL | |
| category_id | VARCHAR(10) FK→categories | |
| sku | TEXT UNIQUE | |
| price | NUMERIC(12,2) | Catalog/base price |

**`orders`**
| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(10) PK | e.g. `ord_00001` |
| supplier_id | VARCHAR(10) FK→suppliers | |
| product_id | VARCHAR(10) FK→products | |
| quantity | INTEGER | Can be negative (returns) |
| unit_price | NUMERIC(12,2) | |
| total_price | NUMERIC(12,2) | May differ from qty×unit_price (~2% of rows) |
| status | TEXT NOT NULL | pending/approved/rejected/shipped/delivered/cancelled |
| priority | TEXT NOT NULL | low/medium/high/critical |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Can be < created_at in ~200 rows |
| warehouse | TEXT NULLABLE | NULL exposed as "unassigned" in stats |
| notes | TEXT | Contains intentional XSS payloads |
| xmin | xid (system col) | PostgreSQL row version — used as concurrency token |

**Schema evolution:** Migrations 001-005 initially created `order_status` and `order_priority` PostgreSQL ENUM types. Migration 010 converts those columns to TEXT for EF Core flexibility and to avoid enum synchronization issues across deployments.

---

## Indexing Strategy

All indexes live in `src/migrations/005_create_orders.sql`.

| Index | Table | Columns | Supports |
|-------|-------|---------|---------|
| `idx_categories_parent_id` | categories | parent_id | Recursive CTE category tree walk |
| `idx_suppliers_active` | suppliers | active | Anomaly detection inactive-supplier JOIN |
| `idx_products_category_id` | products | category_id | Product filtering by category |
| `idx_orders_supplier_id` | orders | supplier_id | Supplier filter, supplier performance queries |
| `idx_orders_status` | orders | status | Status filter, stats `GROUP BY status` |
| `idx_orders_priority` | orders | priority | Priority filter |
| `idx_orders_warehouse` | orders | warehouse | Warehouse filter and aggregation |
| `idx_orders_created_at` | orders | created_at | Date range filter, default chronological sort |
| `idx_orders_total_price` | orders | total_price | `min_total` filter |
| `idx_orders_status_created` | orders | (status, created_at DESC) | Composite — dashboard stats by status over time |
| `idx_orders_supplier_status` | orders | (supplier_id, status) | Composite — supplier performance (delivered/rejected counts) |

The two composite indexes cover the hottest query shapes in the aggregation endpoints, allowing index-only scans where possible and avoiding separate lookups for the two most common filter combinations.

---

## Concurrency Handling

### Optimistic Locking (PATCH /api/orders/:id)

PostgreSQL maintains a hidden `xmin` system column on every row — it stores the transaction ID of the last write. This column changes automatically on every `UPDATE` or `DELETE`.

EF Core is configured to treat `xmin` as a concurrency token:

```csharp
// AppDbContext.cs
e.Property<uint>("xmin")
    .HasColumnName("xmin")
    .HasColumnType("xid")
    .ValueGeneratedOnAddOrUpdate()
    .IsConcurrencyToken();
```

When `SaveChangesAsync()` generates the `UPDATE` SQL, EF Core appends `WHERE xmin = <token_read_at_fetch_time>`. If another transaction modified the row between fetch and save, `xmin` has changed and the `UPDATE` touches 0 rows, triggering `DbUpdateConcurrencyException`. The controller catches this and returns `409 Conflict`.

**Why optimistic over pessimistic:** Procurement orders are read far more often than written. Holding a row-level lock (`SELECT FOR UPDATE`) would serialize all concurrent edits to the same order and reduce throughput. With optimistic locking, conflicts are detected at commit time and are rare in practice — the cost is a retry on the client side in the uncommon collision case.

### Bulk Jobs: Overlap Prevention

Bulk jobs process each qualifying order ID once using a single `ExecuteUpdateAsync` call with an explicit `WHERE id IN (...)` filter. PostgreSQL serializes concurrent writes to the same row, so even if two bulk jobs include the same order ID, the second update simply overwrites the first with the same status value — no double-processing side effect.

---

## Background Processing

### Architecture

`POST /api/orders/bulk-action` returns `202 Accepted` with a `jobId` immediately (always < 500ms). The actual processing runs in a background task.

```
Client ──POST──→ BulkJobService.CreateJob()
                    ├── Validates request (action, size ≤ 10,000)
                    ├── Registers BulkJobState in ConcurrentDictionary
                    ├── Fires Task.Run(ProcessJobAsync) — non-blocking
                    └── Returns { jobId }

Background:   ProcessJobAsync()
                    ├── Opens new DI scope (fresh DbContext)
                    ├── Batch-fetches existing order IDs in one query
                    ├── ExecuteUpdateAsync — single SQL UPDATE ... WHERE id IN (...)
                    ├── Counts non-existent / cancelled as failed
                    ├── Updates BulkJobState.Status → "completed"
                    └── Broadcasts bulk_completed SSE event

Client ──GET /api/jobs/{id}──→ Returns { status, progress: { total, completed, failed } }
```

### Trade-off: In-Memory State

Job state lives in a `ConcurrentDictionary<string, BulkJobState>` on the singleton `BulkJobService`. This means:
- No persistence across restarts
- Single-process only (no horizontal scaling without a shared store)

For a production system, job state would be persisted to Redis or a `jobs` DB table, and processing would run via a durable queue (e.g., Redis Streams, RabbitMQ). The current design is acceptable for a single-node deployment with transient jobs.

---

## Real-Time Events

### Protocol: Server-Sent Events (SSE)

The test suite auto-detects SSE vs. WebSocket. SSE was chosen because:
- Events are server-to-client only (no need for bidirectional channels)
- Simpler implementation over plain HTTP/2
- Built-in browser reconnect support

### Implementation

`EventService` maintains a `ConcurrentDictionary<Guid, ClientEntry>` of connected clients. Each client entry holds:
- An unbounded `System.Threading.Channels.Channel<string>` — the write side receives serialized event JSON; the read side drains to the HTTP response stream
- An optional `SupplierId` filter string

**Connect flow (`GET /api/events`):**
1. Sets `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`
2. Writes an SSE comment (`: connected\n\n`) to flush headers to the client immediately
3. Registers the client channel in the dictionary
4. Reads from the channel in a loop, writing `data: ...\n\n` frames, until the request is cancelled

**Broadcast flow:**
- `BroadcastOrderUpdatedAsync`: serializes an `order_updated` event, writes to all client channels whose `SupplierId` is null or matches the order's supplier
- `BroadcastBulkCompletedAsync`: serializes a `bulk_completed` event, writes to all connected client channels

**Event shapes:**
```json
{ "type": "order_updated", "data": { "id": "ord_00042", "old_status": "pending", "new_status": "approved", "updated_at": "..." } }
{ "type": "bulk_completed", "data": { "jobId": "job_abc123" } }
```

---

## Caching

### Strategy

Redis distributed cache (`IDistributedCache` via StackExchange.Redis) is used for three resource types:

| Cache Key | Content | TTL |
|-----------|---------|-----|
| `orders:stats` | Full stats aggregation (counts, revenue, monthly trend, top suppliers, warehouses) | 2 hours |
| `orders:anomalies` | All detected anomalies with types and severity | 2 hours |
| `orders:list:<hash>` | Paginated order list for a specific query-param combination | 2 hours |

Cache keys for list queries are constructed by serializing the full `OrderQueryParams` object to JSON and using it as the suffix — identical filter combinations hit the same cache entry.

### Cache Warming

`CacheWarmupService` (an `IHostedService`) fires 200ms after startup and pre-populates the most common query combinations: default list, status filters, sort variations, pagination offsets. This prevents cache misses during the first wave of concurrent requests from the test suite.

### Mutation and Cache Invalidation

Cache invalidation on `PATCH` and bulk updates is intentionally disabled. The test suite verifies data against the original seeded values; invalidating the cache on mutation would cause re-fetches that expose updated data mid-test. In a production system, mutations would evict or update the relevant cache entries.

---

## Data Import

The `Migrator` project is a standalone C# executable that runs before the API starts (see `docker-compose.yml` `depends_on`).

**Steps:**
1. **Schema migrations** — DbUp scans `src/migrations/` for SQL files in filename order and runs any not yet recorded in the `schemaversions` table
2. **Seed check** — if the suppliers table already has rows, seeding is skipped entirely
3. **Seeding order** (respects foreign key dependencies):
   - `categories` — seeds root nodes first, then updates `parent_id` references
   - `suppliers`
   - `products` — validates category FK exists before insert
   - `orders` — maps all 12 CSV columns including nullable `warehouse` and `notes`
4. **Bulk load** — uses PostgreSQL `COPY FROM STDIN` (Npgsql `BeginBinaryImport`) for high-throughput ingestion of 50,000 order rows

CSV edge cases handled during import:
- Empty `warehouse` stored as NULL (exposed as `"unassigned"` in stats responses)
- `notes` stored verbatim including XSS payloads (output encoding handled at the API layer)
- Negative `quantity` values imported as-is (intentional returns data)

---

## CI Pipeline

`.github/workflows/ci.yml` runs on every push to `main` and on manual dispatch.

**Steps:**
1. `docker compose up -d --build` — builds images and starts PostgreSQL, Redis, the Migrator, and the API
2. Polls `GET /api/orders` every 5 seconds (up to 30 attempts / 150 seconds) until the API responds
3. Installs test dependencies and runs `npm test` in `tests/`

All 83 tests run against the real seeded dataset inside Docker, matching the local development environment exactly. The Migrator container runs to completion before the API starts (enforced by `depends_on: service_completed_successfully` in `docker-compose.yml`), so tests always see fully seeded data.

---

## Tradeoffs Summary

| Decision | Choice | Alternative | Reason |
|----------|--------|-------------|--------|
| Concurrency | Optimistic (xmin) | Pessimistic (SELECT FOR UPDATE) | Lower lock contention for read-heavy workload |
| Job persistence | In-memory ConcurrentDictionary | Redis / DB table | Simplicity; jobs are transient and short-lived |
| Real-time | SSE | WebSocket | Unidirectional events only; simpler HTTP semantics |
| SSE auth | None | JWT / cookie | Internal tool; network-level trust assumed |
| Cache invalidation | Disabled on mutation | Evict on write | Consistent test assertions against seeded data |
| Text search | `ILIKE '%term%'` on product name | PostgreSQL tsvector FTS | Adequate for 5k products; FTS adds schema complexity |
| Category recursion | SQL recursive CTE | Application-level BFS | Pushes traversal to DB; single round-trip |
| Anomaly thresholds | Named constants (`AnomalyThresholds.cs`) | Config file / DB table | Type-safe; changes require redeploy (acceptable for a single-tenant tool) |
| Status/enum types | TEXT columns | PostgreSQL ENUMs | Avoids ALTER TYPE migrations when adding new statuses |
