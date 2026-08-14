// components/booking/BrowseFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, Smartphone, Car, LayoutGrid } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', value: '', icon: LayoutGrid },
  { label: 'Cameras', value: 'camera', icon: Camera },
  { label: 'Smartphones', value: 'smartphone', icon: Smartphone },
  { label: 'Vehicles', value: 'vehicle', icon: Car },
];

interface Props {
  currentCategory?: string;
}

export default function BrowseFilters({ currentCategory = '' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCategory = (val: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (val) params.set('category', val);
    else params.delete('category');
    router.push(`/guest/browse?${params.toString()}`);
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">Category</h3>
      <ul className="space-y-1">
        {CATEGORIES.map(({ label, value, icon: Icon }) => (
          <li key={value}>
            <button
              onClick={() => setCategory(value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                (currentCategory ?? '') === value
                  ? 'bg-brand-500 text-white'
                  : 'hover:bg-neutral-100 text-neutral-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}