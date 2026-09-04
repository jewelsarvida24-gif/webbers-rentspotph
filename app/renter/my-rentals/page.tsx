// app/renter/my-rentals/page.tsx
'use client';

import Navbar from '@/components/layout/navbar';

export default function MyRentalsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Rentals</h1>
        </div>
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <p className="text-neutral-600">Your rentals will appear here...</p>
        </div>
      </div>
    </div>
  );
}
