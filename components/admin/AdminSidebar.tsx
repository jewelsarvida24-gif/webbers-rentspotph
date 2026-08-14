// components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Package, FileSearch, LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase_client';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/booking', label: 'Bookings', icon: CalendarCheck, key: 'bookings' },
  { href: '/admin/inventory', label: 'Inventory', icon: Package, key: 'inventory' },
  { href: '/admin/kyc', label: 'KYC', icon: FileSearch, key: 'kyc' },
];

interface Props {
  active: string;
}

export default function AdminSidebar({ active }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-neutral-200 flex flex-col py-6 px-3">
      <Link href="/admin/dashboard" className="px-3 mb-8">
        <span className="text-lg font-bold text-brand-500">RentSpot</span>
        <span className="text-xs text-neutral-400 block">Admin Portal</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, key }) => (
          <Link key={key} href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
              active === key
                ? 'bg-brand-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}>
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition mt-4">
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </aside>
  );
}