-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('STOCK_IN', 'STOCK_OUT');

-- AlterTable: add stockType, note, make unitCost/totalCost/supplier optional with defaults
ALTER TABLE "InventoryItem"
  ADD COLUMN "stockType" "StockType" NOT NULL DEFAULT 'STOCK_IN',
  ADD COLUMN "note" TEXT,
  ALTER COLUMN "unitCost" SET DEFAULT 0,
  ALTER COLUMN "totalCost" SET DEFAULT 0,
  ALTER COLUMN "supplier" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "InventoryItem_stockType_idx" ON "InventoryItem"("stockType");
