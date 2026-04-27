BEGIN;

COPY suppliers (id, name, email, rating, country, active, created_at)
FROM '/data/suppliers.csv'
WITH (FORMAT CSV, HEADER true, NULL '');

COMMIT;
