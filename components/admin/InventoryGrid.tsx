// components/admin/InventoryGrid.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Smartphone, Car, Star, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { RentalUnit } from '@/index.ts';

const CAT_ICONS: Record<string, any> = { camera: Camera, smartphone: Smartphone, vehicle: Car };

interface Props {
  units: (RentalUnit & { total_bookings: number })[];
}

export default function InventoryGrid({ units }: Props) {
  const [list, setList] = useState(units);

  const toggleAvailability = async (unit: RentalUnit) => {
    const newStatus = unit.status === 'available' ? 'maintenance' : 'available';
    const res = await fetch(`/api/units/${unit.unit_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setList(prev => prev.map(u => u.unit_id === unit.unit_id ? { ...u, status: newStatus } : u));
    }
  };

  if (list.length === 0) {
    return (
      <div className="text-center py-20 text-neutral-400">
        <p>No units yet.</p>
        <Link href="/admin/inventory/new" className="text-brand-500 hover:underline text-sm mt-2 inline-block">Add your first unit</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {list.map(unit => {
        const Icon = CAT_ICONS[unit.category] ?? Camera;
        return (
          <div key={unit.unit_id} className="card p-0 overflow-hidden">
            <div className="relative h-36 bg-neutral-100 flex items-center justify-center">
              {unit.image_url
                ? <Image src={unit.image_url} alt={unit.unit_name} fill className="object-cover" />
                : <Icon className="w-10 h-10 text-neutral-300" />
              }
              <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                unit.status === 'available' ? 'bg-green-100 text-green-700' :
                unit.status === 'Rented' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {unit.status}
              </span>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-sm truncate">{unit.unit_name}</h3>
              <p className="text-xs text-neutral-500 capitalize mt-0.5">{unit.category}</p>

              <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700">₱{unit.daily_rate.toLocaleString()}/day</span>
                {unit.avg_rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {unit.avg_rating.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">{(unit as any).total_bookings} bookings</p>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                <Link href={`/admin/inventory/${unit.unit_id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-neutral-500 hover:text-brand-500 transition">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Link>
                <button onClick={() => toggleAvailability(unit)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs text-neutral-500 hover:text-blue-500 transition">
                  {unit.status === 'available'
                    ? <><ToggleRight className="w-3.5 h-3.5" /> Disable</>
                    : <><ToggleLeft className="w-3.5 h-3.5" /> Enable</>
                  }
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}