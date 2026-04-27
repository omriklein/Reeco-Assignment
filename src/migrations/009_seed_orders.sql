BEGIN;

COPY orders (id, supplier_id, product_id, quantity, unit_price, total_price, status, priority, created_at, updated_at, warehouse, notes)
FROM '/data/orders.csv'
WITH (FORMAT CSV, HEADER true, NULL '');

COMMIT;
