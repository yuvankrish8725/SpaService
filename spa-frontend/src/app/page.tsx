'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, BranchResponse, SpaServiceResponse } from '@/lib/api';
import { MapPin, Clock, ArrowRight, ShieldCheck, Key, Star, ChevronDown, Sparkles, Lock } from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';
import { useAuth } from '@/lib/auth';

/* ── Testimonials data ───────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Bangalore', rating: 5, text: "Ananya is phenomenal. Knowing she was confirmed present before I booked made all the difference — no surprises." },
  { name: 'Rohan M.', city: 'Chennai', rating: 5, text: "The Anna Nagar branch is stunning. The daily therapist check-in feature is genius — booked exactly who I wanted." },
  { name: 'Kavitha R.', city: 'Bangalore', rating: 5, text: "The aromatherapy session was heavenly. Love that I could see who was on duty before paying. Totally worth \u20b999." },
  { name: 'Arjun T.', city: 'Bangalore', rating: 5, text: "Indiranagar branch — premium experience from start to finish. The online booking is seamless." },
  { name: 'Meera K.', city: 'Chennai', rating: 5, text: "I've been coming every weekend. Best investment in self-care I've ever made. Certified therapists, every time." },
];

/* ── Unsplash branch images ──────────────────────────────── */
const BRANCH_IMAGES = [
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498842812179-c81beecf902c?w=800&auto=format&fit=crop&q=80',
];

const SERVICE_IMAGES: Record<string, string> = {
  MASSAGE: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop&q=80',
  FACIAL: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
  BODY: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  AROMATHERAPY: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80',
};

/* ── Stat item ───────────────────────────────────────────── */
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="text-3xl font-bold italic"
        style={{ fontFamily: 'var(--font-playfair)', color: '#F5CC5A' }}
      >
        {value}
      </div>
      <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-inter)' }}>
        {label}
      </div>
    </div>
  );
}

