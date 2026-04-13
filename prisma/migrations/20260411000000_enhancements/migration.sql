-- CreateTable: InventoryHistory
CREATE TABLE "InventoryHistory" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityAdded" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "totalCost" DECIMAL(65,30) NOT NULL,
    "supplier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "InventoryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryHistory_inventoryItemId_date_idx" ON "InventoryHistory"("inventoryItemId", "date");

-- AddForeignKey
ALTER TABLE "InventoryHistory" ADD CONSTRAINT "InventoryHistory_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryHistory" ADD CONSTRAINT "InventoryHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: PriceHistory — add category and unitCost
ALTER TABLE "PriceHistory" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'OTHER';
ALTER TABLE "PriceHistory" ADD COLUMN "unitCost" DECIMAL(65,30);

-- AlterTable: DailySale — add unitCost, totalCost, profit
ALTER TABLE "DailySale" ADD COLUMN "unitCost" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "DailySale" ADD COLUMN "totalCost" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "DailySale" ADD COLUMN "profit" DECIMAL(65,30) NOT NULL DEFAULT 0;
