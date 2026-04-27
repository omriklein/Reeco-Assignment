BEGIN;

CREATE TYPE order_status AS ENUM ('pending','approved','rejected','shipped','delivered','cancelled');
CREATE TYPE order_priority AS ENUM ('low','medium','high','critical');

COMMIT;
