// app/admin/auth/register/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase_client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerAdminUser } from '@/app/auth/actions';
import { Shield } from 'lucide-react';

const schema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm_password: z.string(),
  invitation_code: z.string().min(1, 'Invitation code is required'),
}).refine(d => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

function AdminRegisterForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [invitationCode, setInvitationCode] = useState(searchParams?.get('code') || '');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (invitationCode) {
      setValue('invitation_code', invitationCode);
    }
  }, [invitationCode, setValue]);

  const validateInvitationCode = async (code: string) => {
    if (!code) return;
    
    setValidatingCode(true);
    try {
      const { data, error } = await supabase
        .from('tbl_admin_invitations')
        .select('*')
        .eq('code', code)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        setServerError('Invalid or expired invitation code');
      } else {
        setServerError('');
      }
    } catch (err) {
      setServerError('Failed to validate invitation code');
    }
    setValidatingCode(false);
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');

    // Validate invitation code
    const { data: invitation, error: invError } = await supabase
      .from('tbl_admin_invitations')
      .select('*')
      .eq('code', data.invitation_code)
      .eq('status', 'pending')
      .single();

    if (invError || !invitation) {
      setServerError('Invalid or expired invitation code');
      return;
    }

    // Register admin via server action so the verification email is handled by Resend
    const result = await registerAdminUser({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone_number: '',
      password: data.password,
      invitation_code: data.invitation_code,
    });

    if (result.error) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Admin Account Created</h2>
          <p className="text-neutral-500 text-sm mb-6">
            Check your email to verify your account, then sign in to access the admin dashboard.
          </p>
          <Link href="/admin/auth/login" className="btn-primary w-full">Go to Admin Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/admin" className="text-2xl font-bold text-brand-500">RentSpot.ph</Link>
          <h1 className="text-xl font-semibold mt-4 text-neutral-800">Create Admin Account</h1>
          <p className="text-sm text-neutral-500 mt-1">Requires valid invitation</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Invitation Code</label>
              <div className="flex gap-2">
                <input
                  {...register('invitation_code')}
                  className="input-field flex-1"
                  placeholder="Enter invitation code"
                  onChange={(e) => setInvitationCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => validateInvitationCode(invitationCode)}
                  disabled={validatingCode || !invitationCode}
                  className="px-3 py-2.5 bg-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-300 disabled:opacity-50"
                >
                  {validatingCode ? 'Checking...' : 'Verify'}
                </button>
              </div>
              {errors.invitation_code && <p className="text-red-500 text-xs mt-1">{errors.invitation_code.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input {...register('first_name')} className="input-field" placeholder="Juan" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input {...register('last_name')} className="input-field" placeholder="Admin" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" {...register('email')} className="input-field" placeholder="admin@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" {...register('password')} className="input-field" placeholder="Min. 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input type="password" {...register('confirm_password')} className="input-field" placeholder="Repeat password" />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-5">
            <Link href="/admin" className="text-brand-500 font-medium hover:underline">← Back</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdminRegisterForm />
    </Suspense>
  );
}
