-- AlterTable
-- Multi proof support for OpsClientPayment (confirm booking + create payment).
-- Primary URL stays on proofFileUrl/proofUrl; full list lives in proofUrls JSON.
ALTER TABLE "OpsClientPayment" ADD COLUMN IF NOT EXISTS "proofUrls" JSONB;
