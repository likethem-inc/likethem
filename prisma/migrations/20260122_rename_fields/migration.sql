-- Rename columns to match updated Prisma schema and preserve existing data

-- User table
ALTER TABLE "users" RENAME COLUMN IF EXISTS "fullName" TO "name";
ALTER TABLE "users" RENAME COLUMN IF EXISTS "avatar" TO "image";
ALTER TABLE "users" RENAME COLUMN IF EXISTS "password" TO "passwordHash";

-- SellerApplication table
ALTER TABLE "seller_applications" RENAME COLUMN IF EXISTS "fullName" TO "name";

-- ShippingAddress table
ALTER TABLE "shipping_addresses" RENAME COLUMN IF EXISTS "fullName" TO "name";
