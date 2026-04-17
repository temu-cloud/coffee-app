-- Drop legacy tables no longer used by the app
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "StaffPermission" CASCADE;

-- Clear all test data from active tables (preserve users/auth)
DELETE FROM "StockMovement";
DELETE FROM "InventoryHistory";
DELETE FROM "DailySale";
DELETE FROM "DailyExpense";
DELETE FROM "PriceHistory";
DELETE FROM "InventoryItem";
DELETE FROM "SupplyItem";
DELETE FROM "Asset";
DELETE FROM "Payment";
DELETE FROM "Budget";
