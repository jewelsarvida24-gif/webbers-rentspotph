// components/admin/RecentBookingsTable.tsx
import Link from 'next/link';
import { format } from 'date-fns';

const STATUS_CLASSES: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  active: 'badge-active',
  completed: 'badge-completed',
  rejected: 'badge-rejected',
  ready_for_return: 'badge-confirmed',
  cancelled: 'badge-rejected',
};

interface Props {
  bookings: any[];
}

export default function RecentBookingsTable({ bookings }: Props) {
  if (bookings.length === 0) {
    return <p className="text-sm text-neutral-400 py-8 text-center">No bookings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-neutral-500 text-xs">
            <th className="pb-3 font-medium">Booking ID</th>
            <th className="pb-3 font-medium">Renter</th>
            <th className="pb-3 font-medium">Unit</th>
            <th className="pb-3 font-medium">Dates</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {bookings.map((b: any) => (
            <tr key={b.booking_id} className="hover:bg-neutral-50 transition">
              <td className="py-3 font-mono text-xs text-neutral-400">
                #{b.booking_id.slice(0, 8)}
              </td>
              <td className="py-3">
                {b.tbl_users?.first_name} {b.tbl_users?.last_name}
              </td>
              <td className="py-3">
                <span className="capitalize">{b.tbl_units?.unit_name}</span>
              </td>
              <td className="py-3 text-neutral-500">
                {format(new Date(b.start_date), 'MMM d')} – {format(new Date(b.end_date), 'MMM d, yyyy')}
              </td>
              <td className="py-3">
                <span className={STATUS_CLASSES[b.status] ?? 'badge-pending'}>
                  {b.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3">
                <Link href={`/admin/bookings/${b.booking_id}`}
                  className="text-brand-500 hover:underline text-xs font-medium">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}