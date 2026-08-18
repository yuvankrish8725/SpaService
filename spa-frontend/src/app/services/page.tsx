'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch, SpaServiceResponse, BranchResponse } from '@/lib/api';
import { Clock, ArrowRight } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import UnlockModal from '@/components/UnlockModal';
import { useAuth } from '@/lib/auth';

const SERVICE_IMAGES: Record<string, string> = {
  MASSAGE: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop&q=80',
  FACIAL: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
  BODY: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  AROMATHERAPY: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80',
};

function getServiceImage(svc: SpaServiceResponse) {
  if (svc.imageUrl) return svc.imageUrl;
  const key = Object.keys(SERVICE_IMAGES).find(k => svc.category?.toUpperCase().includes(k));
  return SERVICE_IMAGES[key || 'DEFAULT'];
}

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
    ]).then(([s, b]) => { setServices(s); setBranches(b); }).finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(services.map(s => s.category)))];
  const filteredServices = selectedCategory === 'ALL' ? services : services.filter(s => s.category === selectedCategory);

  const handleBookService = (svc: SpaServiceResponse) => {
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
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.4) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
              Curated Ritual Menu
            </span>
            <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold italic mb-5"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
          >
            Treatments &amp; Rituals
          </h1>
          <p className="text-base max-w-xl mx-auto mb-10" style={{ color: 'var(--color-parchment)', fontWeight: 300, lineHeight: 1.7 }}>
            From tension-relieving deep tissue therapy to botanical hydra facials and thermal mud wraps.
          </p>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200"
                style={selectedCategory === cat
                  ? { background: 'var(--color-gold)', color: '#0A0906', boxShadow: '0 4px 20px -4px rgba(212,175,55,0.5)' }
                  : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                }
              >
                {cat === 'ALL' ? 'All Treatments' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pb-28">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
                  <div className="h-52 bg-white/5 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(svc => (
                <div key={svc.id} className="glass-card overflow-hidden group flex flex-col" style={{ borderRadius: 20 }}>

                  {/* Image */}
                  <div className="relative h-52 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getServiceImage(svc)}
                      alt={svc.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,6,0.6) 0%, transparent 60%)' }} />
                    <span
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(10,9,6,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold-light)' }}
                    >
                      {svc.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3
                        className="text-xl font-bold mb-2 transition-colors duration-200 group-hover:text-[#F5CC5A]"
                        style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                      >
                        {svc.name}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {svc.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-muted)' }}>
                          <Clock className="w-3 h-3" style={{ color: 'var(--color-gold)' }} />
                          {svc.durationMinutes} Minutes
                        </div>
                        <div
                          className="text-2xl font-bold"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}
                        >
                          ₹{svc.price}
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookService(svc)}
                        className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer"
                        style={{ borderRadius: 10 }}
                      >
                        <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          Book Ritual <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {selectedBranch && (
        <UnlockModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          branchCity={selectedBranch.city}
          onSuccess={() => { setUnlockModalOpen(false); setBookingModalOpen(true); }}
        />
      )}
      {selectedBranch && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => { setBookingModalOpen(false); setSelectedService(null); setSelectedBranch(null); }}
          branchId={selectedBranch.id}
          branchName={selectedBranch.name}
          branchCity={selectedBranch.city}
          initialService={selectedService}
        />
      )}
    </div>
  );
}
