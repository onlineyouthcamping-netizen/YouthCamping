-- AlterTable
ALTER TABLE "OpsVendorPayment" ADD COLUMN "sourceType" TEXT;
ALTER TABLE "OpsVendorPayment" ADD COLUMN "sourceId" TEXT;

-- CreateIndex
CREATE INDEX "OpsVendorPayment_tenantId_sourceType_sourceId_idx" ON "OpsVendorPayment"("tenantId", "sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "OpsVendorPayment_tenantId_sourceType_sourceId_key" ON "OpsVendorPayment"("tenantId", "sourceType", "sourceId");
