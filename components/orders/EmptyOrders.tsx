import { t } from "@/lib/i18n/t";

export function EmptyOrders({ locale }: { locale: string }) {
  return (
    <div className="rounded-2xl border p-10 text-center text-muted-foreground">
      {t(locale, "orders.empty")}
    </div>
  );
}
