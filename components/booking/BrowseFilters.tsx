'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const categories = ['All', 'Camera', 'Smartphone', 'Vehicle'];

export function BrowseFilters({ currentCategory, currentSearch }: { currentCategory?: string; currentSearch?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || '');
  const updateFilters = (category?: string, query = search) => {
    const params = new URLSearchParams(searchParams.toString());
    category && category !== 'All' ? params.set('category', category) : params.delete('category');
    query.trim() ? params.set('search', query.trim()) : params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  };
  return <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-2 border-b border-neutral-100 pb-4"><Search className="h-4 w-4 text-neutral-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && updateFilters(currentCategory)} placeholder="Search units" className="min-w-0 flex-1 text-sm outline-none placeholder:text-neutral-400" aria-label="Search rental units" /></div>
    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-neutral-400">Category</p>
    <div className="mt-3 space-y-1">{categories.map((category) => <button key={category} type="button" onClick={() => updateFilters(category)} className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${(currentCategory || 'All') === category ? 'bg-blue-50 text-blue-700' : 'text-neutral-600 hover:bg-neutral-50'}`}>{category}</button>)}</div>
  </div>;
}
