import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import type { RentalUnit } from '@/lib/types';

export function UnitCard({ unit }: { unit: RentalUnit }) {
  const image = typeof unit.image_url === 'string' && unit.image_url ? unit.image_url : '/Pics/logo.png';
  const price = typeof unit.price_per_day === 'number' ? `PHP ${unit.price_per_day.toLocaleString()}/day` : 'Price available on request';
  return <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300">
    <div className="relative flex h-44 items-center justify-center bg-neutral-100"><Image src={image} alt={unit.unit_name} fill className="object-contain p-6" unoptimized={image.startsWith('http')} /></div>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{unit.category || 'Rental unit'}</p><h2 className="mt-1 line-clamp-2 font-bold text-neutral-900">{unit.unit_name}</h2></div>{unit.avg_rating ? <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600"><Star className="h-3.5 w-3.5 fill-current" />{unit.avg_rating.toFixed(1)}</span> : null}</div><p className="mt-4 text-sm font-semibold text-neutral-700">{price}</p><Link href={`/guest/browse/${unit.unit_id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">Request to book <ArrowRight className="h-4 w-4" /></Link></div>
  </article>;
}
