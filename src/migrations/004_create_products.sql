BEGIN;

CREATE TABLE products (
    id          VARCHAR(10)   PRIMARY KEY,
    name        TEXT          NOT NULL,
    category_id VARCHAR(10)   REFERENCES categories(id),
    sku         VARCHAR(50)   NOT NULL UNIQUE,
    price       DECIMAL(12,2) NOT NULL
);

-- used by GET /api/products?category= (recursive category filter)
CREATE INDEX idx_products_category_id ON products(category_id);

COMMIT;
