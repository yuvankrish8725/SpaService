'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, BranchResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MapPin, Clock, Key, Lock, Phone, Search, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';

const BRANCH_IMAGES = [
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498842812179-c81beecf902c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=80',
];

export default function BranchesPage() {
  const { user, isBranchUnlocked, getBranchUnlockRemainingTime, isLoading: authLoading } = useAuth();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedBranchToUnlock, setSelectedBranchToUnlock] = useState<BranchResponse | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    apiFetch<BranchResponse[]>('/branches')
      .then(data => setBranches(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchCity.toLowerCase()) ||
    b.city.toLowerCase().includes(searchCity.toLowerCase()) ||
    b.address.toLowerCase().includes(searchCity.toLowerCase())
  );

  const cities = Array.from(new Set(branches.map(b => b.city)));

  // If user is not logged in, show the member gate
  if (!authLoading && !user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Ambient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none opacity-25"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <div
          className="modal-enter relative w-full max-w-lg p-8 sm:p-10 rounded-3xl text-center space-y-7 z-10"
          style={{
            background: 'rgba(14,12,8,0.96)',
            border: '1px solid rgba(212,175,55,0.25)',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Lock Badge */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <Lock className="w-8 h-8" style={{ color: 'var(--color-gold)' }} />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--color-gold-light)' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Members Only Access
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold italic"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
            >
              Sign In to View Branches
            </h1>
            <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--color-parchment)', fontWeight: 300 }}>
              Our luxury branch locations, real-time therapist attendance, and booking slots are exclusively visible to signed-in members.
            </p>
          </div>

          {/* Value Perks */}
          <div
            className="text-left space-y-2.5 p-4 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--color-parchment)' }}
          >
            <div className="flex items-center gap-2.5">
              <span style={{ color: 'var(--color-jade)' }}>✓</span>
              <span>Browse exclusive locations in Bangalore &amp; Chennai</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span style={{ color: 'var(--color-jade)' }}>✓</span>
              <span>Unlock live therapist presence for today for ₹99</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span style={{ color: 'var(--color-jade)' }}>✓</span>
              <span>Client account registration is 100% free</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <Link
              href="/auth/login?redirect=/branches"
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider"
              style={{ borderRadius: 12 }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck className="w-4 h-4" /> Sign In with Account
              </span>
            </Link>

            <Link
              href="/auth/register?redirect=/branches"
              className="btn-ghost w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold"
              style={{ borderRadius: 12 }}
            >
              Create Free Account <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Hero ──────────────────────────────────── */}
      <section
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.4) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
              Premier Spa Network
            </span>
            <div className="w-8 h-px" style={{ background: 'var(--color-gold)' }} />
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold italic mb-5"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
          >
            Find Your Sanctuary
          </h1>
          <p className="text-base max-w-xl mx-auto mb-10" style={{ color: 'var(--color-parchment)', fontWeight: 300, lineHeight: 1.7 }}>
            Browse verified locations, review schedules, and unlock today&apos;s active therapist roster.
          </p>

          {/* City filter pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setSearchCity('')}
              className="px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200"
              style={searchCity === ''
                ? { background: 'var(--color-gold)', color: '#0A0906', boxShadow: '0 4px 20px -4px rgba(212,175,55,0.5)' }
                : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
              }
            >
              All ({branches.length})
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSearchCity(city)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200"
                style={searchCity === city
                  ? { background: 'var(--color-gold)', color: '#0A0906', boxShadow: '0 4px 20px -4px rgba(212,175,55,0.5)' }
                  : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                }
              >
                <MapPin className="w-3.5 h-3.5" /> {city}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, city, or address…"
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              className="input-glass pl-11 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ── Branch Cards Grid ──────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
                  <div className="h-56 bg-white/5 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--color-muted)' }} />
              <p className="text-lg font-semibold" style={{ color: 'var(--color-parchment)' }}>No branches found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Try a different city or clear your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBranches.map((branch, idx) => {
                const unlocked = isBranchUnlocked(branch.id);
                const remaining = getBranchUnlockRemainingTime(branch.id);

                return (
                  <div key={branch.id} className="glass-card overflow-hidden group" style={{ borderRadius: 20 }}>

                    {/* Image header */}
                    <div className="relative h-56 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={BRANCH_IMAGES[idx % BRANCH_IMAGES.length]}
                        alt={branch.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient on image */}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,6,0.8) 0%, transparent 60%)' }} />

                      {/* City badge */}
                      <div
                        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(10,9,6,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold-light)' }}
                      >
                        <MapPin className="w-3.5 h-3.5" /> {branch.city}, {branch.state}
                      </div>

                      {/* Lock/unlock badge */}
                      {unlocked ? (
                        <div className="absolute top-4 right-4 badge-jade">
                          <Key className="w-3 h-3" /> Unlocked {remaining && `· ${remaining}`}
                        </div>
                      ) : (
                        <div
                          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(10,9,6,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-parchment)' }}
                        >
                          <Lock className="w-3 h-3" /> ₹99 / Day
                        </div>
                      )}

                      {/* Branch name on image */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3
                          className="text-xl font-bold italic transition-colors duration-200"
                          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                        >
                          {branch.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {branch.address}, {branch.pincode}
                      </p>

                      {/* Info row */}
                      <div
                        className="grid grid-cols-2 gap-3 p-3 rounded-xl text-xs"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div className="flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                          <span>{branch.openTime?.substring(0, 5) || '09:00'} – {branch.closeTime?.substring(0, 5) || '21:00'}</span>
                        </div>
                        {branch.phone && (
                          <div className="flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
                            <Phone className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                            <span className="truncate">{branch.phone}</span>
                          </div>
                        )}
                        <div className="col-span-2 flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ color: 'var(--color-muted)' }}>Therapists</span>
                          <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                            {branch.staffCount} Assigned
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/branches/${branch.id}`}
                          className="flex-1 py-3 rounded-xl text-xs font-bold text-center uppercase tracking-wide transition-all duration-200"
                          style={unlocked
                            ? { background: 'linear-gradient(135deg, #D4AF37, #A08828)', color: '#0A0906' }
                            : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                          }
                        >
                          {unlocked ? "View Today's Roster" : 'View Branch'}
                        </Link>

                        {!unlocked && (
                          <button
                            onClick={() => setSelectedBranchToUnlock(branch)}
                            title="Unlock for ₹99"
                            className="flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-all duration-200 shrink-0"
                            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--color-gold)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.15)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.08)'; }}
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}

                        {branch.mapsUrl && (
                          <a
                            href={branch.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in Google Maps"
                            className="flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shrink-0"
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

      {/* Unlock modal */}
      {selectedBranchToUnlock && (
        <UnlockModal
          isOpen={!!selectedBranchToUnlock}
          onClose={() => setSelectedBranchToUnlock(null)}
          branchId={selectedBranchToUnlock.id}
          branchName={selectedBranchToUnlock.name}
          branchCity={selectedBranchToUnlock.city}
          onSuccess={() => { window.location.href = `/branches/${selectedBranchToUnlock.id}`; }}
        />
      )}
    </div>
  );
}
