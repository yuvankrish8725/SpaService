'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, SpaServiceResponse, BranchResponse } from '@/lib/api';
import { Sparkles, Clock, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import UnlockModal from '@/components/UnlockModal';
import { useAuth } from '@/lib/auth';

export default function ServicesPage() {
  const { isBranchUnlocked } = useAuth();
  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<SpaServiceResponse | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<SpaServiceResponse[]>('/services').catch(() => []),
      apiFetch<BranchResponse[]>('/branches').catch(() => []),
    ])
      .then(([servicesData, branchesData]) => {
        setServices(servicesData);
        setBranches(branchesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleBookService = (svc: SpaServiceResponse) => {
    // Default to first branch if service is universal
    const targetBranch = branches.find(b => b.id === svc.branchId) || branches[0];
    if (!targetBranch) return;

    if (!isBranchUnlocked(targetBranch.id)) {
      setSelectedBranch(targetBranch);
      setUnlockModalOpen(true);
    } else {
      setSelectedService(svc);
      setSelectedBranch(targetBranch);
      setBookingModalOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Ritual Menu</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-100">
          Therapeutic Treatments & Rituals
        </h1>
        <p className="text-sm text-stone-400">
          From tension-relieving deep tissue therapy to botanical hydra facials and thermal mud wraps.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full border transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              {cat === 'ALL' ? 'All Treatments' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredServices.map(svc => (
          <div
            key={svc.id}
            className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition group hover:shadow-xl hover:shadow-amber-500/5"
          >
            <div className="relative h-52 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={svc.imageUrl || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80'}
                alt={svc.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-sm border border-stone-800 px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                {svc.category}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-stone-100 group-hover:text-amber-200 transition">
                  {svc.name}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-500 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> {svc.durationMinutes} Minutes
                  </div>
                  <div className="font-serif text-2xl font-bold text-amber-300 mt-0.5">
                    ₹{svc.price}
                  </div>
                </div>

                <button
                  onClick={() => handleBookService(svc)}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 transition cursor-pointer"
                >
                  <span>Book Ritual</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paywall Unlock Modal */}
      {selectedBranch && (
        <UnlockModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          branchCity={selectedBranch.city}
          onSuccess={() => {
            setBookingModalOpen(true);
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedBranch && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedService(null);
            setSelectedBranch(null);
          }}
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          branchCity={selectedBranch.city}
          initialService={selectedService}
        />
      )}

    </div>
  );
}
