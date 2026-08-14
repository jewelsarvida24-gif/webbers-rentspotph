import { createClient } from '@/lib/supabase_server';
import SysAdminSidebar from '@/components/sysadmin/SysAdminSidebar';

export default async function SysAdminDashboardPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from('tbl_users').select('role');
  const { data: bookings } = await supabase.from('tbl_bookings').select('booking_id');

  const totalUsers = users?.length ?? 0;
  const totalAdmins = users?.filter((user: any) => user.role === 'admin').length ?? 0;
  const totalSysadmins = users?.filter((user: any) => user.role === 'sysadmin').length ?? 0;
  const totalBookings = bookings?.length ?? 0;

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <SysAdminSidebar active="dashboard" />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">SysAdmin Dashboard</h1>
          <p className="text-neutral-600 mt-2">Manage administrative access and generate summary reports from a dedicated security domain.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card">
            <p className="text-sm text-neutral-500">Total users</p>
            <p className="mt-3 text-3xl font-semibold">{totalUsers}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Admin accounts</p>
            <p className="mt-3 text-3xl font-semibold">{totalAdmins}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">SysAdmin accounts</p>
            <p className="mt-3 text-3xl font-semibold">{totalSysadmins}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Bookings on file</p>
            <p className="mt-3 text-3xl font-semibold">{totalBookings}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
