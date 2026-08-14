import { createClient } from '@/lib/supabase_server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import KYCReviewTable from '@/components/admin/KYCReviewTable';

export default async function AdminKYCPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from('tbl_kyc')
    .select('*, tbl_users(first_name, last_name, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar active="kyc" />
      <main className="flex-1 p-8">
        <div className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl font-bold">KYC Review Queue</h1>
          <p className="text-neutral-600 max-w-2xl">
            Review uploaded KYC documents, approve verified submissions, or ask renters to resubmit if there are concerns.
          </p>
        </div>

        <div className="card p-0 overflow-hidden">
          <KYCReviewTable documents={documents ?? []} />
        </div>
      </main>
    </div>
  );
}
