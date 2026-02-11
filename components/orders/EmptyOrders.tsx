import { t } from "@/lib/i18n/t";
import type { Locale } from "@/lib/i18n/getLocale";

export function EmptyOrders({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-2xl border p-10 text-center text-muted-foreground">
      {t(locale, "orders.empty")}
    </div>
  );
}
