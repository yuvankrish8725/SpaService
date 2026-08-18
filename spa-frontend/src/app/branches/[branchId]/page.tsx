'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  apiFetch,
  BranchResponse,
  SpaServiceResponse,
  StaffCardResponse,
} from '@/lib/api';
import {
  MapPin, Clock, Phone, Calendar, Key, CheckCircle2,
  Lock, Sparkles, Image as ImageIcon,
} from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';
import BookingModal from '@/components/BookingModal';
import TherapistGalleryModal from '@/components/TherapistGalleryModal';

interface PageProps {
  params: Promise<{ branchId: string }>;
}

function LockedStaffCard() {
  return (
    <div
      className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden select-none"
      style={{ borderRadius: 20, filter: 'blur(3px)', opacity: 0.45 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 rounded-md" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="h-3 w-1/2 rounded-md" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
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
  const [serverUnlocked, setServerUnlocked] = useState<boolean | null>(null);

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedStaffForGallery, setSelectedStaffForGallery] = useState<StaffCardResponse | null>(null);
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<StaffCardResponse | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<SpaServiceResponse | null>(null);
  const [countdown, setCountdown] = useState('');

  // Unlocked status determined by server verification or local auth context
  const unlocked = serverUnlocked !== null ? serverUnlocked : isBranchUnlocked(branchId);
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

  // Fetch branch and service details
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

  // Attempt to fetch staff roster directly to determine backend unlock state
  useEffect(() => {
    if (!user) return;
    setStaffLoading(true);
    apiFetch<StaffCardResponse[]>(`/branches/${branchId}/staff`)
      .then(st => {
        setStaff(st || []);
        setServerUnlocked(true);
      })
      .catch(() => {
        // If forbidden or locked, mark locked
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          setServerUnlocked(false);
        }
      })
      .finally(() => setStaffLoading(false));
  }, [branchId, user, unlockModalOpen]);

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
              <span style={{ position: 'relative', zIndex: 2 }}>Sign In to Continue</span>
            </Link>
            <Link
              href="/auth/register"
              className="block w-full py-3.5 text-xs font-semibold uppercase tracking-wider text-center"
              style={{ color: 'var(--color-gold)' }}
            >
              Create Free Account →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-full" />
        <div className="h-12 w-2/3 bg-white/10 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <MapPin className="w-12 h-12 mb-4" style={{ color: 'var(--color-gold)' }} />
        <h2 className="text-2xl font-bold italic mb-2" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Branch Not Found</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>The sanctuary you are looking for does not exist or has been relocated.</p>
        <Link href="/client/dashboard" className="btn-gold px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderRadius: 10 }}>
          <span style={{ position: 'relative', zIndex: 2 }}>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">

      {/* ── Hero Banner ─────────────────────────────────── */}
      <section
        className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b"
        style={{
          background: 'linear-gradient(to bottom, rgba(14,12,8,0.95), rgba(10,9,6,0.98))',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/client/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold mb-6 transition-colors duration-200"
            style={{ color: 'var(--color-gold)' }}
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
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
                    ⏱ {remainingTime ? `${remainingTime} remaining` : countdown}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Access active until 11:59 PM IST tonight. Browse verified therapists below.
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
                  {unlocked ? "Today's Active Certified Roster" : 'Certified Therapists'}
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

                  <div className="space-y-2 mb-6">
                    {[
                      'View all confirmed therapists today',
                      'See therapist photo gallery & verified qualifications',
                      'Directly book your preferred therapist',
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

          {/* ── UNLOCKED STATE: Staff grid + Photo Gallery + Booking ─────── */}
          {unlocked && (
            staffLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(s => {
                  const present = s.presentToday ?? (s.todayCheckinStatus === 'PRESENT');

                  return (
                    <div
                      key={s.id}
                      className="glass-card p-6 flex flex-col justify-between gap-5 transition-all duration-300 group hover:border-amber-400/40"
                      style={{ borderRadius: 24, borderColor: present ? 'rgba(52,211,153,0.2)' : 'var(--glass-border)' }}
                    >
                      <div className="space-y-4">
                        {/* Avatar + presence badge + Gallery trigger */}
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => {
                              setSelectedStaffForGallery(s);
                              setGalleryModalOpen(true);
                            }}
                            title="Click to view photo gallery"
                            className="relative shrink-0 group/photo cursor-pointer"
                            style={{
                              padding: 2,
                              borderRadius: '50%',
                              background: present
                                ? 'linear-gradient(135deg, rgba(52,211,153,0.6), rgba(212,175,55,0.4))'
                                : 'rgba(255,255,255,0.06)',
                            }}
                          >
                            <div
                              className="w-20 h-20 rounded-full overflow-hidden relative"
                              style={{ background: 'rgba(255,255,255,0.08)' }}
                            >
                              {s.profilePhotoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={s.profilePhotoUrl}
                                  alt={s.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-playfair)' }}>
                                  {s.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h3
                                className="font-bold text-lg truncate"
                                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                              >
                                {s.name}
                              </h3>
                            </div>
                            <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-gold-light)' }}>
                              {s.specialization || 'Certified Wellness Specialist'}
                            </div>
                            <div className="badge-jade mt-2 inline-flex text-[11px] px-2.5 py-0.5">
                              <span className="presence-dot-present" />
                              Present Today
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                          {s.bio || 'Experienced holistic therapy practitioner specializing in muscle recovery and calming aromatherapy.'}
                        </p>
                      </div>

                      {/* Action Buttons: View Gallery & Book Session */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedStaffForGallery(s);
                              setGalleryModalOpen(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-parchment)' }}
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> View Gallery
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStaffForBooking(s);
                              setBookingModalOpen(true);
                            }}
                            className="btn-gold flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            style={{ borderRadius: 12 }}
                          >
                            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar className="w-3.5 h-3.5" /> Book
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </section>

      {/* ── Treatments Section ──────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-px" style={{ background: 'var(--color-gold)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>Signature Offerings</span>
            </div>
            <h2 className="text-3xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
              Available Treatments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map(svc => (
              <div
                key={svc.id}
                className="glass-card p-6 flex flex-col justify-between gap-4"
                style={{ borderRadius: 18 }}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block" style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--color-gold-light)' }}>
                    {svc.category}
                  </span>
                  <h3 className="font-bold text-base mb-2 italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                    {svc.name}
                  </h3>
                  <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {svc.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-[10px] uppercase" style={{ color: 'var(--color-muted)' }}>{svc.durationMinutes} MIN</div>
                    <div className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                      ₹{svc.price}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedServiceForBooking(svc);
                      setBookingModalOpen(true);
                    }}
                    className="btn-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    style={{ borderRadius: 8 }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>Book</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Therapist Gallery Modal ────────────────────── */}
      <TherapistGalleryModal
        isOpen={galleryModalOpen}
        onClose={() => { setGalleryModalOpen(false); setSelectedStaffForGallery(null); }}
        staff={selectedStaffForGallery}
        branchName={branch.name}
        branchCity={branch.city}
        onBook={(st) => {
          setSelectedStaffForBooking(st);
          setBookingModalOpen(true);
        }}
      />

      {/* ── Unlock Modal ───────────────────────────────── */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        branchId={branch.id}
        branchName={branch.name}
        branchCity={branch.city}
        onSuccess={() => {
          setServerUnlocked(true);
          apiFetch<StaffCardResponse[]>(`/branches/${branch.id}/staff`).then(st => setStaff(st || [])).catch(console.error);
        }}
      />

      {/* ── Booking Modal ──────────────────────────────── */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedStaffForBooking(null);
          setSelectedServiceForBooking(null);
        }}
        branchId={branch.id}
        branchName={branch.name}
        branchCity={branch.city}
        initialStaff={selectedStaffForBooking}
        initialService={selectedServiceForBooking}
      />
    </div>
  );
}
