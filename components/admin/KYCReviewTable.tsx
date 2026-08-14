'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase_client';
import { CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import DocumentViewer from '@/components/admin/DocumentViewer';

interface KycDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewed_by: string | null;
  reviewed_at: string | null;
  expiry_date: string | null;
  created_at: string;
  tbl_users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Props {
  documents: KycDocument[];
}

const STATUS_BADGES: Record<string, string> = {
  pending: 'badge-pending',
  approved: 'badge-confirmed',
  rejected: 'badge-rejected',
  flagged: 'badge-pending',
};

const REVIEW_LABELS: Record<string, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  flagged: 'Flagged',
};

export default function KYCReviewTable({ documents }: Props) {
  const [items, setItems] = useState<KycDocument[]>(documents);
  const [viewerDocument, setViewerDocument] = useState<KycDocument | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const supabase = createClient();

  const reviewDocument = async (doc: KycDocument, newStatus: 'approved' | 'rejected' | 'flagged') => {
    setProcessing(doc.id);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setProcessing(null);
      alert('Unable to identify your admin account. Please sign in again.');
      return;
    }

    const reviewTime = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('tbl_kyc')
      .update({ status: newStatus, reviewed_by: user.id, reviewed_at: reviewTime })
      .eq('id', doc.id);

    if (updateError) {
      setProcessing(null);
      alert('Failed to update document status. Please try again.');
      return;
    }

    const notificationMessage =
      newStatus === 'approved'
        ? 'Your KYC document has been approved. You may now proceed with bookings.'
        : newStatus === 'rejected'
        ? 'Your KYC submission was rejected. Please upload a new valid document.'
        : 'Your KYC has been flagged for reverification. Please resubmit your documents.';

    await supabase.from('tbl_notifications').insert({
      user_id: doc.user_id,
      message: notificationMessage,
      type: newStatus === 'approved' ? 'kyc_approved' : newStatus === 'rejected' ? 'kyc_rejected' : 'kyc_resubmit',
      is_read: false,
      created_at: reviewTime,
    });

    setItems((current) =>
      current.map((item) =>
        item.id === doc.id
          ? { ...item, status: newStatus, reviewed_by: user.id, reviewed_at: reviewTime }
          : item
      )
    );
    setProcessing(null);
  };

  if (!items.length) {
    return <p className="text-sm text-neutral-400 py-12 text-center">No KYC submissions found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-100">
          <tr className="text-xs text-neutral-500 text-left">
            {['Renter', 'Document', 'Submitted', 'Expiry', 'Status', 'Actions'].map((heading) => (
              <th key={heading} className="px-5 py-3 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {items.map((doc) => (
            <tr key={doc.id} className="hover:bg-neutral-50 transition">
              <td className="px-5 py-3">
                <div className="font-medium">
                  {doc.tbl_users?.first_name} {doc.tbl_users?.last_name}
                </div>
                <div className="text-xs text-neutral-400">{doc.tbl_users?.email}</div>
              </td>
              <td className="px-5 py-3 capitalize">{doc.document_type.replace(/_/g, ' ')}</td>
              <td className="px-5 py-3 text-neutral-500">{format(new Date(doc.created_at), 'PPP')}</td>
              <td className="px-5 py-3 text-neutral-500">
                {doc.expiry_date ? format(new Date(doc.expiry_date), 'PPP') : 'N/A'}
              </td>
              <td className="px-5 py-3">
                <span className={STATUS_BADGES[doc.status] ?? 'badge-pending'}>
                  {doc.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewerDocument(doc)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-100"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewDocument(doc, 'approved')}
                    disabled={processing === doc.id}
                    className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 px-3 py-2 text-xs font-medium hover:bg-green-100 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewDocument(doc, 'rejected')}
                    disabled={processing === doc.id}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 text-red-700 px-3 py-2 text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewDocument(doc, 'flagged')}
                    disabled={processing === doc.id}
                    className="inline-flex items-center gap-2 rounded-full bg-yellow-50 text-yellow-800 px-3 py-2 text-xs font-medium hover:bg-yellow-100 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Flag
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {viewerDocument && (
        <DocumentViewer
          src={viewerDocument.file_url}
          title={`${viewerDocument.tbl_users?.first_name ?? 'Document'} ${viewerDocument.document_type}`}
          onClose={() => setViewerDocument(null)}
        />
      )}
    </div>
  );
}
