// components/booking/BookingCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Camera, Smartphone, Car, Calendar, CreditCard } from 'lucide-react';

const STATUS_BADGES: Record<string, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  active: 'badge-active',
  ready_for_return: 'badge-confirmed',
  completed: 'badge-completed',
  rejected: 'badge-rejected',
  cancelled: 'badge-rejected',
};

const CAT_ICONS: Record<string, any> = { camera: Camera, smartphone: Smartphone, vehicle: Car };

interface Props {
  booking: any;
}

export default function BookingCard({ booking }: Props) {
  const unit = booking.tbl_units;
  const payment = booking.tbl_payment?.[0];
  const Icon = CAT_ICONS[unit?.category] ?? Camera;

  return (
    <div className="card flex gap-4">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center">
        {unit?.image_url
          ? <Image src={unit.image_url} alt={unit.unit_name} fill className="object-cover" />
          : <Icon className="w-8 h-8 text-neutral-300" />
        }
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold truncate">{unit?.unit_name}</h3>
            <p className="text-xs text-neutral-500 capitalize">{unit?.category}</p>
          </div>
          <span className={STATUS_BADGES[booking.status] ?? 'badge-pending'}>
            {booking.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(booking.start_date), 'MMM d')} – {format(new Date(booking.end_date), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            ₱{Number(booking.total_amount).toLocaleString()}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Link href={`/renter/booking/${booking.booking_id}`}
            className="text-xs text-brand-500 hover:underline font-medium">
            View Details
          </Link>
          {booking.status === 'active' && (
            <span className="text-xs text-neutral-400">|</span>
          )}
          {booking.status === 'completed' && !booking.tbl_feedbacks?.length && (
            <Link href={`/renter/booking/${booking.booking_id}#review`}
              className="text-xs text-green-600 hover:underline font-medium">
              Leave Review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}