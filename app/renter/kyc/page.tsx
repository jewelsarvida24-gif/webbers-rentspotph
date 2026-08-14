'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { createClient } from '@/lib/supabase_client';
import KYCUploadForm from '@/components/renter/KYCUploadForm';

type KYCStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'none';

interface KycRecord {
  id: string;
  document_type: string;
  file_url: string;
  status: KYCStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  expiry_date: string | null;
  created_at: string;
}

export default function KYCPage() {
  const supabase = createClient();
  const [kycRecord, setKycRecord] = useState<KycRecord | null>(null);
  const [status, setStatus] = useState<KYCStatus>('none');
  const [message, setMessage] = useState<string>('Loading your verification status...');
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus('none');
      setMessage('Sign in to check your KYC verification status.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('tbl_kyc')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      setStatus('none');
      setMessage('Unable to load verification status. Please try again later.');
      setLoading(false);
      return;
    }

    const latest = data?.[0] ?? null;

    if (!latest) {
      setStatus('none');
      setMessage('You have not submitted any KYC documents yet. Upload your ID to get started.');
      setLoading(false);
      return;
    }

    const now = new Date();
    const expiry = latest.expiry_date ? new Date(latest.expiry_date) : null;
    let effectiveStatus: KYCStatus = latest.status as KYCStatus;

    if (latest.status === 'approved' && expiry) {
      const daysLeft = differenceInDays(expiry, now);
      if (daysLeft < 0 || daysLeft <= 30) {
        effectiveStatus = 'flagged';
        await supabase.from('tbl_kyc').update({ status: 'flagged' }).eq('id', latest.id);
      }
    }

    setKycRecord(latest);
    setStatus(effectiveStatus);

    switch (effectiveStatus) {
      case 'approved':
        setMessage(
          expiry
            ? `Your KYC is approved and valid until ${format(expiry, 'PPP')}. You may now book available units.`
            : 'Your KYC is approved. You may now book available units.'
        );
        break;
      case 'pending':
        setMessage('Your documents have been received and are under review by the RentSpotPH team.');
        break;
      case 'rejected':
        setMessage('Your document was rejected. Please upload a new file and follow the instructions carefully.');
        break;
      case 'flagged':
        setMessage(
          expiry
            ? `Your KYC needs revalidation because your document expires on ${format(expiry, 'PPP')}. Please upload a new document.`
            : 'Your KYC needs revalidation. Please upload a new document.'
        );
        break;
      default:
        setMessage('You have not submitted any KYC documents yet. Upload your ID to get started.');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold">KYC Verification</h1>
          <p className="text-neutral-600 max-w-2xl">
            Upload your valid ID and supporting documents so RentSpotPH can verify your details.
            Approved KYC is required before you can book rental units.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="card">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold">Verification status</h2>
                <p className="text-sm text-neutral-500">Current status for your latest KYC submission.</p>
              </div>
              <button onClick={loadStatus} className="btn-secondary text-sm px-4 py-2">
                Refresh
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500 mb-1">Status</p>
                <span
                  className={
                    status === 'approved'
                      ? 'badge-confirmed'
                      : status === 'pending' || status === 'none'
                      ? 'badge-pending'
                      : status === 'rejected'
                      ? 'badge-rejected'
                      : 'badge-pending'
                  }
                >
                  {status === 'none' ? 'Not submitted' : status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500 mb-2">Message</p>
                {loading ? (
                  <p className="text-sm text-neutral-600">Checking your verification status...</p>
                ) : (
                  <p className="text-sm text-neutral-700">{message}</p>
                )}
              </div>

              {kycRecord && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <p className="text-sm text-neutral-500 mb-3">Latest submission</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">Document type</p>
                      <p className="mt-1 text-sm text-neutral-700 capitalize">
                        {kycRecord.document_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">Submitted</p>
                      <p className="mt-1 text-sm text-neutral-700">
                        {format(new Date(kycRecord.created_at), 'PPP')}
                      </p>
                    </div>
                    {kycRecord.expiry_date && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Expiry date</p>
                        <p className="mt-1 text-sm text-neutral-700">
                          {format(new Date(kycRecord.expiry_date), 'PPP')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">Document</p>
                      <Link href={kycRecord.file_url} target="_blank" className="text-sm text-brand-500 hover:underline">
                        View file
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Upload new documents</h2>
            <KYCUploadForm onUploadSuccess={loadStatus} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold mb-3">Need help?</h2>
          <p className="text-neutral-600 text-sm">
            If you have questions about what documents are accepted, please contact RentSpotPH support.
            You can also return to{' '}
            <Link href="/guest/browse" className="text-brand-500 hover:underline">
              browse units
            </Link>{' '}
            or visit your{' '}
            <Link href="/renter/my-rentals" className="text-brand-500 hover:underline">
              My Rentals
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}
