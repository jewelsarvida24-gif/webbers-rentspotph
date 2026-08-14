// components/booking/UnitCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Star, Camera, Smartphone, Car } from 'lucide-react';
import type { RentalUnit } from '@//index.ts';

const categoryIcons = {
  camera: Camera,
  smartphone: Smartphone,
  vehicle: Car,
};

interface Props {
  unit: RentalUnit;
}

export default function UnitCard({ unit }: Props) {
  const Icon = categoryIcons[unit.category] ?? Camera;

  return (
    <Link href={`/guest/browse/${unit.unit_id}`}
      className="card hover:shadow-md hover:border-brand-300 transition group flex flex-col p-0 overflow-hidden">
      {/* Image */}
      <div className="relative h-44 bg-neutral-100 flex items-center justify-center overflow-hidden">
        {unit.image_url ? (
          <Image src={unit.image_url} alt={unit.unit_name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <Icon className="w-12 h-12 text-neutral-300" />
        )}
        <span className="absolute top-3 left-3 bg-white text-brand-600 text-xs font-semibold px-2 py-1 rounded-full capitalize shadow-sm">
          {unit.category}
        </span>
        {unit.status !== 'available' && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
            Unavailable
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-neutral-800 truncate">{unit.unit_name}</h3>
        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{unit.description}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-brand-600 font-bold text-sm">
            ₱{unit.daily_rate.toLocaleString()}<span className="text-neutral-400 font-normal">/day</span>
          </span>
          {unit.avg_rating && (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {unit.avg_rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}