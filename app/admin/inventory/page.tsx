// app/admin/inventory/page.tsx
import { createClient } from '@/lib/supabase_server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import InventoryGrid from '@/components/admin/InventoryGrid';

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data: units } = await supabase
    .from('tbl_units')
    .select('*, tbl_feedbacks(rating), tbl_bookings(booking_id)')
    .order('created_at', { ascending: false });

  const processedUnits = (units ?? []).map((u: any) => ({
    ...u,
    avg_rating: u.tbl_feedbacks?.length
      ? u.tbl_feedbacks.reduce((s: number, f: any) => s + f.rating, 0) / u.tbl_feedbacks.length
      : null,
    total_bookings: u.tbl_bookings?.length ?? 0,
  }));

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar active="inventory" />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <a href="/admin/inventory/new" className="btn-primary text-sm px-4 py-2">+ Add Unit</a>
        </div>
        <InventoryGrid units={processedUnits} />
      </main>
    </div>
  );
}