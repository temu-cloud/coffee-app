-- Make inventoryItemId and priceHistoryId optional in DailySale
-- Add itemName and unitPrice fields

ALTER TABLE "DailySale"
  ADD COLUMN IF NOT EXISTS "itemName" TEXT,
  ADD COLUMN IF NOT EXISTS "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
  ALTER COLUMN "inventoryItemId" DROP NOT NULL,
  ALTER COLUMN "priceHistoryId" DROP NOT NULL;

-- Backfill itemName from inventoryItem for existing rows
UPDATE "DailySale" ds
SET "itemName" = ii.name
FROM "InventoryItem" ii
WHERE ds."inventoryItemId" = ii.id
  AND ds."itemName" IS NULL;

-- Set itemName to 'Unknown' for any remaining nulls
UPDATE "DailySale" SET "itemName" = 'Unknown' WHERE "itemName" IS NULL;

-- Now make itemName NOT NULL
ALTER TABLE "DailySale" ALTER COLUMN "itemName" SET NOT NULL;

-- Backfill unitPrice from priceHistory for existing rows
UPDATE "DailySale" ds
SET "unitPrice" = ph.price
FROM "PriceHistory" ph
WHERE ds."priceHistoryId" = ph.id
  AND ds."unitPrice" = 0;

-- Drop the default now that backfill is done
ALTER TABLE "DailySale" ALTER COLUMN "unitPrice" DROP DEFAULT;
