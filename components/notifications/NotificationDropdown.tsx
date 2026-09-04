'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
            <span className="text-xs font-medium text-slate-400">Updates</span>
          </div>
          <div className="py-8 text-center">
            <Bell className="mx-auto h-7 w-7 text-slate-300" strokeWidth={1.6} />
            <p className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</p>
            <p className="mx-auto mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
              Booking and verification updates will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
