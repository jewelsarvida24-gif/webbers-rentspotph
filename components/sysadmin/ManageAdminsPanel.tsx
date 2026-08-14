// components/sysadmin/ManageAdminsPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase_client';
import { User, Eye, EyeOff, Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';
import type { User as AppUser } from '@/index.ts';

interface AdminUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  status: string;
  created_at: string;
}

export default function ManageAdminsPanel() {
  const supabase = createClient();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [sysadminUser, setSysadminUser] = useState<AppUser | null>(null);

  // Form state for creating new admin
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch current sysadmin and existing admins
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current sysadmin
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: userData } = await supabase
            .from('tbl_users')
            .select('*')
            .eq('user_id', authUser.id)
            .single();
          setSysadminUser(userData);
        }

        // Fetch all admins
        const { data, error } = await supabase
          .from('tbl_users')
          .select('*')
          .eq('role', 'admin')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAdmins(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Invalid email address');
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
        },
      });

      if (authError) {
        setFormError(authError.message);
        setIsCreating(false);
        return;
      }

      // Step 2: Create user record in tbl_users
      if (authData.user) {
        const { error: dbError } = await supabase.from('tbl_users').insert({
          user_id: authData.user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          role: 'admin',
          status: 'active',
          created_by: sysadminUser?.user_id,
        });

        if (dbError) throw dbError;

        // Step 3: Log to sysadmin audit log
        await supabase.from('tbl_sysadmin_audit_log').insert({
          sysadmin_id: sysadminUser?.user_id,
          action: 'admin_created',
          target_user_id: authData.user.id,
          details: {
            email: formData.email,
            name: `${formData.first_name} ${formData.last_name}`,
          },
        });

        // Step 4: Refresh admin list and reset form
        const { data: newAdmins } = await supabase
          .from('tbl_users')
          .select('*')
          .eq('role', 'admin')
          .order('created_at', { ascending: false });

        setAdmins(newAdmins || []);

        setFormSuccess(`Admin "${formData.first_name} ${formData.last_name}" created successfully!`);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          password: '',
          confirmPassword: '',
        });

        setTimeout(() => setFormSuccess(''), 5000);
      }
    } catch (error: any) {
      setFormError(error.message || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  // Remove admin
  const handleRemoveAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Remove admin "${adminName}"? This cannot be undone.`)) return;

    try {
      // Update user role to customer
      const { error } = await supabase
        .from('tbl_users')
        .update({ role: 'customer', status: 'inactive' })
        .eq('user_id', adminId);

      if (error) throw error;

      // Log to audit
      await supabase.from('tbl_sysadmin_audit_log').insert({
        sysadmin_id: sysadminUser?.user_id,
        action: 'admin_removed',
        target_user_id: adminId,
        details: { email: admins.find(a => a.user_id === adminId)?.email },
      });

      // Refresh list
      const { data: newAdmins } = await supabase
        .from('tbl_users')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      setAdmins(newAdmins || []);
      setFormSuccess(`Admin "${adminName}" removed successfully`);
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (error: any) {
      setFormError(error.message || 'Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Create Admin Form */}
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-brand-600" />
          Create New Admin Account
        </h2>

        {formError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        {formSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">{formSuccess}</p>
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="admin@rentspot.ph"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="09XXXXXXXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-brand-600 text-white font-medium py-2 rounded-lg hover:bg-brand-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Creating Admin...' : 'Create Admin Account'}
          </button>
        </form>
      </div>

      {/* Existing Admins List */}
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-brand-600" />
          Existing Admin Accounts ({admins.length})
        </h2>

        {admins.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">No admin accounts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-700">Created</th>
                  <th className="px-4 py-3 text-right font-semibold text-neutral-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {admins.map((admin) => (
                  <tr key={admin.user_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">
                        {admin.first_name} {admin.last_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{admin.email}</td>
                    <td className="px-4 py-3 text-neutral-600">{admin.phone_number}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          admin.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemoveAdmin(admin.user_id, `${admin.first_name} ${admin.last_name}`)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
