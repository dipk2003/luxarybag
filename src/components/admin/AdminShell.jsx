import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Instagram,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useMode } from '@/contexts/ModeContext';

const navigation = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Instagram', href: '/admin/instagram', icon: Instagram },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminShell = ({ title, description, action, children }) => {
  const location = useLocation();
  const { logout, user } = useAdminAuth();
  const { mode, toggleMode } = useMode();

  return (
    <div className="min-h-screen bg-[#f4efe8] text-stone-900">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-black/5 bg-stone-950 px-6 py-8 text-white lg:border-b-0 lg:border-r lg:px-8">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Admin</p>
              <p className="font-display text-2xl">LuxeBag</p>
            </div>
          </Link>

          <div className="mt-10 space-y-2">
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-white text-stone-950 shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-white/45">Store mode</p>
            <h3 className="mt-3 font-display text-3xl">{mode}</h3>
            <p className="mt-2 text-sm text-white/65">
              Switch between WhatsApp-first selling and full checkout.
            </p>
            <Button
              type="button"
              onClick={() => void toggleMode(mode === 'GROWTH' ? 'STARTER' : 'GROWTH')}
              className="mt-5 w-full rounded-full bg-white text-stone-950 hover:bg-stone-200"
            >
              Toggle Mode
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.email || 'Admin account'}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Supabase auth</p>
            </div>
            <Button
              type="button"
              onClick={logout}
              variant="ghost"
              className="rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </aside>

        <main className="px-4 py-5 md:px-8 md:py-8">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(28,25,23,0.08)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-4 border-b border-stone-100 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-stone-400">Back office</p>
                <h1 className="mt-2 font-display text-3xl text-stone-950 md:text-5xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
                    {description}
                  </p>
                ) : null}
              </div>
              {action}
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
