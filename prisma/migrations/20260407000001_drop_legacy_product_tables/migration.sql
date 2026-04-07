-- Drop legacy tables that are no longer in the schema
-- Order matters: Transaction references Product and user, StaffPermission references user

DROP TABLE IF EXISTS "Transaction";
DROP TABLE IF EXISTS "StaffPermission";
DROP TABLE IF EXISTS "Product";
