'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiFetch, BranchResponse, SpaServiceResponse, StaffCardResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MapPin, Clock, Phone, Lock, Key, XCircle, CheckCircle2, ArrowRight, ChevronLeft, Calendar } from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';
import BookingModal from '@/components/BookingModal';

interface PageProps {
  params: Promise<{ branchId: string }>;
}

/* ── Blurred staff silhouette card ──────────────────────── */
function LockedStaffCard() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        filter: 'blur(4px)',
        userSelect: 'none',
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.1)', width: '70%' }} />
          <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.06)', width: '50%' }} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', width: 80 }} />
        <div className="h-6 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', width: 100 }} />
      </div>
      <div className="h-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
    </div>
  );
}

export default function BranchDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const branchId = resolvedParams.branchId;

  const { user, isBranchUnlocked, getBranchUnlockRemainingTime, isLoading: authLoading } = useAuth();

  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [staff, setStaff] = useState<StaffCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<StaffCardResponse | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<SpaServiceResponse | null>(null);
  const [countdown, setCountdown] = useState('');

  const unlocked = isBranchUnlocked(branchId);
  const remainingTime = getBranchUnlockRemainingTime(branchId);

  // Live countdown to 23:59:59 IST
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const endIST = new Date();
      endIST.setHours(23, 59, 59, 0);
      const diff = endIST.getTime() - now.getTime();
      if (diff <= 0) { setCountdown('Expires soon'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s remaining`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      apiFetch<BranchResponse>(`/branches/${branchId}`).catch(() => null),
      apiFetch<SpaServiceResponse[]>(`/branches/${branchId}/services`).catch(() => []),
    ]).then(([b, s]) => {
      if (b) setBranch(b);
      setServices(s);
    }).finally(() => setLoading(false));
  }, [user, branchId]);

  useEffect(() => {
    if (!unlocked || !user) return;
    setStaffLoading(true);
    apiFetch<StaffCardResponse[]>(`/branches/${branchId}/staff`)
      .then(st => setStaff(st))
      .catch(console.error)
      .finally(() => setStaffLoading(false));
  }, [unlocked, branchId, user]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <div
          className="modal-enter relative w-full max-w-lg p-8 sm:p-10 rounded-3xl text-center space-y-7 z-10"
          style={{
            background: 'rgba(14,12,8,0.96)',
            border: '1px solid rgba(212,175,55,0.25)',
            boxShadow: '0 32px 80px -16px rgba(0,0,0,0.8)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <Lock className="w-8 h-8" style={{ color: 'var(--color-gold)' }} />
          </div>
          <div className="space-y-3">
            <h1
              className="text-3xl font-bold italic"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
            >
              Sign In to View Branch Details
            </h1>
            <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--color-parchment)', fontWeight: 300 }}>
              Please sign in to your account to view branch location details, schedules, and unlock today&apos;s therapist roster.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href={`/auth/login?redirect=/branches/${branchId}`}
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider"
              style={{ borderRadius: 12 }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock className="w-4 h-4" /> Sign In to Continue
              </span>
            </Link>
            <Link
              href={`/auth/register?redirect=/branches/${branchId}`}
              className="btn-ghost w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold"
              style={{ borderRadius: 12 }}
            >
              Register Free <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full" style={{ border: '2px solid rgba(212,175,55,0.3)', borderTop: '2px solid var(--color-gold)', animation: 'spin 0.8s linear infinite' }} />
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading branch details…</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>Branch not found</p>
        <Link href="/branches" className="text-sm" style={{ color: 'var(--color-gold)' }}>← Back to Branches</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">

      {/* ── Branch Hero Banner ──────────────────────────── */}
      <section
        className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.05), transparent)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Back link */}
          <Link
            href="/branches"
            className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-200"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
          >
            <ChevronLeft className="w-4 h-4" /> All Branches
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Branch info */}
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--color-gold-light)' }}
              >
                <MapPin className="w-3.5 h-3.5" /> {branch.city}, {branch.state}
              </div>

              <h1
                className="text-4xl sm:text-5xl font-bold italic mb-4"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)', lineHeight: 1.1 }}
              >
                {branch.name}
              </h1>

              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                {branch.address}, {branch.pincode}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2" style={{ color: 'var(--color-parchment)' }}>
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                  {branch.openTime?.substring(0, 5) || '09:00'} – {branch.closeTime?.substring(0, 5) || '21:00'} IST
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-parchment)' }}>
                    <Phone className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                    {branch.phone}
                  </div>
                )}
                {branch.mapsUrl && (
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-medium transition-colors duration-200"
                    style={{ color: 'var(--color-gold)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'; }}
                  >
                    <MapPin className="w-4 h-4" /> View on Google Maps ↗
                  </a>
                )}
              </div>
            </div>

            {/* Unlock status card */}
            <div
              className="shrink-0 w-full lg:w-72 p-6 rounded-2xl"
              style={{ background: 'var(--glass-bg)', border: `1px solid ${unlocked ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}
            >
              {unlocked ? (
                <div className="space-y-3">
                  <div className="badge-jade text-sm px-0 py-0 border-0 bg-transparent flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Today&apos;s Roster Unlocked</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-jade)', fontFamily: 'var(--font-mono)' }}>
                    ⏱ {countdown}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Access expires at 11:59 PM IST tonight. Scroll down to view all therapists.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-gold-light)' }}>
                    <Lock className="w-5 h-5" />
                    <span className="font-bold text-sm">Therapists Locked</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Base price</span>
                      <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-parchment)' }}>₹99.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Online tax (2%)</span>
                      <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-parchment)' }}>₹1.98</span>
                    </div>
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-cream)' }}>Total</span>
                      <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹100.98</span>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Valid until 11:59 PM IST tonight only.
                  </div>
                  <button
                    onClick={() => user ? setUnlockModalOpen(true) : (window.location.href = '/auth/login')}
                    className="btn-gold w-full py-3 text-xs uppercase tracking-wider font-bold cursor-pointer"
                    style={{ borderRadius: 10 }}
                  >
                    <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Key className="w-4 h-4" />
                      {user ? 'Unlock Today\'s Roster' : 'Sign In to Unlock'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Staff Section ───────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-px" style={{ background: 'var(--color-gold)' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                  {unlocked ? "Today's Active Roster" : 'Certified Therapists'}
                </span>
              </div>
              <h2
                className="text-3xl font-bold italic"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
              >
                {unlocked ? `${staff.length} Therapist${staff.length !== 1 ? 's' : ''} at ${branch.city}` : 'Unlock to See Therapists'}
              </h2>
            </div>
          </div>

          {/* ── LOCKED STATE: blurred silhouettes ─────── */}
          {!unlocked && (
            <div className="relative">
              {/* Blurred preview grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <LockedStaffCard key={i} />)}
              </div>

              {/* Paywall overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(10,9,6,0.85) 40%, rgba(10,9,6,0.97) 100%)' }}
              >
                <div
                  className="text-center p-10 rounded-3xl max-w-md mx-4"
                  style={{
                    background: 'rgba(10,9,6,0.92)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
                  >
                    <Key className="w-7 h-7" style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <h3
                    className="text-2xl font-bold italic mb-3"
                    style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                  >
                    Unlock Today&apos;s Roster
                  </h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    See exactly who is confirmed present today at {branch.city}. Valid until 11:59 PM IST.
                  </p>

                  <div
                    className="flex items-center justify-between p-4 rounded-xl mb-5 text-sm"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span style={{ color: 'var(--color-muted)' }}>₹99 base + 2% tax</span>
                    <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹100.98</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      'View all confirmed therapists today',
                      'See specializations & live presence badge',
                      'Book your session immediately',
                    ].map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-left" style={{ color: 'var(--color-parchment)' }}>
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-jade)' }} />
                        {item}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => user ? setUnlockModalOpen(true) : (window.location.href = '/auth/login')}
                    className="btn-gold w-full py-3.5 text-sm uppercase tracking-wider font-bold cursor-pointer"
                    style={{ borderRadius: 12 }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      {user ? `Unlock for ₹100.98` : 'Sign In to Unlock'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── UNLOCKED STATE: Staff grid ─────────────── */}
          {unlocked && (
            staffLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : staff.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
              >
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-parchment)' }}>No staff roster today</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Check back after 8:30 AM for daily check-ins.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {staff.map(s => {
                  const present = s.presentToday;
                  return (
                    <div
                      key={s.id}
                      className="glass-card p-6 flex flex-col gap-5"
                      style={{ borderRadius: 20, borderColor: present ? 'rgba(52,211,153,0.15)' : 'var(--glass-border)' }}
                    >
                      {/* Avatar + presence ring */}
                      <div className="flex items-center gap-4">
                        <div
                          className="relative shrink-0"
                          style={{
                            padding: 2,
                            borderRadius: '50%',
                            background: present
                              ? 'linear-gradient(135deg, rgba(52,211,153,0.5), rgba(52,211,153,0.1))'
                              : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          <div
                            className="w-16 h-16 rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                          >
                            {s.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-playfair)' }}>
                                {s.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-base truncate"
                            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                          >
                            {s.name}
                          </h3>
                          {present ? (
                            <div className="badge-jade mt-1.5 inline-flex">
                              <span className="presence-dot-present" />
                              Present Today
                            </div>
                          ) : (
                            <div className="badge-rose mt-1.5 inline-flex">
                              <XCircle className="w-3 h-3" />
                              On Leave
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Specializations */}
                      {s.specializations && s.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {s.specializations.map((spec: string) => (
                            <span
                              key={spec}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', color: 'var(--color-gold-light)' }}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Book button */}
                      <button
                        disabled={!present}
                        onClick={() => {
                          if (present) {
                            setSelectedStaffForBooking(s);
                            setBookingModalOpen(true);
                          }
                        }}
                        className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer"
                        style={present
                          ? { background: 'linear-gradient(135deg, #D4AF37, #A08828)', color: '#0A0906' }
                          : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-muted)', cursor: 'not-allowed', opacity: 0.5 }
                        }
                      >
                        <span className="flex items-center justify-center gap-2">
                          {present ? <><Calendar className="w-3.5 h-3.5" /> Book Session</> : 'Not Available Today'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </section>

      {/* ── Services at this branch ──────────────────────── */}
      {services.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-px" style={{ background: 'var(--color-gold)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                Available Treatments
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map(svc => (
                <div
                  key={svc.id}
                  className="glass-card p-5 flex flex-col justify-between gap-4"
                  style={{ borderRadius: 16 }}
                >
                  <div>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                      style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--color-gold-light)' }}
                    >
                      {svc.category}
                    </span>
                    <h3
                      className="font-bold text-sm"
                      style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                    >
                      {svc.name}
                    </h3>
                    <p className="text-xs mt-1.5 leading-relaxed line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                      {svc.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="text-[10px] uppercase" style={{ color: 'var(--color-muted)' }}>{svc.durationMinutes} min</div>
                      <div className="font-bold text-base" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹{svc.price}</div>
                    </div>
                    {unlocked && (
                      <button
                        onClick={() => { setSelectedServiceForBooking(svc); setBookingModalOpen(true); }}
                        className="flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors duration-200"
                        style={{ color: 'var(--color-gold)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'; }}
                      >
                        Book <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modals */}
      {unlockModalOpen && branch && (
        <UnlockModal
          isOpen={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          branchId={branchId}
          branchName={branch.name}
          branchCity={branch.city}
          onSuccess={() => { setUnlockModalOpen(false); window.location.reload(); }}
        />
      )}
      {bookingModalOpen && branch && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => { setBookingModalOpen(false); setSelectedStaffForBooking(null); setSelectedServiceForBooking(null); }}
          branchId={branchId}
          branchName={branch.name}
          branchCity={branch.city}
          preselectedStaff={selectedStaffForBooking}
          preselectedService={selectedServiceForBooking}
        />
      )}
    </div>
  );
}
