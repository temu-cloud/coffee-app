-- Add itemName to PriceHistory and make inventoryItemId optional

-- Step 1: Add itemName as nullable first
ALTER TABLE "PriceHistory"
  ADD COLUMN IF NOT EXISTS "itemName" TEXT;

-- Step 2: Make inventoryItemId optional
ALTER TABLE "PriceHistory"
  ALTER COLUMN "inventoryItemId" DROP NOT NULL;

-- Step 3: Backfill itemName from inventoryItem for existing rows
UPDATE "PriceHistory" ph
SET "itemName" = ii.name
FROM "InventoryItem" ii
WHERE ph."inventoryItemId" = ii.id
  AND ph."itemName" IS NULL;

-- Step 4: Set fallback for any remaining nulls
UPDATE "PriceHistory" SET "itemName" = 'Unknown' WHERE "itemName" IS NULL;

-- Step 5: Now make itemName NOT NULL
ALTER TABLE "PriceHistory" ALTER COLUMN "itemName" SET NOT NULL;

-- Step 6: Add index
CREATE INDEX IF NOT EXISTS "PriceHistory_itemName_effectiveDate_idx" ON "PriceHistory"("itemName", "effectiveDate");
