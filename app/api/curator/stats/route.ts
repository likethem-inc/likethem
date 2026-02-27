import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

/** Statuses that represent a completed/in-progress sale */
const SOLD_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

/** Convert a Date to a human-readable relative time string */
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

/** Calculate % change from previous to current, rounded to nearest integer */
function calcDelta(current: number, previous: number): number | undefined {
  if (previous === 0) return undefined;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "CURATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve the curator profile for the authenticated user
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id as string },
      select: { id: true },
    });

    if (!curatorProfile) {
      return NextResponse.json({ error: "Curator profile not found" }, { status: 404 });
    }

    const curatorId = curatorProfile.id;

    // Date boundaries for month-over-month delta calculations
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Using Date arithmetic: month -1 wraps correctly to December of the prior year when month is 0
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Run all DB queries in parallel for efficiency
    const [
      itemsSoldAll,
      earningsAll,
      favoritesAll,
      itemsSoldThisMonth,
      earningsThisMonth,
      favoritesThisMonth,
      itemsSoldLastMonth,
      earningsLastMonth,
      favoritesLastMonth,
      recentOrders,
      recentFavorites,
    ] = await Promise.all([
      // All-time items sold
      prisma.orderItem.aggregate({
        where: { order: { curatorId, status: { in: SOLD_STATUSES } } },
        _sum: { quantity: true },
      }),
      // All-time earnings
      prisma.order.aggregate({
        where: { curatorId, status: { in: SOLD_STATUSES } },
        _sum: { curatorAmount: true },
      }),
      // All-time favorites on this curator's products
      prisma.favorite.count({
        where: { product: { curatorId } },
      }),
      // This-month items sold (for delta)
      prisma.orderItem.aggregate({
        where: {
          order: {
            curatorId,
            status: { in: SOLD_STATUSES },
            createdAt: { gte: startOfCurrentMonth },
          },
        },
        _sum: { quantity: true },
      }),
      // This-month earnings (for delta)
      prisma.order.aggregate({
        where: {
          curatorId,
          status: { in: SOLD_STATUSES },
          createdAt: { gte: startOfCurrentMonth },
        },
        _sum: { curatorAmount: true },
      }),
      // This-month favorites (for delta)
      prisma.favorite.count({
        where: {
          product: { curatorId },
          createdAt: { gte: startOfCurrentMonth },
        },
      }),
      // Last-month items sold (for delta)
      prisma.orderItem.aggregate({
        where: {
          order: {
            curatorId,
            status: { in: SOLD_STATUSES },
            createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
          },
        },
        _sum: { quantity: true },
      }),
      // Last-month earnings (for delta)
      prisma.order.aggregate({
        where: {
          curatorId,
          status: { in: SOLD_STATUSES },
          createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
        },
        _sum: { curatorAmount: true },
      }),
      // Last-month favorites (for delta)
      prisma.favorite.count({
        where: {
          product: { curatorId },
          createdAt: { gte: startOfLastMonth, lt: startOfCurrentMonth },
        },
      }),
      // Recent orders for activity feed
      prisma.order.findMany({
        where: { curatorId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            take: 1,
            include: { product: { select: { title: true } } },
          },
        },
      }),
      // Recent favorites for activity feed
      prisma.favorite.findMany({
        where: { product: { curatorId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { title: true } } },
      }),
    ]);

    // Aggregate totals
    const itemsSold = itemsSoldAll._sum.quantity ?? 0;
    const earnings = parseFloat((earningsAll._sum.curatorAmount ?? 0).toFixed(2));

    // Month-over-month delta values
    const currentItems = itemsSoldThisMonth._sum.quantity ?? 0;
    const lastItems = itemsSoldLastMonth._sum.quantity ?? 0;
    const currentEarnings = earningsThisMonth._sum.curatorAmount ?? 0;
    const lastEarnings = earningsLastMonth._sum.curatorAmount ?? 0;

    // Build and sort combined recent activity list
    type ActivityItem = {
      type: "order" | "favorite" | "review";
      title: string;
      meta: string;
      timeago: string;
      _date: Date;
    };

    const activity: ActivityItem[] = [];

    for (const order of recentOrders) {
      const productTitle = order.items[0]?.product?.title ?? "an item";
      activity.push({
        type: "order",
        title: "New order received",
        meta: `Order for "${productTitle}"`,
        timeago: timeAgo(order.createdAt),
        _date: order.createdAt,
      });
    }

    for (const fav of recentFavorites) {
      activity.push({
        type: "favorite",
        title: "Product favorited",
        meta: `"${fav.product.title}" was added to favorites`,
        timeago: timeAgo(fav.createdAt),
        _date: fav.createdAt,
      });
    }

    activity.sort((a, b) => b._date.getTime() - a._date.getTime());

    const recentActivity = activity.slice(0, 5).map(({ _date: _, ...rest }) => rest);

    const data = {
      storeVisits: 0, // No visit-tracking model in schema yet
      itemsSold,
      earnings,
      favorites: favoritesAll,
      deltas: {
        visits: undefined,
        items: calcDelta(currentItems, lastItems),
        earnings: calcDelta(currentEarnings, lastEarnings),
        favorites: calcDelta(favoritesThisMonth, favoritesLastMonth),
      },
      recentActivity,
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching curator stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
