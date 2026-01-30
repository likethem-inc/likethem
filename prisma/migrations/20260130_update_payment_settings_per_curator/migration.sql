-- AlterTable payment_settings: Add curatorId and make it unique
ALTER TABLE "payment_settings" ADD COLUMN "curatorId" TEXT;

-- AddForeignKey
ALTER TABLE "payment_settings" ADD CONSTRAINT "payment_settings_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "curator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (after data migration, will be enforced by constraint)
CREATE UNIQUE INDEX "payment_settings_curatorId_key" ON "payment_settings"("curatorId");
