import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n/t";
import type { Locale } from "@/lib/i18n/getLocale";

type TranslationKey = Parameters<typeof t>[1];

const MAP = {
  PENDING_PAYMENT: "order.status.pendingPayment",
  PAID: "order.status.paid",
  REJECTED: "order.status.rejected",
  PROCESSING: "order.status.processing",
  SHIPPED: "order.status.shipped",
  DELIVERED: "order.status.delivered",
  FAILED_ATTEMPT: "order.status.failedAttempt",
  CANCELLED: "order.status.cancelled",
  REFUNDED: "order.status.refunded",
} as const satisfies Record<string, TranslationKey>;

export function OrderStatusBadge({ status, locale }: { status: string; locale: Locale }) {
  const labelKey = Object.prototype.hasOwnProperty.call(MAP, status)
    ? MAP[status as keyof typeof MAP]
    : undefined;
  const label = labelKey ? t(locale, labelKey) : status;
  const tone =
    status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    status === "SHIPPED" ? "bg-blue-50 text-blue-700 border-blue-200" :
    status === "PAID" ? "bg-green-50 text-green-700 border-green-200" :
    status === "PROCESSING" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
    status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-200" :
    status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
    status === "REFUNDED" ? "bg-amber-50 text-amber-800 border-amber-200" :
    status === "FAILED_ATTEMPT" ? "bg-orange-50 text-orange-700 border-orange-200" :
    status === "PENDING_PAYMENT" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
    "bg-zinc-50 text-zinc-700 border-zinc-200";

  return <Badge className={`rounded-full border ${tone}`}>{label}</Badge>;
}
