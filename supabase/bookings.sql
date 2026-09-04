-- Run this migration in the Supabase SQL editor before using booking requests.
create table if not exists public.tbl_bookings (
  booking_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references public.tbl_units(unit_id),
  start_date date not null,
  end_date date not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  constraint booking_dates_valid check (end_date >= start_date)
);

alter table public.tbl_bookings enable row level security;
drop policy if exists "Users can view their own bookings" on public.tbl_bookings;
create policy "Users can view their own bookings" on public.tbl_bookings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create their own bookings" on public.tbl_bookings;
create policy "Users can create their own bookings" on public.tbl_bookings for insert to authenticated with check (auth.uid() = user_id and status = 'pending');
