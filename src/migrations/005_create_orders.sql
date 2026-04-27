BEGIN;

CREATE TABLE orders (
    id          VARCHAR(10)    PRIMARY KEY,
    supplier_id VARCHAR(10)    NOT NULL REFERENCES suppliers(id),
    product_id  VARCHAR(10)    NOT NULL REFERENCES products(id),
    quantity    INTEGER        NOT NULL,         -- negative = return
    unit_price  DECIMAL(12,2)  NOT NULL,
    total_price DECIMAL(12,2)  NOT NULL,
    status      order_status   NOT NULL,
    priority    order_priority NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL,
    updated_at  TIMESTAMPTZ    NOT NULL,
    warehouse   TEXT,                            -- NULL shown as "unassigned" in stats
    notes       TEXT                             -- may contain XSS — store raw, escape on output
);

-- supplier_id: filter param + supplier performance queries
CREATE INDEX idx_orders_supplier_id ON orders(supplier_id);
-- status: filter param + stats aggregation
CREATE INDEX idx_orders_status ON orders(status);
-- priority: filter param
CREATE INDEX idx_orders_priority ON orders(priority);
-- warehouse: filter param + stats GROUP BY
CREATE INDEX idx_orders_warehouse ON orders(warehouse);
-- created_at: date_from/date_to filter + default sort
CREATE INDEX idx_orders_created_at ON orders(created_at);
-- total_price: min_total filter param
CREATE INDEX idx_orders_total_price ON orders(total_price);
-- composite: dashboard stats (status breakdown by date), covers status + sort together
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
-- composite: supplier performance endpoint (orders per supplier filtered by status)
CREATE INDEX idx_orders_supplier_status ON orders(supplier_id, status);

COMMIT;
