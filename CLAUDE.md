# Reeco — Procurement Order Management Dashboard

Senior Fullstack Engineer take-home assignment. Build a REST API backend + React frontend for managing procurement orders. **Time expectation: 5–8 hours.**

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | **C# .NET** — REST API on port 3000 |
| Frontend | React + TypeScript |
| Database | PostgreSQL 16 (`localhost:5432`, db: `order_ops`, user/pass: `postgres`) |
| Cache / Queue | Redis 7 (`localhost:6379`) |

All source code goes inside `src/`. You decide the structure.

---

## Project Structure

```
Reeco/
├── data/               # CSV seed files — READ ONLY
│   ├── orders.csv      # 50,000 orders
│   ├── suppliers.csv   # 500 suppliers
│   ├── products.csv    # 5,000 products
│   └── categories.csv  # 195 hierarchical categories
├── src/                # Your application code (backend + frontend)
├── tests/              # Automated test suite — READ ONLY, do not modify
├── docker-compose.yml  # Spins up PostgreSQL + Redis
└── CLAUDE.md           # This file
```

---

## Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Build and start your .NET server (must listen on port 3000)

# 3. Import CSV data from data/ into PostgreSQL

# 4. Run the full test suite
cd tests && npm install && npm test
```

---

## Test Suite — 83 tests / 115 points

```bash
cd tests
npm run test:basic       # Basic CRUD (start here)          15 pts
npm run test:filter      # Filtering & sorting              10 pts
npm run test:agg         # Aggregations                     20 pts
npm run test:anomaly     # Anomaly detection                15 pts
npm run test:bulk        # Bulk operations                  15 pts
npm run test:concurrent  # Concurrency                      15 pts
npm run test:perf        # Performance benchmarks           10 pts
npm run test:realtime    # WebSocket / SSE                  10 pts
npm run test:security    # Input validation                  5 pts
npm test                 # All tests
```

The test files are the **authoritative spec**. When README and a test disagree, the test is correct.

---

## API Overview

**Base:** `http://localhost:3000/api`  
**All responses:** `Content-Type: application/json`

### Pagination shape (all list endpoints)
```json
{ "data": [...], "total": 50000, "limit": 20, "offset": 0 }
```

### Error shape (all errors)
```json
{ "error": "Human-readable message", "code": "ERROR_CODE" }
```

### Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/orders` | Paginated. Supports filters (see below). |
| GET | `/api/orders/:id` | Includes `supplier_name`, `product_name`. 404 if not found. |
| PATCH | `/api/orders/:id` | Update status/priority. 400 for invalid status, 409 if already cancelled. |
| GET | `/api/orders/stats` | Dashboard aggregations. |
| GET | `/api/orders/anomalies` | Flagged anomalous orders. |
| POST | `/api/orders/bulk-action` | Async bulk action → 202 with `jobId`. |
| GET | `/api/suppliers` | Paginated list. |
| GET | `/api/suppliers/:id` | Includes `order_count`, `total_revenue`. |
| GET | `/api/suppliers/:id/performance` | Delivery days, rejection rate, trends, price consistency. |
| GET | `/api/products` | Paginated list. Supports `?category=` (recursive). |
| GET | `/api/jobs/:id` | Poll async job status. |
| GET/WS | `/api/events` | SSE or WebSocket real-time event stream. |

### Order filters (`GET /api/orders`)
`status`, `priority`, `supplier_id`, `warehouse`, `date_from`, `date_to`, `min_total`, `search`, `sort`, `order`, `limit`, `offset`

### Valid order statuses
`pending` | `approved` | `rejected` | `shipped` | `delivered` | `cancelled`

---

## Key Implementation Notes

### Data Edge Cases (intentional in CSVs)
- Null/empty `warehouse` → show as `"unassigned"` in stats
- Negative `quantity` (returns)
- `total_price ≠ quantity × unit_price` (~2% of orders)
- Inactive suppliers with recent orders
- `updated_at < created_at` (~200 orders)
- Duplicate supplier name variations
- Circular category hierarchies
- XSS payloads in `notes` field

### Concurrency
- Optimistic locking on `PATCH /api/orders/:id` — simultaneous patches → one 200, one 409
- Bulk jobs: overlapping order IDs must not double-process

### Bulk Operations
- `POST /api/orders/bulk-action` must respond in **< 500ms** regardless of batch size
- Max batch size: 10,000 IDs
- Non-existent or cancelled orders count as `failed` in job progress

### Anomaly Detection (`GET /api/orders/anomalies`)
Required rules: `price_mismatch`, `inactive_supplier`, `negative_quantity`, `timestamp_anomaly`  
Bonus rules: `price_spike`, `after_hours`, `risky_supplier`  
Each result: `{ order_id, anomaly_types: string[], severity: "low"|"medium"|"high" }`

### Real-Time Events (`/api/events`)
Support WebSocket **or** SSE (test suite auto-detects).  
Events: `order_updated` (on status change), `bulk_completed` (on job finish).  
Optional filter: `?supplier_id=` to receive only that supplier's events.

### Performance
- Add DB indexes — tests benchmark p95 response time against 50,000 rows
- Cache `/api/orders/stats` with Redis (expensive aggregation)

---

## Required Documentation (create after implementation)

- **`ARCHITECTURE.md`** — project structure, DB schema, indexing strategy, concurrency handling, background processing, real-time events, tradeoffs
- **`ANOMALY_STRATEGY.md`** — rules implemented, severity logic, patterns found in data, what you'd improve

---

## Scoring

| Category | Points |
|----------|--------|
| Automated tests (83 tests) | 115 |
| Code quality & structure | 10 |
| Frontend UX & polish | 10 |
| ARCHITECTURE.md depth | 5 |
| ANOMALY_STRATEGY.md depth | 5 |
| **Total** | **145** |
