'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase_client';

type UserRole = 'admin' | 'sysadmin' | 'customer';

interface UserAccount {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  created_at: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  admin: 'Admin',
  sysadmin: 'SysAdmin',
};

export default function ManageUserAccounts() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tbl_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Unable to load accounts.');
    } else {
      setUsers(data as UserAccount[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (user_id: string, role: UserRole) => {
    setProcessingId(user_id);
    const { error } = await supabase
      .from('tbl_users')
      .update({ role })
      .eq('user_id', user_id);

    if (error) {
      setError('Failed to update role.');
    } else {
      setUsers((current) =>
        current.map((user) => (user.user_id === user_id ? { ...user, role } : user))
      );
      setError(null);
    }
    setProcessingId(null);
  };

  const revokeAccess = async (user_id: string) => {
    setProcessingId(user_id);
    const { error } = await supabase
      .from('tbl_users')
      .update({ role: 'customer' })
      .eq('user_id', user_id);

    if (error) {
      setError('Failed to revoke access.');
    } else {
      setUsers((current) =>
        current.map((user) =>
          user.user_id === user_id ? { ...user, role: 'customer' } : user
        )
      );
      setError(null);
    }
    setProcessingId(null);
  };

  if (loading) {
    return <p className="text-neutral-500">Loading accounts…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr className="text-xs text-neutral-500 text-left">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-neutral-50 transition">
                <td className="px-5 py-4">
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-xs text-neutral-400">{user.phone_number || 'No phone'}</div>
                </td>
                <td className="px-5 py-4 text-neutral-600">{user.email}</td>
                <td className="px-5 py-4 text-neutral-600">{ROLE_LABELS[user.role]}</td>
                <td className="px-5 py-4 text-neutral-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {user.role !== 'sysadmin' && (
                      <button
                        type="button"
                        onClick={() => updateRole(user.user_id, 'sysadmin')}
                        disabled={processingId === user.user_id}
                        className="rounded-full bg-brand-50 text-brand-700 px-3 py-2 text-xs font-medium hover:bg-brand-100 disabled:opacity-50"
                      >
                        Make SysAdmin
                      </button>
                    )}
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => updateRole(user.user_id, 'admin')}
                        disabled={processingId === user.user_id}
                        className="rounded-full bg-green-50 text-green-700 px-3 py-2 text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                      >
                        Make Admin
                      </button>
                    )}
                    {user.role !== 'customer' && (
                      <button
                        type="button"
                        onClick={() => revokeAccess(user.user_id)}
                        disabled={processingId === user.user_id}
                        className="rounded-full bg-red-50 text-red-700 px-3 py-2 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
