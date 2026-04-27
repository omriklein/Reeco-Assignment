BEGIN;

CREATE TABLE categories (
    id        VARCHAR(10) PRIMARY KEY,
    name      TEXT        NOT NULL,
    parent_id VARCHAR(10) REFERENCES categories(id)
);

-- needed for recursive CTE child lookups (category filter on products)
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

COMMIT;
