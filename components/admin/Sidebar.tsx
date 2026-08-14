// components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase_client';
import { LayoutDashboard, Users, Gift, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/invitations', label: 'Invitations', icon: Gift },
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-white min-h-screen p-6 sticky top-0">
      {/* Logo */}
      <Link href="/admin/dashboard" className="text-2xl font-bold text-brand-500 block mb-8">
        RentSpot<span className="text-white">.ph</span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === href
                ? 'bg-brand-500 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-300 hover:bg-red-600 hover:text-white transition mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </aside>
  );
}
