-- AlterTable
ALTER TABLE "orders" ADD COLUMN "courier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "estimatedDeliveryDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';
