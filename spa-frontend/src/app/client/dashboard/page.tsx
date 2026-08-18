'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, AppointmentResponse, BranchResponse, SpaServiceResponse } from '@/lib/api';
import {
  Calendar, Key, Clock, MapPin, ArrowRight, CheckCircle2,
  XCircle, LayoutDashboard, Sparkles, Search, Lock, Phone
} from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';
import BookingModal from '@/components/BookingModal';

type NavSection = 'OVERVIEW' | 'BRANCHES' | 'TREATMENTS' | 'UNLOCKS' | 'APPOINTMENTS';

const BRANCH_IMAGES = [
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498842812179-c81beecf902c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&auto=format&fit=crop&q=80',
];

function SidebarItem({
  label, icon, active, onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left cursor-pointer transition-all duration-200 ${active ? 'sidebar-active' : ''}`}
      style={!active ? { color: 'var(--color-muted)' } : {}}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-parchment)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div
      className="glass-card p-5 flex flex-col gap-2"
      style={{ borderRadius: 16 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{label}</span>
        <span style={{ color: 'var(--color-gold)' }}>{icon}</span>
      </div>
      <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cream)' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const { user, activeUnlocks, getBranchUnlockRemainingTime, isBranchUnlocked } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<NavSection>('OVERVIEW');
  const [countdown, setCountdown] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [selectedBranchToUnlock, setSelectedBranchToUnlock] = useState<BranchResponse | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<SpaServiceResponse | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([
      apiFetch<AppointmentResponse[]>('/appointments/my').catch(() => []),
      apiFetch<BranchResponse[]>('/branches').catch(() => []),
      apiFetch<SpaServiceResponse[]>('/services').catch(() => []),
    ]).then(([a, b, s]) => {
      setAppointments(a);
      setBranches(b);
      setServices(s);
    }).finally(() => setLoading(false));
  }, [user, router]);

  // Countdown to 23:59:59
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(); end.setHours(23, 59, 59, 0);
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) { setCountdown('Expires soon'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!user) return null;

  const initials = user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const upcomingAppts = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchCity.toLowerCase()) ||
    b.city.toLowerCase().includes(searchCity.toLowerCase()) ||
    b.address.toLowerCase().includes(searchCity.toLowerCase())
  );
  const cities = Array.from(new Set(branches.map(b => b.city)));

  const navItems: { section: NavSection; label: string; icon: React.ReactNode }[] = [
    { section: 'OVERVIEW', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: 'BRANCHES', label: 'Branches', icon: <MapPin className="w-4 h-4" /> },
    { section: 'TREATMENTS', label: 'Treatments', icon: <Sparkles className="w-4 h-4" /> },
    { section: 'UNLOCKS', label: 'Active Unlocks', icon: <Key className="w-4 h-4" /> },
    { section: 'APPOINTMENTS', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left Sidebar (desktop) ──────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col shrink-0 w-64 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Avatar */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1.5px solid rgba(52,211,153,0.3)', color: 'var(--color-jade)' }}
            >
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{user.fullName}</div>
              <div className="badge-jade inline-flex mt-1 text-[10px] px-2 py-0.5">CLIENT</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(n => (
            <SidebarItem key={n.section} label={n.label} icon={n.icon} active={activeSection === n.section} onClick={() => setActiveSection(n.section)} />
          ))}
        </nav>

        {/* CTA at bottom */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveSection('BRANCHES')}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
            style={{ borderRadius: 10 }}
          >
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin className="w-3.5 h-3.5" /> Explore Branches
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
        style={{ background: 'rgba(14,12,8,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {navItems.map(n => (
          <button
            key={n.section}
            onClick={() => setActiveSection(n.section)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium cursor-pointer transition-colors duration-200 min-w-[60px]"
            style={{ color: activeSection === n.section ? 'var(--color-gold-light)' : 'var(--color-muted)' }}
          >
            {n.icon}
            <span>{n.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 pb-24 lg:pb-10">

        {/* ── OVERVIEW ────────────────────────────────── */}
        {activeSection === 'OVERVIEW' && (
          <div className="space-y-8">
            <div>
              <h1
                className="text-3xl font-bold italic mb-1"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
              >
                Welcome back, {user.fullName.split(' ')[0]}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{user.email}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<Key className="w-4 h-4" />} label="Active Unlocks" value={String(activeUnlocks.length)} sub="Valid until 11:59 PM IST" />
              <StatCard icon={<Calendar className="w-4 h-4" />} label="Upcoming Sessions" value={String(upcomingAppts.length)} sub="Confirmed bookings" />
              <StatCard icon={<Sparkles className="w-4 h-4" />} label="Available Rituals" value={String(services.length)} sub="Across all branches" />
            </div>

            {/* Active unlocks quick-view */}
            {activeUnlocks.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Active Today</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {activeUnlocks.map(unlock => (
                    <div
                      key={unlock.branchId}
                      className="glass-card p-5 space-y-3"
                      style={{ borderRadius: 16, borderColor: 'rgba(212,175,55,0.2)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--color-cream)' }}>{unlock.branchName}</span>
                      </div>
                      <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-jade)' }}>
                        ⏱ {countdown} remaining
                      </div>
                      <Link
                        href={`/branches/${unlock.branchId}`}
                        className="flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
                        style={{ color: 'var(--color-gold)' }}
                      >
                        View Therapists <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Branches Strip */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Explore Spa Locations</h2>
                <button
                  onClick={() => setActiveSection('BRANCHES')}
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {branches.slice(0, 3).map((b) => {
                  const unlocked = isBranchUnlocked(b.id);
                  return (
                    <div key={b.id} className="glass-card p-5 space-y-3" style={{ borderRadius: 16 }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: 'var(--color-cream)' }}>{b.name}</h3>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-gold)' }}>{b.city}</div>
                        </div>
                        {unlocked ? (
                          <span className="badge-jade text-[10px]">Unlocked</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-parchment)' }}>₹99 / Day</span>
                        )}
                      </div>
                      <Link
                        href={`/branches/${b.id}`}
                        className="btn-gold flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider"
                        style={{ borderRadius: 8 }}
                      >
                        <span style={{ position: 'relative', zIndex: 2 }}>{unlocked ? 'View Roster' : 'View & Unlock'}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming appointments */}
            {upcomingAppts.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Upcoming Appointments</h2>
                <div className="space-y-3">
                  {upcomingAppts.slice(0, 3).map(a => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                        >
                          <Calendar className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{a.serviceName}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>with {a.staffName} · {a.branchName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                          {a.appointmentDate}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{a.startTime?.substring(0, 5)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BRANCHES SECTION ───────────────────────────── */}
        {activeSection === 'BRANCHES' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                  Spa Branches &amp; Locations
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Explore verified locations, open hours, and unlock today&apos;s active therapist roster for ₹99.
                </p>
              </div>

              {/* City filter pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchCity('')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200"
                  style={searchCity === ''
                    ? { background: 'var(--color-gold)', color: '#0A0906' }
                    : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                  }
                >
                  All ({branches.length})
                </button>
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => setSearchCity(city)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200"
                    style={searchCity === city
                      ? { background: 'var(--color-gold)', color: '#0A0906' }
                      : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                    }
                  >
                    <MapPin className="w-3 h-3" /> {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
              <input
                type="text"
                placeholder="Search branch by name, city, or address…"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                className="input-glass pl-10 text-xs py-2.5"
              />
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No branches match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map((b, idx) => {
                  const unlocked = isBranchUnlocked(b.id);
                  const remaining = getBranchUnlockRemainingTime(b.id);

                  return (
                    <div key={b.id} className="glass-card overflow-hidden group" style={{ borderRadius: 20 }}>
                      <div className="relative h-48 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={BRANCH_IMAGES[idx % BRANCH_IMAGES.length]}
                          alt={b.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,6,0.8) 0%, transparent 60%)' }} />
                        <div
                          className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{ background: 'rgba(10,9,6,0.85)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold-light)' }}
                        >
                          <MapPin className="w-3 h-3" /> {b.city}, {b.state}
                        </div>
                        {unlocked ? (
                          <div className="absolute top-3 right-3 badge-jade text-[11px]">
                            <Key className="w-3 h-3" /> Unlocked {remaining && `· ${remaining}`}
                          </div>
                        ) : (
                          <div
                            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{ background: 'rgba(10,9,6,0.85)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-parchment)' }}
                          >
                            <Lock className="w-3 h-3" /> ₹99 / Day
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                            {b.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                          {b.address}, {b.pincode}
                        </p>
                        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                            <Clock className="w-3 h-3" style={{ color: 'var(--color-gold)' }} />
                            {b.openTime?.substring(0, 5)} – {b.closeTime?.substring(0, 5)}
                          </span>
                          <span style={{ color: 'var(--color-gold-light)', fontFamily: 'var(--font-mono)' }}>
                            {b.staffCount} Therapists
                          </span>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Link
                            href={`/branches/${b.id}`}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center uppercase tracking-wide transition-all duration-200"
                            style={unlocked
                              ? { background: 'linear-gradient(135deg, #D4AF37, #A08828)', color: '#0A0906' }
                              : { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-parchment)' }
                            }
                          >
                            {unlocked ? "View Today's Roster" : 'View & Unlock'}
                          </Link>
                          {!unlocked && (
                            <button
                              onClick={() => setSelectedBranchToUnlock(b)}
                              title="Unlock for ₹99"
                              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200"
                              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--color-gold)' }}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {b.mapsUrl && (
                            <a
                              href={b.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Google Maps"
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-gold)' }}
                            >
                              <MapPin className="w-3.5 h-3.5" />
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
        )}

        {/* ── TREATMENTS SECTION ─────────────────────────── */}
        {activeSection === 'TREATMENTS' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                Therapeutic Treatments &amp; Rituals
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                Bespoke wellness therapies performed by certified practitioners across all branches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map(svc => (
                <div key={svc.id} className="glass-card p-6 flex flex-col justify-between gap-4" style={{ borderRadius: 18 }}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--color-gold)' }}>
                        {svc.category}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                        <Clock className="w-3 h-3" /> {svc.durationMinutes} mins
                      </span>
                    </div>
                    <h3 className="text-lg font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                      {svc.name}
                    </h3>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                      {svc.description || 'Restorative wellness ritual designed for deep relaxation and muscle release.'}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-white/5">
                    <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                      ₹{svc.price}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedServiceForBooking(svc);
                        setBookingModalOpen(true);
                      }}
                      className="btn-gold px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      style={{ borderRadius: 8 }}
                    >
                      <span style={{ position: 'relative', zIndex: 2 }}>Book Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UNLOCKS ────────────────────────────────────── */}
        {activeSection === 'UNLOCKS' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
              Active Branch Unlocks
            </h1>
            {activeUnlocks.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Key className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No branches unlocked today. Explore branches to unlock for ₹99.</p>
                <button
                  onClick={() => setActiveSection('BRANCHES')}
                  className="btn-gold mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  style={{ borderRadius: 10 }}
                >
                  <span style={{ position: 'relative', zIndex: 2 }}>Explore Branches</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeUnlocks.map(unlock => (
                  <div
                    key={unlock.branchId}
                    className="glass-card p-6 space-y-4"
                    style={{ borderRadius: 18, borderColor: 'rgba(212,175,55,0.2)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Key className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                      <span className="font-bold" style={{ color: 'var(--color-cream)', fontFamily: 'var(--font-playfair)' }}>{unlock.branchName}</span>
                    </div>
                    <div className="badge-jade inline-flex">
                      <span className="presence-dot-present" />
                      Unlocked Today
                    </div>
                    <div
                      className="text-sm p-3 rounded-xl"
                      style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', color: 'var(--color-jade)', fontFamily: 'var(--font-mono)' }}
                    >
                      ⏱ {countdown} until 11:59 PM IST
                    </div>
                    <Link
                      href={`/branches/${unlock.branchId}`}
                      className="btn-gold flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide"
                      style={{ borderRadius: 10 }}
                    >
                      <span style={{ position: 'relative', zIndex: 2 }}>View Therapists</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPOINTMENTS ───────────────────────────────── */}
        {activeSection === 'APPOINTMENTS' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>My Appointments</h1>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No appointments yet. Book a session to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
                      >
                        <Calendar className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--color-cream)' }}>{a.serviceName}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>with {a.staffName} · {a.branchName}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {a.appointmentDate} at {a.startTime?.substring(0, 5)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={a.status === 'CONFIRMED' ? 'badge-jade' : a.status === 'CANCELLED' ? 'badge-rose' : 'badge-gold'}
                      >
                        {a.status === 'CONFIRMED' ? <CheckCircle2 className="w-3 h-3" /> : a.status === 'CANCELLED' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {a.status}
                      </span>
                      <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                        ₹{a.totalPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

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

      {/* Booking modal */}
      {bookingModalOpen && branches.length > 0 && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => { setBookingModalOpen(false); setSelectedServiceForBooking(null); }}
          branchId={branches[0].id}
          branchName={branches[0].name}
          branchCity={branches[0].city}
          initialService={selectedServiceForBooking}
          onBookingSuccess={() => {
            setBookingModalOpen(false);
            apiFetch<AppointmentResponse[]>('/appointments/my').then(setAppointments).catch(console.error);
          }}
        />
      )}
    </div>
  );
}
