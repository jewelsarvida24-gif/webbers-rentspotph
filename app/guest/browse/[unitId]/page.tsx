import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import BookingGuard from '@/components/booking/BookingGuard';
import { createClient } from '@/lib/supabase_server';
import { Camera, Smartphone, Car, Star } from 'lucide-react';

const categoryIcons: Record<string, typeof Camera> = {
  camera: Camera,
  smartphone: Smartphone,
  vehicle: Car,
};

interface Props {
  params: { unitId: string };
}

export default async function UnitDetailsPage({ params }: Props) {
  const supabase = await createClient();
  const { data: unit } = await supabase
    .from('tbl_units')
    .select('*, tbl_feedbacks(rating)')
    .eq('unit_id', params.unitId)
    .single();

  if (!unit) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-50 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold">Unit not found</h1>
            <p className="text-neutral-600 mt-3">The unit you are looking for does not exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = categoryIcons[unit.category] ?? Camera;
  const avgRating = unit.tbl_feedbacks?.length
    ? unit.tbl_feedbacks.reduce((sum: number, item: any) => sum + item.rating, 0) / unit.tbl_feedbacks.length
    : null;

  return (
    <>
      <Navbar />
      <main className="bg-neutral-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
          <section className="space-y-6">
            <div className="card p-0 overflow-hidden">
              <div className="relative h-80 bg-neutral-100 flex items-center justify-center overflow-hidden">
                {unit.image_url ? (
                  <img src={unit.image_url} alt={unit.unit_name} className="h-full w-full object-cover" />
                ) : (
                  <Icon className="w-16 h-16 text-neutral-300" />
                )}
                <span className="absolute top-4 left-4 bg-white text-brand-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm capitalize">
                  {unit.category}
                </span>
                {unit.status !== 'available' && (
                  <span className="absolute inset-x-0 bottom-4 mx-auto inline-flex rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
                    Unavailable
                  </span>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold mb-3">{unit.unit_name}</h1>
                <p className="text-sm text-neutral-500 mb-5">{unit.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {avgRating ? avgRating.toFixed(1) : 'No ratings yet'}
                  </span>
                  <span>Daily rate: <strong className="text-neutral-900">₱{Number(unit.daily_rate).toLocaleString()}</strong></span>
                  <span>Status: <strong className="capitalize">{unit.status}</strong></span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-3">Booking guidance</h2>
              <p className="text-neutral-600 text-sm">
                Before booking, make sure your KYC details are approved so RentSpotPH can verify your identity. If your KYC is pending or rejected, you can update it from your renter dashboard.
              </p>
            </div>
          </section>

          <aside>
            <BookingGuard unitId={params.unitId} />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
