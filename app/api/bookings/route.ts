import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase_server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in to request a booking.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const { unitId, startDate, endDate, notes } = body || {};
  if (!unitId || !startDate || !endDate || new Date(endDate) < new Date(startDate)) return NextResponse.json({ error: 'A valid unit and rental date range are required.' }, { status: 400 });
  const { data: unit } = await supabase.from('tbl_units').select('unit_id').eq('unit_id', unitId).eq('status', 'available').maybeSingle();
  if (!unit) return NextResponse.json({ error: 'This rental unit is no longer available.' }, { status: 409 });
  const { error } = await supabase.from('tbl_bookings').insert({ user_id: user.id, unit_id: unitId, start_date: startDate, end_date: endDate, notes: notes?.trim() || null, status: 'pending' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 201 });
}
