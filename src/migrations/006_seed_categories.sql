BEGIN;

-- Stage all rows first (parent_id FK would block direct COPY due to ordering / circular refs)
CREATE TEMP TABLE categories_staging (id VARCHAR(10), name TEXT, parent_id VARCHAR(10));
COPY categories_staging FROM '/data/categories.csv' WITH (FORMAT CSV, HEADER true, NULL '');

-- Insert without parent_id so all rows exist before FK relationships are applied
INSERT INTO categories (id, name)
SELECT id, name FROM categories_staging;

-- Wire up parent relationships only where the parent exists (guards against circular refs)
UPDATE categories c
   SET parent_id = s.parent_id
  FROM categories_staging s
 WHERE c.id = s.id
   AND s.parent_id IS NOT NULL
   AND EXISTS (SELECT 1 FROM categories p WHERE p.id = s.parent_id);

DROP TABLE categories_staging;

COMMIT;
