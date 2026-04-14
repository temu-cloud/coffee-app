-- CreateTable: StockMovement
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantityAdded" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantitySold" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantityRemaining" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockMovement_itemName_key" ON "StockMovement"("itemName");
CREATE INDEX "StockMovement_itemName_idx" ON "StockMovement"("itemName");
