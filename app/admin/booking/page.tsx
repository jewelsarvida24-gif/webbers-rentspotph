// app/admin/bookings/page.tsx
import { createClient } from '@/lib/supabase_server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import BookingsManagementTable from '@/components/admin/BookingsManagementTable';

interface Props {
  searchParams: { status?: string };
}

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Active', value: 'active' },
  { label: 'Ready for Return', value: 'ready_for_return' },
  { label: 'Completed', value: 'completed' },
];

export default async function AdminBookingsPage({ searchParams }: Props) {
  const supabase = await createClient();
  let query = supabase
    .from('tbl_bookings')
    .select('*, tbl_users(first_name, last_name, email), tbl_units(unit_name, category), tbl_payment(payment_status, amount_paid)')
    .order('created_at', { ascending: false });

  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  const { data: bookings } = await query;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar active="bookings" />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Booking Management</h1>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {STATUS_TABS.map(tab => (
            <a key={tab.value}
              href={`/admin/bookings${tab.value ? `?status=${tab.value}` : ''}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                (searchParams.status ?? '') === tab.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300'
              }`}>
              {tab.label}
            </a>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          <BookingsManagementTable bookings={bookings ?? []} />
        </div>
      </main>
    </div>
  );
}