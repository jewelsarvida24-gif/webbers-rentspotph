import { createClient } from '@/lib/supabase_server';
import SysAdminSidebar from '@/components/sysadmin/SysAdminSidebar';

export default async function SysAdminReportsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('tbl_bookings')
    .select('booking_id, total_amount, status, created_at');

  const totalBookings = bookings?.length ?? 0;
  const confirmed = bookings?.filter((booking: any) => booking.status === 'confirmed').length ?? 0;
  const active = bookings?.filter((booking: any) => booking.status === 'active').length ?? 0;
  const completed = bookings?.filter((booking: any) => booking.status === 'completed').length ?? 0;
  const totalRevenue = bookings?.reduce((sum: number, booking: any) => sum + Number(booking.total_amount ?? 0), 0) ?? 0;

  const monthlySummary = (bookings ?? []).reduce((summary: Record<string, { bookings: number; revenue: number }>, booking: any) => {
    const date = new Date(booking.created_at);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!summary[month]) {
      summary[month] = { bookings: 0, revenue: 0 };
    }
    summary[month].bookings += 1;
    summary[month].revenue += Number(booking.total_amount ?? 0);
    return summary;
  }, {});

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <SysAdminSidebar active="reports" />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Summary Reports</h1>
          <p className="text-neutral-600 mt-2">Generate executive reports from the secure SysAdmin domain.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <div className="card">
            <p className="text-sm text-neutral-500">Total bookings</p>
            <p className="mt-3 text-3xl font-semibold">{totalBookings}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Confirmed</p>
            <p className="mt-3 text-3xl font-semibold">{confirmed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Active</p>
            <p className="mt-3 text-3xl font-semibold">{active}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Completed</p>
            <p className="mt-3 text-3xl font-semibold">{completed}</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue summary</h2>
          <p className="text-neutral-600 mb-6">Total revenue from all bookings.</p>
          <div className="text-4xl font-semibold">₱{totalRevenue.toLocaleString()}</div>
        </div>

        <div className="card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Monthly breakdown</h2>
          <div className="space-y-4">
            {(Object.entries(monthlySummary) as Array<[string, { bookings: number; revenue: number }]>).map(([month, stats]) => (
              <div key={month} className="rounded-2xl border border-neutral-200 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{month}</p>
                  <p className="text-sm text-neutral-500">{stats.bookings} bookings</p>
                </div>
                <p className="text-neutral-900 font-semibold">₱{stats.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
