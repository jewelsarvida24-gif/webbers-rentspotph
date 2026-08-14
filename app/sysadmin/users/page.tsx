import SysAdminSidebar from '@/components/sysadmin/SysAdminSidebar';
import ManageUserAccounts from '@/components/sysadmin/ManageUserAccounts';

export default function SysAdminUsersPage() {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <SysAdminSidebar active="users" />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">User Account Management</h1>
          <p className="text-neutral-600 mt-2">Grant, revoke, or adjust admin and sysadmin access from one secure space.</p>
        </div>

        <div className="card p-6">
          <ManageUserAccounts />
        </div>
      </main>
    </div>
  );
}
