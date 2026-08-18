'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, AppointmentResponse, PaymentSummaryDto } from '@/lib/api';
import { Calendar, Key, Clock, MapPin, CreditCard, ArrowRight, CheckCircle2, XCircle, LayoutDashboard, Receipt } from 'lucide-react';

type NavSection = 'OVERVIEW' | 'UNLOCKS' | 'APPOINTMENTS' | 'PAYMENTS';

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
  const { user, activeUnlocks, getBranchUnlockRemainingTime } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [payments, setPayments] = useState<PaymentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<NavSection>('OVERVIEW');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    Promise.all([
      apiFetch<AppointmentResponse[]>('/appointments/my').catch(() => []),
      apiFetch<PaymentSummaryDto[]>('/client/payments').catch(() => []),
    ]).then(([a, p]) => { setAppointments(a); setPayments(p); }).finally(() => setLoading(false));
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
  const totalSpend = payments.reduce((s, p) => s + Number(p.totalAmount || 0), 0);

  const navItems: { section: NavSection; label: string; icon: React.ReactNode }[] = [
    { section: 'OVERVIEW', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: 'UNLOCKS', label: 'Active Unlocks', icon: <Key className="w-4 h-4" /> },
    { section: 'APPOINTMENTS', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { section: 'PAYMENTS', label: 'Payment History', icon: <CreditCard className="w-4 h-4" /> },
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
          <Link href="/branches" className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderRadius: 10 }}>
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar className="w-3.5 h-3.5" /> Book a Ritual
            </span>
          </Link>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ background: 'rgba(14,12,8,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {navItems.slice(0, 4).map(n => (
          <button
            key={n.section}
            onClick={() => setActiveSection(n.section)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium cursor-pointer transition-colors duration-200"
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
              <StatCard icon={<CreditCard className="w-4 h-4" />} label="Total Spent" value={`₹${totalSpend.toFixed(0)}`} sub="All time" />
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
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{a.staffName} · {a.branchName}</div>
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

            {activeUnlocks.length === 0 && upcomingAppts.length === 0 && !loading && (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <MapPin className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-parchment)' }}>Start your wellness journey</p>
                <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Browse branches and unlock a therapist roster for just ₹99.</p>
                <Link href="/branches" className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ borderRadius: 10 }}>
                  <span style={{ position: 'relative', zIndex: 2 }}>Explore Branches</span>
                </Link>
              </div>
            )}
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
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No branches unlocked today. Visit a branch to unlock for ₹99.</p>
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

        {/* ── PAYMENTS ──────────────────────────────────── */}
        {activeSection === 'PAYMENTS' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Payment History</h1>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Receipt className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No payment history yet.</p>
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {payments.map((p, i) => (
                  <div
                    key={p.id || i}
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                      borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-parchment)' }}>{p.description || p.paymentType}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹{p.totalAmount}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: p.status === 'COMPLETED' ? 'var(--color-jade)' : 'var(--color-muted)' }}>
                        {p.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