/* ── How It Works Step ───────────────────────────────────── */
function HowStep({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div
      className="glass-card p-8 flex flex-col gap-5"
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          {icon}
        </div>
        <div
          className="text-5xl font-bold italic opacity-15"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-gold)' }}
        >
          {num}
        </div>
      </div>
      <div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, isBranchUnlocked } = useAuth();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchForUnlock, setSelectedBranchForUnlock] = useState<BranchResponse | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<BranchResponse[]>('/branches').catch(() => []),
      apiFetch<SpaServiceResponse[]>('/services').catch(() => []),
    ])
      .then(([b, s]) => { setBranches(b); setServices(s); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>

      {/* ══════════════════════════════════════════════════════
          1. CINEMATIC HERO
         ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&auto=format&fit=crop&q=80')` }}
        />

        {/* Gradient overlays — 3 layers */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0906 0%, rgba(10,9,6,0.7) 50%, rgba(10,9,6,0.3) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,9,6,0.4) 0%, transparent 50%, rgba(10,9,6,0.4) 100%)' }} />

        {/* Ambient orbs */}
        <div
          className="ambient-orb ambient-orb-1"
          style={{ top: '15%', left: '8%' }}
        />
        <div
          className="ambient-orb ambient-orb-2"
          style={{ bottom: '20%', right: '10%' }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-8 pt-20">

          {/* Label pill */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest card-enter"
            style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              color: 'var(--color-gold-light)',
              backdropFilter: 'blur(8px)',
              animationDelay: '0.1s',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exquisite Wellness Rituals Across Premier Branches</span>
          </div>

          {/* Main heading */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[0.95] tracking-tight card-enter"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)', animationDelay: '0.2s' }}
          >
            Surrender to<br />
            <span className="italic gold-gradient-text">Pure Serenity</span>
          </h1>

          {/* Subtitle */}
          <p
            className="max-w-xl text-base sm:text-lg leading-relaxed card-enter"
            style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-inter)', fontWeight: 300, animationDelay: '0.3s' }}
          >
            Certified therapists, bespoke aromatherapy rituals, and live daily presence confirmation — so you know exactly who awaits you.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 card-enter" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/branches"
              className="btn-gold flex items-center gap-2.5 px-8 py-4 text-sm uppercase tracking-wider font-bold w-full sm:w-auto justify-center"
              style={{ borderRadius: 12 }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin className="w-4 h-4" />
                Explore Branches &amp; Book
              </span>
            </Link>
            <Link
              href="/services"
              className="btn-ghost flex items-center gap-2.5 px-8 py-4 text-sm font-semibold w-full sm:w-auto justify-center"
              style={{ borderRadius: 12 }}
            >
              View Treatment Menu
              <ArrowRight className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
            </Link>
          </div>

          {/* Stats strip */}
          <div
            className="w-full grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 mt-6 card-enter"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', animationDelay: '0.5s' }}
          >
            <StatItem value="100%" label="Organic Extracts" />
            <StatItem value="Daily" label="Live Check-ins" />
            <StatItem value="3+" label="Premier Locations" />
            <StatItem value="4.9 ★" label="Client Rating" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Discover</span>
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-gold-dim)', animation: 'float-orb 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. OUR SANCTUARIES
         ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                  Our Sanctuaries
                </span>
              </div>
              <h2
                className="text-4xl sm:text-5xl font-bold"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
              >
                Luxury Spa Branches
              </h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--color-muted)' }}>
                Each location offers certified therapists with live daily presence confirmation.
              </p>
            </div>
            <Link
              href="/branches"
              className="inline-flex items-center gap-2 text-sm font-semibold shrink-0 transition-colors duration-200"
              style={{ color: 'var(--color-gold)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'; }}
            >
              View all locations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Branch cards — image first */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <div className="h-52 bg-white/5 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b, idx) => {
                const unlocked = isBranchUnlocked(b.id);
                return (
                  <div
                    key={b.id}
                    className="glass-card overflow-hidden group"
                    style={{ borderRadius: 20 }}
                  >
                    {/* Card image */}
                    <div className="relative h-52 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={BRANCH_IMAGES[idx % BRANCH_IMAGES.length]}
                        alt={b.name}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{}}
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                      />
                      {/* Location badge overlay */}
                      <div
                        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(10,9,6,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold-light)' }}
                      >
                        <MapPin className="w-3 h-3" />
                        {b.city}, {b.state}
                      </div>
                      {/* Unlock status badge */}
                      {unlocked ? (
                        <div
                          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold badge-jade"
                        >
                          <Key className="w-3 h-3" /> Unlocked
                        </div>
                      ) : (
                        <div
                          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(10,9,6,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-parchment)' }}
                        >
                          <Lock className="w-3 h-3" /> ₹99 / Day
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3
                          className="text-xl font-bold transition-colors duration-200 group-hover:text-[#F5CC5A]"
                          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                        >
                          {b.name}
                        </h3>
                        <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                          {b.address}
                        </p>
                      </div>

                      {/* Meta row */}
                      <div
                        className="flex items-center justify-between text-xs py-3 px-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <span className="flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
                          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                          {b.openTime?.substring(0, 5) || '09:00'} – {b.closeTime?.substring(0, 5) || '21:00'}
                        </span>
                        <span className="font-bold" style={{ color: 'var(--color-gold-light)', fontFamily: 'var(--font-mono)' }}>
                          {b.staffCount} Therapists
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <Link
                          href={`/branches/${b.id}`}
                          className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-wide"
                          style={unlocked
                            ? { background: 'linear-gradient(135deg, #D4AF37, #A08828)', color: '#0A0906' }
                            : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                          }
                        >
                          {unlocked ? 'View Today\'s Roster' : 'View & Unlock'}
                        </Link>
                        {b.mapsUrl && (
                          <a
                            href={b.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Google Maps"
                            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
                            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-gold)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)'; }}
                          >
                            <MapPin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. TREATMENTS SHOWCASE
         ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>Signature Therapies</span>
              <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
            </div>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
            >
              Curated Wellness Rituals
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Designed to alleviate chronic strain, awaken your senses, and restore cellular harmony.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {services.slice(0, 4).map(s => {
                const imgKey = Object.keys(SERVICE_IMAGES).find(k => s.category?.toUpperCase().includes(k)) || 'MASSAGE';
                return (
                  <div
                    key={s.id}
                    className="glass-card overflow-hidden group"
                    style={{ borderRadius: 18 }}
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.imageUrl || SERVICE_IMAGES[imgKey]}
                        alt={s.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(10,9,6,0.8)', backdropFilter: 'blur(8px)', color: 'var(--color-gold-light)', border: '1px solid rgba(212,175,55,0.25)' }}
                      >
                        {s.category}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3
                          className="font-bold text-base transition-colors duration-200 group-hover:text-[#F5CC5A]"
                          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                        >
                          {s.name}
                        </h3>
                        <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                          {s.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{s.durationMinutes} min</div>
                          <div
                            className="text-lg font-bold"
                            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}
                          >
                            ₹{s.price}
                          </div>
                        </div>
                        <Link
                          href="/services"
                          className="flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
                          style={{ color: 'var(--color-gold)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'; }}
                        >
                          Book <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="btn-ghost inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
              style={{ borderRadius: 12 }}
            >
              View All Treatments <ArrowRight className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. HOW IT WORKS
         ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-3xl p-10 sm:p-16 dot-grid relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Glow accent */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }}
            />

            <div className="text-center max-w-2xl mx-auto mb-16 relative">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>Trust &amp; Transparency</span>
                <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
              </div>
              <h2
                className="text-4xl sm:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
              >
                How Live Therapist Availability Works
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                We eliminate the guesswork. Know exactly who is on duty before booking your session.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dashed gold connector — desktop only */}
              <div
                className="absolute hidden md:block top-14 left-1/3 right-1/3 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold-dim), transparent)', borderTop: '1px dashed rgba(212,175,55,0.3)' }}
              />

              <HowStep
                num="01"
                title="Browse Any Branch Freely"
                desc="Explore treatment menus, branch amenities, operating hours, and verified Google Maps locations — completely free, zero obligation."
                icon={<MapPin className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />}
              />
              <HowStep
                num="02"
                title="Unlock Today's Staff (₹99)"
                desc="Unlock today's verified therapist roster for your chosen branch. ₹99 + 2% tax = ₹100.98. Access expires at midnight IST tonight."
                icon={<Key className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />}
              />
              <HowStep
                num="03"
                title="Pick Your Therapist & Book"
                desc="See who is confirmed present today, view their profile, pick your exact time slot, and pay online (+2% tax) or at the reception desk."
                icon={<ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. TESTIMONIALS MARQUEE
         ══════════════════════════════════════════════════════ */}
      <section className="py-20 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>Client Stories</span>
            <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
          >
            What Our Guests Say
          </h2>
        </div>

        {/* Marquee — duplicated for seamless loop */}
        <div className="overflow-hidden">
          <div className="marquee-track gap-5">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="shrink-0 w-80 p-6 rounded-2xl"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  marginRight: '1.25rem',
                }}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, r) => (
                    <Star key={r} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--color-gold)' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-parchment)' }}>
                  &quot;{t.text}&quot;
                </p>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{t.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. FINAL CTA BANNER
         ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-5xl mx-auto rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(10,9,6,0.8) 50%, rgba(160,136,40,0.1) 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%)' }}
          />

          <div className="relative z-10 space-y-6">
            <h2
              className="text-4xl sm:text-6xl font-bold"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
            >
              Your serenity awaits.<br />
              <span className="italic gold-gradient-text">Start today.</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--color-parchment)', fontWeight: 300 }}>
              Register free, browse all branches, and unlock your first therapist roster for just ₹99.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/branches"
                className="btn-gold flex items-center gap-2.5 px-10 py-4 text-sm uppercase tracking-wider font-bold"
                style={{ borderRadius: 12 }}
              >
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                  Explore Branches <MapPin className="w-4 h-4" />
                </span>
              </Link>
              {!user && (
                <Link
                  href="/auth/register"
                  className="btn-ghost flex items-center gap-2.5 px-10 py-4 text-sm font-semibold"
                  style={{ borderRadius: 12 }}
                >
                  Register Free <ArrowRight className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Unlock Modal ──────────────────────────────────── */}
      {selectedBranchForUnlock && (
        <UnlockModal
          isOpen={!!selectedBranchForUnlock}
          onClose={() => setSelectedBranchForUnlock(null)}
          branchId={selectedBranchForUnlock.id}
          branchName={selectedBranchForUnlock.name}
          branchCity={selectedBranchForUnlock.city}
          onSuccess={() => { window.location.href = `/branches/${selectedBranchForUnlock.id}`; }}
        />
      )}
    </div>
  );
}
