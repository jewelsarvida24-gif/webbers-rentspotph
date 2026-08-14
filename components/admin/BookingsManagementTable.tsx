// components/admin/BookingsManagementTable.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  active: 'badge-active',
  ready_for_return: 'badge-confirmed',
  completed: 'badge-completed',
  rejected: 'badge-rejected',
  cancelled: 'badge-rejected',
};

interface Props {
  bookings: any[];
}

export default function BookingsManagementTable({ bookings }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    window.location.reload();
  };

  if (bookings.length === 0) {
    return <p className="text-sm text-neutral-400 py-12 text-center">No bookings found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-100">
          <tr className="text-xs text-neutral-500 text-left">
            {['ID', 'Renter', 'Unit', 'Dates', 'Amount', 'Status', 'Payment', 'Actions'].map(h => (
              <th key={h} className="px-5 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {bookings.map((b: any) => (
            <tr key={b.booking_id} className="hover:bg-neutral-50 transition">
              <td className="px-5 py-3 font-mono text-xs text-neutral-400">#{b.booking_id.slice(0, 8)}</td>
              <td className="px-5 py-3">
                <div className="font-medium">{b.tbl_users?.first_name} {b.tbl_users?.last_name}</div>
                <div className="text-xs text-neutral-400">{b.tbl_users?.email}</div>
              </td>
              <td className="px-5 py-3">
                <div>{b.tbl_units?.unit_name}</div>
                <div className="text-xs text-neutral-400 capitalize">{b.tbl_units?.category}</div>
              </td>
              <td className="px-5 py-3 text-neutral-500 text-xs whitespace-nowrap">
                {format(new Date(b.start_date), 'MMM d')} – {format(new Date(b.end_date), 'MMM d, yyyy')}
              </td>
              <td className="px-5 py-3 font-medium">₱{Number(b.total_amount).toLocaleString()}</td>
              <td className="px-5 py-3">
                <span className={STATUS_BADGE[b.status] ?? 'badge-pending'}>
                  {b.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-5 py-3">
                {b.tbl_payment?.[0] ? (
                  <span className={b.tbl_payment[0].payment_status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>
                    {b.tbl_payment[0].payment_status}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-xs">No payment</span>
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/admin/bookings/${b.booking_id}`} className="text-neutral-400 hover:text-brand-500 transition">
                    <Eye className="w-4 h-4" />
                  </Link>
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(b.booking_id, 'confirmed')}
                        disabled={updating === b.booking_id}
                        aria-label="Confirm booking"
                        title="Confirm booking"
                        className="text-green-500 hover:text-green-700 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => updateStatus(b.booking_id, 'rejected')}
                        disabled={updating === b.booking_id}
                        aria-label="Reject booking"
                        title="Reject booking"
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {b.status === 'ready_for_return' && (
                    <button
                      onClick={() => updateStatus(b.booking_id, 'completed')}
                      disabled={updating === b.booking_id}
                      className="text-xs text-brand-500 hover:underline font-medium">
                      Confirm Return
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}