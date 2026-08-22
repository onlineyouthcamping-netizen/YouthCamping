-- AlterTable
-- Nullable TEXT so existing rows stay NULL/NULL (unresolved historical payouts).
-- Postgres unique indexes treat NULLs as distinct, so many (tenantId, NULL, NULL)
-- rows are allowed. Do not use NULLS NOT DISTINCT.
ALTER TABLE "OpsVendorPayment" ADD COLUMN IF NOT EXISTS "sourceType" TEXT;
ALTER TABLE "OpsVendorPayment" ADD COLUMN IF NOT EXISTS "sourceId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OpsVendorPayment_tenantId_sourceType_sourceId_idx" ON "OpsVendorPayment"("tenantId", "sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "OpsVendorPayment_tenantId_sourceType_sourceId_key" ON "OpsVendorPayment"("tenantId", "sourceType", "sourceId");
