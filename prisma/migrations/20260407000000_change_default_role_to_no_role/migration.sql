-- AlterTable: change default role from 'ADMIN' to 'NO_ROLE'
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'NO_ROLE';
