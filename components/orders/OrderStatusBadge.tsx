import { Badge } from "@/components/ui/badge";

const MAP: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  REJECTED: "Rejected",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  FAILED_ATTEMPT: "Failed Attempt",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const label = MAP[status] ?? status;
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
