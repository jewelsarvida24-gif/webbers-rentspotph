// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase_client';
import { Menu, X, Bell, LogOut, User } from 'lucide-react';
import type { User as AppUser } from '@/index.ts';

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

 useEffect(() => {
  supabase.auth.getUser().then(({ data: { user: authUser } }: any) => {
    if (authUser) {
      supabase
        .from('tbl_users')
        .select('*')
        .eq('user_id', authUser.id)
        .single()
        .then(({ data }: any) => setUser(data));
    }
  });
}, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <img
            src="/images/rentspot-logo.png"
            alt="RentSpot.ph"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/guest/browse" className="hover:text-brand-500 transition">Browse</Link>
          <Link href="/guest/faqs" className="hover:text-brand-500 transition">FAQs</Link>
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="hover:text-brand-500 transition">Admin</Link>
          )}
          {user?.role === 'sysadmin' && (
            <Link href="/sysadmin" className="hover:text-brand-500 transition">SysAdmin</Link>
          )}
          {user?.role === 'customer' && (
            <Link href="/renter/my-rentals" className="hover:text-brand-500 transition">My Rentals</Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/renter/my-rentals" className="text-neutral-500 hover:text-brand-500">
                <Bell className="w-5 h-5" />
              </Link>
              <span className="text-sm text-neutral-600">
                {user.first_name}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-500 transition">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 py-4 border-t border-neutral-100 flex flex-col gap-3 text-sm">
          <Link href="/guest/browse" onClick={() => setMenuOpen(false)}>Browse</Link>
          <Link href="/guest/faqs" onClick={() => setMenuOpen(false)}>FAQs</Link>
          {user ? (
            <>
              <Link href="/renter/my-rentals" onClick={() => setMenuOpen(false)}>My Rentals</Link>
              <button onClick={handleLogout} className="text-left text-red-500">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Sign In</Link>
              <Link href="/auth/register">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
