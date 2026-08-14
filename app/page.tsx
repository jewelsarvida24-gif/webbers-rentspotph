// app/page.tsx — Public landing page

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  Smartphone,
  Car,
  ShieldCheck,
  Clock3,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

const featuredUnits = [
  {
    title: 'Camera Rental',
    category: 'Camera',
    icon: Camera,
  },
  {
    title: 'Smartphone Rental',
    category: 'Smartphone',
    icon: Smartphone,
  },
  {
    title: 'Vehicle Rental',
    category: 'Vehicle',
    icon: Car,
  },
  {
    title: 'Digital Camera',
    category: 'Camera',
    icon: Camera,
  },
  {
    title: 'Latest Smartphone',
    category: 'Smartphone',
    icon: Smartphone,
  },
  {
    title: 'Car Rental',
    category: 'Vehicle',
    icon: Car,
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Safe & Verified',
    description:
      'Verified renters and secure rental transactions help protect every booking.',
  },
  {
    icon: Clock3,
    title: 'Easy & Convenient',
    description:
      'Find available rental units and book according to your schedule.',
  },
  {
    icon: Star,
    title: 'Trusted Rentals',
    description:
      'Make informed choices with ratings and reviews from verified renters.',
  },
];

const heroImages = [
  {
    id: 1,
    src: '/images/hero-1.jpg',
    alt: 'Professional camera rental equipment',
  },
  {
    id: 2,
    src: '/images/hero-2.jpg',
    alt: 'Latest smartphone rental devices',
  },
  {
    id: 3,
    src: '/images/hero-3.jpg',
    alt: 'Premium vehicle rental options',
  },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev: number) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const previous = () => {
    setCurrent((prev: number) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const next = () => {
    setCurrent((prev: number) => (prev + 1) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  return (
    <>
      <Navbar />

      <main className="bg-white text-[#111827]">

        {/* =========================
            HERO
        ========================= */}
        <section className="border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-10">

            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-xl sm:text-xl lg:text-5xl font-bold tracking-tight leading-[1.05] lg:whitespace-nowrap">
                Rent Equipment Easily and Securely
                </h1>
                
                <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-5 text-neutral-600">
                  Browse numerous verified rental units — from digital
                  cameras and smartphones to vehicles — and book with
                  confidence.
                  </p>
                  </div>

            {/* Hero Image Slideshow */}
            <div className="relative mt-8 h-[280px] sm:h-[360px] lg:h-[420px] bg-neutral-200 border border-neutral-300 overflow-hidden">
              {/* Slides Container */}
              <div className="relative w-full h-full">
                {heroImages.map((image, index) => {
                  const isActive = index === current;

                  return (
                    <div
                      key={image.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Previous Button */}
              <button
                onClick={previous}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition transform hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition transform hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      current === index
                        ? 'bg-white w-3 h-3'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75 w-2 h-2'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Hero buttons */}
            <div className="flex justify-center gap-3 py-7">
              <Link
                href="/guest/browse"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
              >
                Browse Units
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#why-rentspot"
                className="inline-flex items-center justify-center border border-neutral-300 text-neutral-700 px-6 py-3 rounded-md text-sm font-semibold hover:bg-neutral-50 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* =========================
            FEATURED RENTAL UNITS
        ========================= */}
        <section id="featured" className="py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Featured Rental Units
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Quisque ornare, condimentum libero vitae.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredUnits.map((unit, index) => {
                const Icon = unit.icon;

                return (
                  <div
                    key={`${unit.title}-${index}`}
                    className="border border-neutral-300 bg-white p-3 hover:shadow-md transition"
                  >
                    {/* Unit image */}
                    <div className="h-52 bg-neutral-200 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-neutral-400" />
                    </div>

                    {/* Unit information */}
                    <div className="pt-4">
                      <p className="text-xs text-neutral-500">
                        {unit.category}
                      </p>

                      <h3 className="font-semibold text-base mt-1">
                        {unit.title}
                      </h3>

                      <Link
                        href="/guest/browse"
                        className="mt-4 block w-full text-center border border-neutral-300 rounded-md py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
                      >
                        View Unit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-8">
              <Link
                href="/guest/browse"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All Rentals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* =========================
            WHY CHOOSE RENTSPOT
        ========================= */}
        <section
          id="why-rentspot"
          className="bg-neutral-100 border-y border-neutral-200 py-14 sm:py-16"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            <h2 className="text-2xl sm:text-3xl font-bold mb-8">
              Why Choose RentSpotPH?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="bg-white border border-neutral-200 p-7 min-h-[190px]"
                  >
                    <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>

                    <h3 className="font-semibold text-lg">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-neutral-500 leading-6 mt-2">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </section>  </main>

      <Footer />
    </>
  );
}