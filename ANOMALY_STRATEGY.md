# Anomaly Detection Strategy

## Rules Implemented

All 4 required rules and all 3 bonus rules are implemented. Thresholds are defined as named constants in `src/backend/Models/Enums/AnomalyThresholds.cs` — never inline magic numbers.

### Required Rules

| Rule | Condition | Threshold constant |
|------|-----------|-------------------|
| `price_mismatch` | `|total_price − (quantity × unit_price)| > 0.01` | `PriceMismatchTolerance = 0.01` |
| `inactive_supplier` | Order's supplier has `active = false` | — |
| `negative_quantity` | `quantity < 0` | — |
| `timestamp_anomaly` | `updated_at < created_at` | — |

### Bonus Rules

| Rule | Condition | Threshold constant |
|------|-----------|-------------------|
| `price_spike` | `unit_price > product.price × 3.0` | `PriceSpikeMultiplier = 3.0` |
| `after_hours` | `created_at` hour (UTC) ≥ 22 or < 6 | `AfterHoursStart = 22`, `AfterHoursEnd = 6` |
| `risky_supplier` | More than 50% of a supplier's orders are anomalous | `RiskySupplierRate = 0.5` |

---

## Severity Logic

Severity is assigned by `ComputeSeverity()` after all rules have been evaluated for an order:

```
HIGH   — ≥3 anomaly types detected  OR  negative_quantity is present
MEDIUM — price_mismatch  OR  price_spike  OR  risky_supplier  (and not HIGH)
LOW    — any remaining single anomaly (timestamp_anomaly, inactive_supplier, after_hours)
```

**Rationale:**
- `negative_quantity` is always HIGH because it represents a return/credit that can corrupt inventory counts and financial totals if mishandled
- Price-related anomalies (`price_mismatch`, `price_spike`) are MEDIUM because they indicate a financial discrepancy requiring review, but the order itself may still be valid
- `risky_supplier` is MEDIUM because a pattern of anomalies across a supplier signals a systemic issue, not just a one-off
- Structural/metadata anomalies (`timestamp_anomaly`, `inactive_supplier`, `after_hours`) are LOW individually — they indicate data quality issues but don't directly imply a wrong transaction amount
- Three or more types on one order is always HIGH regardless of type, because the accumulation of issues signals a record that cannot be trusted

---

## Detection Algorithm

Detection runs in two passes over all orders, loaded in a single DB query with supplier and product JOINs:

**Pass 1 — per-order rule evaluation:**
- Check `price_mismatch`, `negative_quantity`, `timestamp_anomaly`, `price_spike`, `after_hours`, `inactive_supplier` for every order
- Record matching types in `anomalyMap[orderId]`
- Track `supplierOrderCounts[supplierId]` and `supplierAnomalyCounts[supplierId]` for any order with at least one anomaly

**Pass 2 — supplier-level aggregation:**
- For each supplier where `anomalyCounts / totalOrders > 0.5`, add them to `riskySupplierIds`
- Re-iterate `anomalyMap` to append `risky_supplier` to all orders belonging to those suppliers

**Complexity:** O(n) where n = total orders. The two passes are both linear; supplier aggregation uses dictionary lookups.

**Caching:** Results are cached in Redis with a 2-hour TTL under key `orders:anomalies`. The first call is the expensive one; subsequent calls within the TTL window are instant.

---

## Patterns Discovered in the Data

Exploration of the 50,000-row dataset revealed the following intentional anomalies:

**Timestamp anomalies (~200 orders):** A small but consistent set of orders have `updated_at` earlier than `created_at`. These appear to be data entry errors or timezone conversion bugs in the source system.

**Price mismatches (~2% of orders, ~1,000 rows):** `total_price` does not equal `quantity × unit_price`. The discrepancy is usually a few cents to a few dollars. Likely caused by rounding differences, manual overrides, or discount codes applied at checkout that weren't propagated to the line-item fields.

**Negative quantities:** Several hundred orders have `quantity < 0`. These represent returns or credit notes — the negative value is intentional from a business perspective but anomalous from a data-quality standpoint and must be flagged for review.

**Inactive supplier orders:** Some suppliers marked `active = false` still have orders in the dataset, including recent ones. This suggests suppliers were deactivated after orders were placed, or the active flag wasn't enforced at order creation time.

**XSS payloads in notes:** The `notes` field contains strings like `<script>alert('xss')</script>`. These are stored verbatim and handled by output encoding at the API/frontend layer — never injected into SQL or rendered as raw HTML.

**Price spikes:** A subset of orders have `unit_price` more than 3× the product's catalog price. This could indicate emergency procurement, fraud, or data entry errors.

**After-hours orders:** Orders created between 22:00 and 06:00 UTC. In a procurement context these may warrant review — legitimate bulk orders are typically submitted during business hours; off-hours activity could indicate automated scripts or unauthorized access.

---

## What I'd Improve with More Time

**Externalize thresholds to configuration.** The constants in `AnomalyThresholds.cs` are type-safe but require a redeploy to change. Moving thresholds to an `appsettings.json` section or a `anomaly_config` DB table would let operations teams tune detection sensitivity without a code change.

**Incremental, event-driven detection.** The current implementation re-scans all 50,000 orders on every cache miss. A better design would trigger anomaly re-evaluation only for the affected orders when an order is created or updated, updating a persistent `order_anomalies` table rather than recomputing the full set.

**Persist anomaly results.** Storing detected anomalies in a dedicated `order_anomalies` table with a `detected_at` timestamp would enable historical trend queries ("how many price mismatches this month?") and allow downstream workflows (notifications, approval queues) to subscribe to new anomaly rows.

**Full-text search on notes.** The notes field contains free-text that could yield additional anomaly signals (e.g., notes mentioning "duplicate", "error", "test"). A PostgreSQL `tsvector` index would make this fast at scale.

**ML-based price spike detection.** The current 3× multiplier is a simple heuristic. A statistical model (e.g., z-score over the trailing 90-day price distribution per product) would be more accurate and adaptive to seasonal price changes.

**Supplier risk scoring.** Rather than a binary risky/not-risky flag at 50%, a continuous risk score (weighted by recency, anomaly severity, and order volume) would give procurement teams better prioritization signals.
