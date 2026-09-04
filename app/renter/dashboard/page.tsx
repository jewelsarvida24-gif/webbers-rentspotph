import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import { createClient } from '@/lib/supabase_server';

const kycStatusStyles: Record<string, string> = {
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'In Review': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Pending: 'bg-neutral-100 text-neutral-700 ring-neutral-600/20',
  Declined: 'bg-red-50 text-red-700 ring-red-600/20',
};

export default async function RenterDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirectTo=/renter/dashboard');

  const [{ data: profile }, { data: kycSubmission }] = await Promise.all([
    supabase
      .from('tbl_users')
      .select('first_name, last_name, email, phone_number')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('tbl_kyc_submissions')
      .select('status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const firstName = profile?.first_name || user.user_metadata?.first_name || 'there';
  const kycStatus = kycSubmission?.status || 'Not started';
  const kycStatusClass = kycStatusStyles[kycStatus] || 'bg-neutral-100 text-neutral-700 ring-neutral-600/20';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="mx-auto grid max-w-[1280px] gap-8 px-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{firstName.charAt(0).toUpperCase()}</div>
            <div className="min-w-0"><p className="truncate font-bold text-neutral-900">{firstName}</p><p className="truncate text-xs text-neutral-500">{profile?.email || user.email}</p></div>
          </div>
          <nav className="mt-5 space-y-1 text-sm font-medium">
            <Link href="/renter/dashboard" className="block rounded-md bg-blue-50 px-3 py-2 text-blue-700">Dashboard</Link>
            <Link href="/renter/my-rentals" className="block rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-50">My Rentals</Link>
            <Link href="/guest/browse" className="block rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-50">Browse Units</Link>
            <Link href="/renter/kyc" className="block rounded-md px-3 py-2 text-neutral-600 hover:bg-neutral-50">Verification</Link>
          </nav>
        </aside>
        <div>
        <section className="rounded-lg border border-neutral-200 bg-white px-6 py-7 shadow-sm sm:px-8">
          <p className="text-sm text-neutral-500">User Portal</p>
          <div className="mt-1 flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Welcome back, {firstName}.</h1>
              <p className="mt-2 text-sm text-neutral-500">Manage your account and rental activity.</p>
            </div>
            <Link href="/guest/browse" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600">
              Browse rentals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs uppercase tracking-wider text-neutral-400">Account</p><p className="mt-1 font-semibold text-neutral-900">Renter</p></div>
            <div><p className="text-xs uppercase tracking-wider text-neutral-400">Verification</p><p className="mt-1 font-semibold text-neutral-900">{kycStatus}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-neutral-400">Email</p><p className="mt-1 truncate font-semibold text-neutral-900">{profile?.email || user.email}</p></div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <Link href="/renter/my-rentals" className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white"><CalendarRange className="h-5 w-5" /></span>
            <h2 className="mt-5 text-lg font-bold text-neutral-900">My rentals</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">View your current and past rental activity.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">Open rentals <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>

          <Link href="/renter/kyc" className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="h-5 w-5" /></span>
            <h2 className="mt-5 text-lg font-bold text-neutral-900">Identity verification</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${kycStatusClass}`}>{kycStatus}</span>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">Manage verification <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>

          <Link href="/guest/browse" className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-800"><Compass className="h-5 w-5" /></span>
            <h2 className="mt-5 text-lg font-bold text-neutral-900">Browse units</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">Explore available cameras, smartphones, and vehicles.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">Browse catalog <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">Rental activity</p>
                <h2 className="mt-1 text-2xl font-bold text-neutral-900">Your rentals</h2>
              </div>
              <ClipboardCheck className="h-6 w-6 text-slate-300" />
            </div>
            <div className="mt-8 border-t border-dashed border-neutral-200 pt-8 text-center">
              <p className="text-base font-semibold text-neutral-800">No rentals yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">When you book a unit, its status and schedule will appear here.</p>
              <Link href="/guest/browse" className="mt-5 inline-flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700">
                Explore available units <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="rounded-xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white"><ClipboardCheck className="h-5 w-5" /></span>
            <h2 className="mt-5 text-xl font-bold text-neutral-900">Ready to rent?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">A verified account helps keep every rental transaction secure.</p>
            {kycStatus === 'Approved' ? (
              <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Your identity is verified.</p>
            ) : (
              <Link href="/renter/kyc" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">Complete verification <ArrowRight className="h-4 w-4" /></Link>
            )}
          </aside>
        </section>
        </div>
      </main>
    </div>
  );
}