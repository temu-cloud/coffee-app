-- Remove stockType and note columns added in previous migration
-- Only run if those columns exist (safe to run even if migration 20260408000000 was never applied)

ALTER TABLE "InventoryItem"
  DROP COLUMN IF EXISTS "stockType",
  DROP COLUMN IF EXISTS "note",
  ALTER COLUMN "unitCost" DROP DEFAULT,
  ALTER COLUMN "totalCost" DROP DEFAULT,
  ALTER COLUMN "supplier" DROP DEFAULT;

DROP TYPE IF EXISTS "StockType";
DROP INDEX IF EXISTS "InventoryItem_stockType_idx";
