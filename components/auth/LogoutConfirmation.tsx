'use client';

import { X } from 'lucide-react';

interface LogoutConfirmationProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmation({ open, onCancel, onConfirm }: LogoutConfirmationProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-[2px]" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-bold text-red-600">Please confirm before signing out.</p>
          <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close logout confirmation"><X className="h-5 w-5" /></button>
        </div>
        <h2 id="logout-title" className="mt-5 text-lg font-bold text-slate-900">Are you sure you want to logout?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">You can sign in again anytime to continue managing your rentals.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600">No</button>
          <button type="button" onClick={onConfirm} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Yes, log out</button>
        </div>
      </div>
    </div>
  );
}
