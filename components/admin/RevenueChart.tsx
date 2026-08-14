// components/admin/RevenueChart.tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// Placeholder data — replace with real data from API
const MOCK_DATA = [
  { month: 'Jan', revenue: 8000, bookings: 12 },
  { month: 'Feb', revenue: 12000, bookings: 18 },
  { month: 'Mar', revenue: 9500, bookings: 15 },
  { month: 'Apr', revenue: 15000, bookings: 22 },
  { month: 'May', revenue: 18500, bookings: 28 },
  { month: 'Jun', revenue: 22000, bookings: 34 },
];

export default function RevenueChart() {
  return (
    <div className="card">
      <h2 className="text-base font-semibold mb-4">Revenue & Bookings Trend</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={MOCK_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v: any, name: any) =>
              name === 'revenue' ? [`₱${(v ?? 0).toLocaleString()}`, 'Revenue'] : [v ?? 0, 'Bookings']
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" fill="#c0392b" radius={[4, 4, 0, 0]} name="revenue" />
          <Bar dataKey="bookings" fill="#e0c0be" radius={[4, 4, 0, 0]} name="bookings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}