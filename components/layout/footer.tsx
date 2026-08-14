// components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 py-10 px-6 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-3">RentSpot.ph</h4>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Equipment booking & rental platform based in Lipa, Batangas.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2">
            <li><Link href="/guest/browse?category=camera" className="hover:text-white transition">Cameras</Link></li>
            <li><Link href="/guest/browse?category=smartphone" className="hover:text-white transition">Smartphones</Link></li>
            <li><Link href="/guest/browse?category=vehicle" className="hover:text-white transition">Vehicles</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2">
            <li><Link href="/guest/faqs" className="hover:text-white transition">FAQs</Link></li>
            <li><Link href="/guest/faqs#contact" className="hover:text-white transition">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2">
            <li><Link href="/auth/login" className="hover:text-white transition">Sign In</Link></li>
            <li><Link href="/auth/register" className="hover:text-white transition">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-neutral-700 text-xs text-neutral-500 text-center">
        © {new Date().getFullYear()} RentSpotPH. All rights reserved. | WEBBERS System — TUP BSIS 3A
      </div>
    </footer>
  );
}