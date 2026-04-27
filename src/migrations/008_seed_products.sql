BEGIN;

-- SKU values are not globally unique in the dataset; drop the constraint to load all rows
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Stage all rows; products with a category_id not in categories get category_id = NULL
CREATE TEMP TABLE products_staging (id VARCHAR(10), name TEXT, category_id VARCHAR(10), sku VARCHAR(50), price DECIMAL(12,2));
COPY products_staging FROM '/data/products.csv' WITH (FORMAT CSV, HEADER true, NULL '');

INSERT INTO products (id, name, category_id, sku, price)
SELECT s.id, s.name,
       CASE WHEN c.id IS NOT NULL THEN s.category_id ELSE NULL END,
       s.sku, s.price
FROM products_staging s
LEFT JOIN categories c ON c.id = s.category_id;

DROP TABLE products_staging;

COMMIT;
