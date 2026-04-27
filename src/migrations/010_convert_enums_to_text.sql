BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        ALTER TABLE orders ALTER COLUMN status TYPE TEXT USING status::TEXT;
        ALTER TABLE orders ALTER COLUMN priority TYPE TEXT USING priority::TEXT;
        DROP TYPE order_status;
        DROP TYPE order_priority;
    END IF;
END;
$$;

COMMIT;
