"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase_client";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import LogoutConfirmation from "@/components/auth/LogoutConfirmation";

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
  const [logoutOpen, setLogoutOpen] = useState(false);
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

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    setLogoutOpen(false);
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
            href="/"
            className="z-50 shrink-0"
          >
            <img
              src="/images/rentspot-logo.png"
              alt="RentSpotPH Logo"
              className="h-6 w-auto object-contain md:h-7"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-4 text-sm font-semibold md:flex">
            {sessionLoaded && isSignedIn ? (
              <>
                <div className="flex items-center gap-20">
                  <Link href="/renter/dashboard" className={`transition-colors hover:text-blue-700 ${isActivePath('/renter/dashboard') ? 'text-blue-600' : 'text-slate-800'}`}>Dashboard</Link>
                  <Link href="/guest/browse" className={`transition-colors hover:text-blue-600 ${isActivePath('/guest/browse') ? 'text-blue-600' : 'text-slate-800'}`}>Browse Unit</Link>
                  <Link href="/renter/my-rentals" className={`transition-colors hover:text-blue-600 ${isActivePath('/renter/my-rentals') ? 'text-blue-600' : 'text-slate-800'}`}>My Rentals</Link>
                </div>
                <span className="h-5 w-px bg-slate-200" aria-hidden="true" />
                <NotificationDropdown />
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
              <button type="button" onClick={() => setLogoutOpen(true)} className="px-4 py-2 text-slate-600 transition-colors hover:text-slate-900">Log out</button>
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
            { id: 'browse-unit', label: 'Browse Unit', href: '/guest/browse' },
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
            {!sessionLoaded ? null : isSignedIn ? <button type="button" onClick={() => { setLogoutOpen(true); closeMobileMenu(); }} className="w-full rounded-xl border border-slate-300 py-4 text-center text-lg font-bold text-slate-700 transition-colors hover:bg-slate-100">Log out</button> : <>
              <Link href="/auth/login" onClick={closeMobileMenu} className="w-full rounded-xl border-2 border-neutral-800 py-4 text-center text-lg font-bold transition-colors hover:bg-white/40">Log in</Link>
              <Link href="/auth/register" onClick={closeMobileMenu} className="w-full rounded-xl bg-blue-600 py-4 text-center text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700">Sign up</Link>
            </>}
          </div>
        </div>
      )}
      <LogoutConfirmation open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />
    </>
  );
}