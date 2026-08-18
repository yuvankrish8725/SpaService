'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, BranchResponse, SpaServiceResponse } from '@/lib/api';
import { Sparkles, MapPin, Clock, ArrowRight, ShieldCheck, HeartHandshake, CheckCircle2, Lock, Star, ChevronRight } from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';
import BookingModal from '@/components/BookingModal';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranchForUnlock, setSelectedBranchForUnlock] = useState<BranchResponse | null>(null);
  const [selectedBranchForBooking, setSelectedBranchForBooking] = useState<BranchResponse | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<BranchResponse[]>('/branches').catch(() => []),
      apiFetch<SpaServiceResponse[]>('/services').catch(() => []),
    ])
      .then(([branchesData, servicesData]) => {
        setBranches(branchesData);
        setServices(servicesData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-stone-800">
        {/* Background Image with Deep Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-12">
          
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exquisite Wellness Rituals Across Premier Branches</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-stone-100 leading-tight">
            Surrender to <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent italic font-serif">
              Pure Serenity & Healing
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-300 font-light leading-relaxed">
            Experience certified therapists, bespoke aromatherapy, and organic botanical rituals. Real-time therapist daily check-ins, location transparency, and effortless online booking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/branches"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/20 text-sm tracking-wide transition transform hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              <span>Explore Branches & Locations</span>
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold px-8 py-4 rounded-xl text-sm transition"
            >
              <span>View Treatment Menu</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-stone-800/80 max-w-4xl mx-auto">
            <div>
              <div className="font-serif text-3xl font-bold text-amber-200">100%</div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Organic Extracts</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-amber-200">Daily</div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Live Check-ins</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-amber-200">3+</div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Premier Locations</div>
            </div>
            <div>
              <div className="font-serif text-3xl font-bold text-amber-200">4.9 ★</div>
              <div className="text-xs text-stone-400 mt-1 uppercase tracking-wider">Client Rating</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. LOCATIONS / BRANCHES SECTION WITH 📍 LOCATION BADGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Sanctuaries Near You</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
              Our Luxury Spa Branches
            </h2>
            <p className="text-sm text-stone-400 mt-2 max-w-xl">
              Each location offers dedicated therapy suites, shower chambers, certified therapists with live daily presence confirmation.
            </p>
          </div>

          <Link
            href="/branches"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-semibold transition"
          >
            <span>View all locations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {branches.map(b => (
            <div
              key={b.id}
              className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition group hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden"
            >
              <div className="space-y-4">
                
                {/* Location Chip Header */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-amber-950/50 border border-amber-800/40 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.city}, {b.state}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-md">
                    Open Daily
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100 group-hover:text-amber-200 transition">
                    {b.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    {b.address}, Pincode: {b.pincode}
                  </p>
                </div>

                <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-2 text-xs text-stone-300">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Hours:
                    </span>
                    <span className="font-medium text-stone-200">
                      {b.openTime ? b.openTime.substring(0, 5) : '09:00'} - {b.closeTime ? b.closeTime.substring(0, 5) : '21:00'} IST
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Therapists in Roster:</span>
                    <span className="font-bold text-amber-300">{b.staffCount} Specialists</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center gap-3">
                <Link
                  href={`/branches/${b.id}`}
                  className="flex-1 text-center bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  View Branch & Staff
                </Link>
                {b.mapsUrl && (
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Google Maps"
                    className="p-2.5 bg-stone-950 border border-stone-800 hover:border-amber-500/50 text-amber-400 rounded-xl transition"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED SERVICES SHOWCASE */}
      <section className="bg-stone-900/40 border-y border-stone-800/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Signature Therapies
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
              Curated Wellness Rituals
            </h2>
            <p className="text-sm text-stone-400">
              Designed to alleviate chronic strain, awaken your senses, and restore cellular harmony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {services.slice(0, 4).map(s => (
              <div
                key={s.id}
                className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/30 transition group"
              >
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80'}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-sm border border-stone-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {s.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-200 transition">
                      {s.name}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-stone-500 uppercase">{s.durationMinutes} Minutes</div>
                      <div className="font-serif text-lg font-bold text-amber-300">₹{s.price}</div>
                    </div>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-amber-300 transition"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. HOW THE TRANSPARENCY & UNLOCK MODEL WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-8 sm:p-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Trust & Transparency
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-100">
              How Live Therapist Availability Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              We eliminate the guesswork. Know exactly who is on duty before booking your session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200">
                Browse Any Branch For Free
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Explore treatment menus, pricing, branch amenities, operating hours, and verified Google Map locations freely with zero obligation.
              </p>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200">
                Unlock Daily Staff (₹99 / 1-Day)
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Unlock today&apos;s verified therapist roster at your chosen branch (₹99 + 2% tax = ₹100.98). Access expires at midnight IST.
              </p>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-200">
                Pick Your Therapist & Book
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                See who is confirmed present today, view photos, pick your exact slot, and choose online Razorpay (+2% tax) or pay at reception.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Unlock Modal */}
      {selectedBranchForUnlock && (
        <UnlockModal
          isOpen={!!selectedBranchForUnlock}
          onClose={() => setSelectedBranchForUnlock(null)}
          branchId={selectedBranchForUnlock.id}
          branchName={selectedBranchForUnlock.name}
          branchCity={selectedBranchForUnlock.city}
          onSuccess={() => {
            window.location.href = `/branches/${selectedBranchForUnlock.id}`;
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedBranchForBooking && (
        <BookingModal
          isOpen={!!selectedBranchForBooking}
          onClose={() => setSelectedBranchForBooking(null)}
          branchId={selectedBranchForBooking.id}
          branchName={selectedBranchForBooking.name}
          branchCity={selectedBranchForBooking.city}
        />
      )}

    </div>
  );
}
