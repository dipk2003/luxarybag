import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Loader2, Package, Star, Users } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { dashboardService } from '@/modules/admin/dashboardService';
import { formatCurrency, formatDate } from '@/modules/shared/utils/formatters';

const statCards = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'blogPosts', label: 'Blog Posts', icon: FileText },
];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      try {
        const data = await dashboardService.getSummary();
        if (active) {
          setSummary(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell
      title="Dashboard"
      description="A quick overview of catalog activity, captured leads, and recent orders."
    >
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {statCards.map((card) => (
              <div
                key={card.key}
                className="rounded-[28px] border border-stone-100 bg-[#faf7f3] p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                    {card.label}
                  </p>
                  <card.icon className="w-5 h-5 text-stone-500" />
                </div>
                <p className="mt-5 text-4xl font-semibold text-stone-950">
                  {summary?.stats?.[card.key] || 0}
                </p>
              </div>
            ))}
            <div className="rounded-[28px] border border-stone-100 bg-stone-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">Recent revenue</p>
              <p className="mt-5 text-4xl font-semibold">
                {formatCurrency(summary?.stats?.totalRevenue || 0)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_minmax(0,1.05fr)]">
            <div className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                    Recent orders
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-stone-950">
                    Latest incoming orders
                  </h2>
                </div>
                <Link to="/admin/orders" className="text-sm font-semibold text-stone-900">
                  View all
                </Link>
              </div>
              <div className="mt-6 space-y-3">
                {(summary?.recentOrders || []).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 rounded-[24px] bg-white p-4"
                  >
                    <div>
                      <p className="font-semibold text-stone-950">{order.customerName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-400">
                        {order.orderId} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-950">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-stone-400">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-stone-100 bg-[#faf7f3] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Action guide</p>
              <h2 className="mt-2 font-display text-3xl text-stone-950">
                What you can manage here
              </h2>
              <div className="mt-6 grid gap-3">
                {[
                  ['Products', 'Create catalog items, update pricing, and control badges.'],
                  ['Orders', 'Track incoming COD orders and update shipment status.'],
                  ['Leads', 'Export captured emails from the popup and landing pages.'],
                  ['Settings', 'Control brand copy, phone number, and store mode.'],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-[24px] bg-white p-4">
                    <p className="font-semibold text-stone-950">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default AdminDashboard;
