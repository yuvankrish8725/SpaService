'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, StaffCardResponse } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, User, Camera, RefreshCw, LayoutDashboard, Users } from 'lucide-react';

type NavSection = 'CHECKIN' | 'ROSTER';

function SidebarItem({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
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

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>('CHECKIN');

  const branchId = user?.assignedBranchId;
  const branchName = user?.assignedBranchName || 'Your Branch';

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'AGENT') { router.push('/'); return; }
    loadStaff();
  }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStaff = () => {
    if (!branchId) return;
    setLoading(true);
    apiFetch<StaffCardResponse[]>(`/agent/branch/${branchId}/staff`)
      .then(data => setStaff(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCheckin = async (staffId: string, status: 'PRESENT' | 'ON_LEAVE') => {
    setActionLoading(staffId);
    setMessage(null);
    try {
      await apiFetch(`/agent/staff/${staffId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setMessage({ text: `Check-in updated: ${status === 'PRESENT' ? '✅ Present' : '🔴 On Leave'}`, type: 'success' });
      loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update check-in';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  const initials = user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const presentCount = staff.filter(s => s.presentToday).length;
  const leaveCount = staff.filter(s => !s.presentToday && s.todayCheckinStatus !== 'NOT_CONFIRMED_YET').length;
  const pendingCount = staff.filter(s => s.todayCheckinStatus === 'NOT_CONFIRMED_YET').length;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const navItems = [
    { section: 'CHECKIN' as NavSection, label: "Today's Check-in", icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: 'ROSTER' as NavSection, label: 'Staff Roster', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar (desktop) ──────────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col shrink-0 w-64 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Avatar */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'rgba(96,165,250,0.12)', border: '1.5px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}
            >
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{user.fullName}</div>
              <div className="text-[10px] px-2 py-0.5 rounded-full inline-flex mt-1" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>AGENT</div>
            </div>
          </div>
          <div className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>{branchName}</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(n => (
            <SidebarItem key={n.section} label={n.label} icon={n.icon} active={activeSection === n.section} onClick={() => setActiveSection(n.section)} />
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={loadStaff}
            className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium cursor-pointer"
            style={{ borderRadius: 10 }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab ────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ background: 'rgba(14,12,8,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {navItems.map(n => (
          <button
            key={n.section}
            onClick={() => setActiveSection(n.section)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium cursor-pointer transition-colors duration-200"
            style={{ color: activeSection === n.section ? 'var(--color-gold-light)' : 'var(--color-muted)' }}
          >
            {n.icon}
            <span>{n.label.split("'")[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 pb-24 lg:pb-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-gold)' }}>{today}</p>
          <h1
            className="text-3xl font-bold italic mb-1"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
          >
            {activeSection === 'CHECKIN' ? "Today's Check-in Desk" : 'Staff Roster'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{branchName}</p>
        </div>

        {/* Status message */}
        {message && (
          <div
            className="flex items-center gap-2.5 p-4 rounded-xl text-sm"
            style={{
              background: message.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)',
              border: `1px solid ${message.type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.25)'}`,
              color: message.type === 'success' ? 'var(--color-jade)' : 'var(--color-rose-soft)',
            }}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* ── CHECK-IN SECTION ────────────────────────── */}
        {activeSection === 'CHECKIN' && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Present', value: presentCount, color: 'var(--color-jade)', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)' },
                { label: 'On Leave', value: leaveCount, color: 'var(--color-rose-soft)', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)' },
                { label: 'Pending', value: pendingCount, color: 'var(--color-gold)', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.2)' },
              ].map(({ label, value, color, bg, border }) => (
                <div key={label} className="glass-card p-4 text-center" style={{ borderRadius: 14, background: bg, borderColor: border }}>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color }}>{value}</div>
                  <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Staff check-in cards */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : staff.length === 0 ? (
              <div
                className="text-center py-16 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No staff assigned to this branch yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {staff.map(s => {
                  const isLoading = actionLoading === s.id;
                  const present = s.presentToday;
                  const checkedIn = s.todayCheckinStatus !== 'NOT_CONFIRMED_YET';

                  return (
                    <div
                      key={s.id}
                      className="glass-card p-6 space-y-5"
                      style={{
                        borderRadius: 18,
                        borderColor: present
                          ? 'rgba(52,211,153,0.2)'
                          : checkedIn
                            ? 'rgba(251,113,133,0.2)'
                            : 'var(--glass-border)',
                      }}
                    >
                      {/* Staff info */}
                      <div className="flex items-center gap-4">
                        <div
                          className="relative w-14 h-14 rounded-full overflow-hidden shrink-0"
                          style={{
                            border: `2px solid ${present ? 'rgba(52,211,153,0.4)' : checkedIn ? 'rgba(251,113,133,0.4)' : 'rgba(255,255,255,0.1)'}`,
                          }}
                        >
                          {s.profilePhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-gold)' }}>
                              {s.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-bold text-base truncate"
                            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                          >
                            {s.name}
                          </div>
                          {s.specializations && s.specializations.length > 0 && (
                            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                              {s.specializations.slice(0, 2).join(' · ')}
                            </div>
                          )}

                          {/* Current status badge */}
                          <div className="mt-2">
                            {present ? (
                              <span className="badge-jade"><span className="presence-dot-present" /> Present Today</span>
                            ) : checkedIn ? (
                              <span className="badge-rose"><XCircle className="w-3 h-3" /> On Leave</span>
                            ) : (
                              <span className="badge-gold"><Clock className="w-3 h-3" /> Not Checked In</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── PRIMARY ACTION: Check-in buttons ────── */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleCheckin(s.id, 'PRESENT')}
                          disabled={isLoading || present}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-default"
                          style={present
                            ? { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: 'var(--color-jade)' }
                            : { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--color-jade)' }
                          }
                          onMouseEnter={e => { if (!present && !isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.15)'; }}
                          onMouseLeave={e => { if (!present && !isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.08)'; }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {present ? 'In Today ✓' : 'In Today'}
                        </button>
                        <button
                          onClick={() => handleCheckin(s.id, 'ON_LEAVE')}
                          disabled={isLoading || (checkedIn && !present)}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-default"
                          style={checkedIn && !present
                            ? { background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.4)', color: 'var(--color-rose-soft)' }
                            : { background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--color-rose-soft)' }
                          }
                          onMouseEnter={e => { if (!(checkedIn && !present) && !isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(251,113,133,0.15)'; }}
                          onMouseLeave={e => { if (!(checkedIn && !present) && !isLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(251,113,133,0.08)'; }}
                        >
                          <XCircle className="w-4 h-4" />
                          {checkedIn && !present ? 'On Leave ✓' : 'On Leave'}
                        </button>
                      </div>

                      {/* Loading indicator */}
                      {isLoading && (
                        <div className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                          <div className="w-4 h-4 rounded-full mx-auto" style={{ border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid var(--color-gold)', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      )}

                      {/* Secondary: Replace photo (small, not primary) */}
                      <div className="flex items-center justify-end pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          className="flex items-center gap-1.5 text-[11px] cursor-pointer transition-colors duration-200"
                          style={{ color: 'var(--color-muted)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-parchment)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
                          title="Replace profile photo (admin-approved)"
                        >
                          <Camera className="w-3.5 h-3.5" /> Replace Photo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ROSTER SECTION ──────────────────────────── */}
        {activeSection === 'ROSTER' && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Full staff list assigned to {branchName}.</p>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {staff.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 px-5 py-4"
                    style={{
                      borderBottom: i < staff.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-gold)' }}
                    >
                      {s.profilePhotoUrl
                        ? <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                        : <User className="w-5 h-5" style={{ color: 'var(--color-muted)' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-cream)' }}>{s.name}</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.specializations?.join(' · ') || 'General Therapist'}</div>
                    </div>
                    <div>
                      {s.presentToday
                        ? <span className="badge-jade"><span className="presence-dot-present" /> Present</span>
                        : s.todayCheckinStatus !== 'NOT_CONFIRMED_YET'
                          ? <span className="badge-rose"><XCircle className="w-3 h-3" /> On Leave</span>
                          : <span className="badge-gold"><Clock className="w-3 h-3" /> Pending</span>
                      }
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
