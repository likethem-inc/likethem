"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "./KpiCard";
import { ActionCard } from "./ActionCard";
import { RecentActivity } from "./RecentActivity";
import { DollarSign, Eye, Heart, Package, Edit, BarChart3 } from "lucide-react";
import { useT } from "@/hooks/useT";

type StatsData = {
  storeVisits: number;
  itemsSold: number;
  earnings: number;
  favorites: number;
  deltas: {
    visits?: number;
    items?: number;
    earnings?: number;
    favorites?: number;
  };
  recentActivity: Array<{
    type: "order" | "favorite" | "review";
    title: string;
    meta: string;
    timeago: string;
  }>;
};

export function CuratorDashboard({ user }: { user: { name?: string } }) {
  const t = useT();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/curator/stats")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
      <p className="mt-1 text-muted-foreground">
        {user?.name
          ? t('dashboard.welcome.withName', { name: user.name })
          : t('dashboard.welcome.noName')}
      </p>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          label={t('dashboard.kpi.storeVisits')}
          value={data?.storeVisits ?? "—"} 
          deltaPct={data?.deltas?.visits}
          deltaLabel={t('dashboard.kpi.fromLastMonth')}
          icon={<Eye />} 
        />
        <KpiCard 
          label={t('dashboard.kpi.itemsSold')}
          value={data?.itemsSold ?? "—"} 
          deltaPct={data?.deltas?.items}
          deltaLabel={t('dashboard.kpi.fromLastMonth')}
          icon={<Package />} 
        />
        <KpiCard 
          label={t('dashboard.kpi.earnings')}
          value={typeof data?.earnings === "number" ? `$${data.earnings}` : "—"} 
          deltaPct={data?.deltas?.earnings}
          deltaLabel={t('dashboard.kpi.fromLastMonth')}
          icon={<DollarSign />} 
        />
        <KpiCard 
          label={t('dashboard.kpi.favorites')}
          value={data?.favorites ?? "—"} 
          deltaPct={data?.deltas?.favorites}
          deltaLabel={t('dashboard.kpi.fromLastMonth')}
          icon={<Heart />} 
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard 
          title={t('dashboard.actions.manageProducts.title')}
          description={t('dashboard.actions.manageProducts.desc')}
          href="/dashboard/curator/products" 
          icon={<Package className="w-5 h-5" />}
        />
        <ActionCard 
          title={t('dashboard.actions.editStore.title')}
          description={t('dashboard.actions.editStore.desc')}
          href="/dashboard/curator/settings" 
          icon={<Edit className="w-5 h-5" />}
        />
        <ActionCard 
          title={t('dashboard.actions.viewAnalytics.title')}
          description={t('dashboard.actions.viewAnalytics.desc')}
          href="/dashboard/curator/analytics" 
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <ActionCard 
          title={t('dashboard.actions.manageOrders.title')}
          description={t('dashboard.actions.manageOrders.desc')}
          href="/dashboard/curator/orders" 
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Recent activity */}
      <div className="mt-6">
        <RecentActivity
          title={t('dashboard.recentActivity')}
          items={data?.recentActivity ?? []}
        />
      </div>
    </div>
  );
}
