-- CreateTable
CREATE TABLE "payment_settings" (
    "id" TEXT NOT NULL,
    "yapeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "yapePhoneNumber" TEXT,
    "yapeQRCode" TEXT,
    "yapeInstructions" TEXT,
    "plinEnabled" BOOLEAN NOT NULL DEFAULT false,
    "plinPhoneNumber" TEXT,
    "plinQRCode" TEXT,
    "plinInstructions" TEXT,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripePublicKey" TEXT,
    "stripeSecretKey" TEXT,
    "defaultPaymentMethod" TEXT NOT NULL DEFAULT 'stripe',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id")
);
