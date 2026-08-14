// app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase_client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Mail, Copy, Check } from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [newInvitationEmail, setNewInvitationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadInvitations();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadInvitations = async () => {
    const { data } = await supabase
      .from('tbl_admin_invitations')
      .select('*')
      .order('created_at', { ascending: false });
    setInvitations(data || []);
  };

  const generateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvitationEmail) return;

    setLoading(true);
    try {
      const code = Math.random().toString(36).substring(2, 12).toUpperCase();
      const { error } = await supabase.from('tbl_admin_invitations').insert({
        code,
        email: newInvitationEmail,
        status: 'pending',
        created_by: user?.id,
      });

      if (!error) {
        setNewInvitationEmail('');
        loadInvitations();
      }
    } catch (err) {
      console.error('Failed to generate invitation:', err);
    }
    setLoading(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar active="dashboard" />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Invitation Generator */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate Admin Invitations</h2>
          <form onSubmit={generateInvitation} className="flex gap-3">
            <input
              type="email"
              value={newInvitationEmail}
              onChange={(e) => setNewInvitationEmail(e.target.value)}
              placeholder="admin@example.com"
              className="input-field flex-1"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary px-6">
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </div>

        {/* Invitations List */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Invitations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-left py-2 px-3">Code</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Created</th>
                  <th className="text-left py-2 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-neutral-500">
                      No invitations generated yet
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-neutral-50">
                      <td className="py-3 px-3">{inv.email}</td>
                      <td className="py-3 px-3 font-mono text-xs bg-neutral-100 px-2 py-1 rounded w-fit">
                        {inv.code}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          inv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          inv.status === 'used' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-neutral-500">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => copyCode(inv.code)}
                          className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
                        >
                          {copiedCode === inv.code ? (
                            <>
                              <Check className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
