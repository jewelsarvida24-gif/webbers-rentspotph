"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase_client";

const navLinks = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "browse", label: "Browse", href: "/#browse" },
  { id: "why-rentspot", label: "About Us", href: "/#why-rentspot" },
  { id: "contact", label: "Contact Us", href: "/#contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (active) {
        setIsSignedIn(Boolean(session));
        setSessionLoaded(true);
      }
    };

    loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
      setSessionLoaded(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* HEADER / NAVBAR — glassmorphism */}
      <nav className="sticky top-0 z-50 border-b border-white/30 bg-white/60 shadow-sm backdrop-blur-lg backdrop-saturate-150">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:py-5 lg:px-10">
          {/* LOGO */}
          <Link
            href="public/images/"
            className="z-50 shrink-0"
          >
            <img
              src="/images/rentspot-logo.png"
              alt="RentSpotPH Logo"
              className="h-6 w-auto object-contain md:h-7"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            {sessionLoaded && isSignedIn ? (
              <>
                <Link href="/renter/dashboard" className={`transition-colors hover:text-blue-700 ${isActivePath('/renter/dashboard') ? 'text-blue-600' : 'text-slate-800'}`}>Dashboard</Link>
                <Link href="/guest/browse" className={`transition-colors hover:text-blue-600 ${isActivePath('/guest/browse') ? 'text-blue-600' : 'text-slate-800'}`}>Browse Rentals</Link>
                <Link href="/renter/my-rentals" className={`transition-colors hover:text-blue-600 ${isActivePath('/renter/my-rentals') ? 'text-blue-600' : 'text-slate-800'}`}>My Rentals</Link>
                <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((open) => !open)}
                    className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                    aria-label="Notifications"
                    aria-expanded={notificationsOpen}
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
                        <span className="text-xs font-medium text-slate-400">Updates</span>
                      </div>
                      <div className="py-8 text-center">
                        <Bell className="mx-auto h-7 w-7 text-slate-300" strokeWidth={1.6} />
                        <p className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</p>
                        <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-slate-500">Booking and verification updates will appear here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : sessionLoaded ? navLinks.map((link) => (
              <Link key={link.id} href={link.href} className="text-neutral-800 transition-colors hover:text-blue-600">
                {link.label}
              </Link>
            )) : null}
          </div>

          {/* DESKTOP AUTH BUTTONS */}
          <div className="hidden items-center gap-6 text-sm font-bold md:flex">
            {!sessionLoaded ? null : isSignedIn ? (
              <button type="button" onClick={handleLogout} className="px-4 py-2 text-neutral-600 transition-colors hover:text-red-600">Log out</button>
            ) : <>
              <Link href="/auth/login" className="px-5 py-2 text-neutral-800 transition-colors hover:text-blue-600">Log in</Link>
              <Link href="/auth/register" className="rounded-full bg-blue-600 px-5 py-2 text-white shadow-sm transition-colors hover:bg-blue-700">Sign up</Link>
            </>}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="z-50 rounded-lg p-2 text-neutral-800 transition-colors hover:bg-white/40 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU — glassy too, for consistency */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex h-screen flex-col gap-6 overflow-y-auto bg-white/70 px-6 pt-24 backdrop-blur-xl backdrop-saturate-150 md:hidden">
          {(sessionLoaded && isSignedIn ? [
            { id: 'dashboard', label: 'Dashboard', href: '/renter/dashboard' },
            { id: 'browse-rentals', label: 'Browse Rentals', href: '/guest/browse' },
            { id: 'my-rentals', label: 'My Rentals', href: '/renter/my-rentals' },
          ] : sessionLoaded ? navLinks : []).map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={closeMobileMenu}
              className={`border-b border-neutral-200/60 pb-4 text-2xl font-bold transition-colors hover:text-blue-600 ${isSignedIn ? (isActivePath(link.href) ? "text-blue-600" : "text-neutral-800") : "text-neutral-800"}`}
            >
              {link.label}
            </Link>
          ))}

          {/* MOBILE AUTH BUTTONS */}
          <div className="mt-8 flex flex-col gap-4">
            {!sessionLoaded ? null : isSignedIn ? <button type="button" onClick={() => { handleLogout(); closeMobileMenu(); }} className="w-full rounded-xl border-2 border-red-200 py-4 text-center text-lg font-bold text-red-600 transition-colors hover:bg-red-50">Log out</button> : <>
              <Link href="/auth/login" onClick={closeMobileMenu} className="w-full rounded-xl border-2 border-neutral-800 py-4 text-center text-lg font-bold transition-colors hover:bg-white/40">Log in</Link>
              <Link href="/auth/register" onClick={closeMobileMenu} className="w-full rounded-xl bg-blue-600 py-4 text-center text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700">Sign up</Link>
            </>}
          </div>
        </div>
      )}
    </>
  );
}