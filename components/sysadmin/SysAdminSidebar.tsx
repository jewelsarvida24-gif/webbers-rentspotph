'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase_client';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/sysadmin', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/sysadmin/users', label: 'User Accounts', icon: Users, key: 'users' },
  { href: '/sysadmin/reports', label: 'Reports', icon: FileText, key: 'reports' },
];

interface Props {
  active: string;
}

export default function SysAdminSidebar({ active }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-neutral-200 flex flex-col py-6 px-3">
      <Link href="/sysadmin" className="px-3 mb-8">
        <span className="text-lg font-bold text-brand-500">RentSpot</span>
        <span className="text-xs text-neutral-400 block">SysAdmin Portal</span>
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
