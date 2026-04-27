BEGIN;

CREATE TABLE suppliers (
    id         VARCHAR(10)  PRIMARY KEY,
    name       TEXT         NOT NULL,
    email      TEXT,
    rating     DECIMAL(3,1),
    country    VARCHAR(10),
    active     BOOLEAN      NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ  NOT NULL
);

-- used by anomaly detection (inactive suppliers with recent orders)
CREATE INDEX idx_suppliers_active ON suppliers(active);

COMMIT;
