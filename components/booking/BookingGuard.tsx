'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase_client';

interface Props {
  unitId: string;
}

type KycStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'none';

export default function BookingGuard({ unitId }: Props) {
  const [status, setStatus] = useState<KycStatus>('none');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('Checking KYC status…');

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus('none');
        setMessage('Sign in to see if you can book this unit.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tbl_kyc')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data?.length) {
        setStatus('none');
        setMessage('You need approved KYC before you can book. Upload your documents now.');
        setLoading(false);
        return;
      }

      const latest = data[0] as { status: KycStatus };
      if (latest.status === 'approved') {
        setStatus('approved');
        setMessage('Your KYC is approved. You may proceed with booking.');
      } else if (latest.status === 'pending') {
        setStatus('pending');
        setMessage('Your KYC submission is still pending review. Booking is disabled until approval.');
      } else if (latest.status === 'rejected') {
        setStatus('rejected');
        setMessage('Your KYC submission was rejected. Please upload a new document.');
      } else {
        setStatus('flagged');
        setMessage('Your KYC has been flagged. Please resubmit your documents to continue.');
      }
      setLoading(false);
    };

    loadStatus();
  }, [unitId]);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Booking requirements</h2>
      <p className="text-neutral-600 text-sm mb-4">RentSpotPH requires verified identity before customers may complete a booking.</p>
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm text-neutral-500 mb-1">KYC status</p>
        <p className="text-sm text-neutral-700">{loading ? 'Checking your verification status…' : message}</p>
      </div>

      {loading ? null : (
        <div className="space-y-3">
          {!status || status === 'none' ? (
            <Link href="/renter/kyc" className="btn-primary w-full text-center">
              Complete KYC to book
            </Link>
          ) : status === 'approved' ? (
            <button type="button" disabled className="btn-primary w-full opacity-80">
              KYC verified — booking flow available
            </button>
          ) : (
            <Link href="/renter/kyc" className="btn-secondary w-full text-center">
              Update KYC documents
            </Link>
          )}
          <p className="text-xs text-neutral-500">
            Note: This unit cannot be reserved until your KYC status is approved.
          </p>
        </div>
      )}
    </div>
  );
}
