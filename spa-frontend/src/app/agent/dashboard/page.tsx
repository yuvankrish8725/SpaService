'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, StaffCardResponse } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, User, Camera, RefreshCw, LayoutDashboard, Users, Sparkles } from 'lucide-react';
import StaffGalleryManageModal from '@/components/StaffGalleryManageModal';

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
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedStaffForGallery, setSelectedStaffForGallery] = useState<StaffCardResponse | null>(null);

  const branchId = user?.assignedBranchId;
  const branchName = user?.assignedBranchName || 'Your Branch';

  const loadStaff = () => {
    if (!branchId) return;
    setLoading(true);
    apiFetch<StaffCardResponse[]>(`/agent/staff`)
      .then(data => setStaff(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'AGENT') { router.push('/'); return; }
    loadStaff();
  }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

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
    { section: 'ROSTER' as NavSection, label: 'Staff Roster & Gallery', icon: <Users className="w-4 h-4" /> },
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
            <span>{n.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 pb-24 lg:pb-10">

        {/* Message toast */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm flex items-center justify-between ${message.type === 'success' ? 'badge-jade' : 'badge-rose'}`}
            style={{ borderRadius: 12 }}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── CHECK-IN SECTION ────────────────────────── */}
        {activeSection === 'CHECKIN' && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-gold)' }}>
                {today}
              </div>
              <h1 className="text-3xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                Daily Presence Desk
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                {branchName} · Toggle daily presence for certified therapists
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center rounded-2xl">
                <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-jade)' }}>{presentCount}</div>
                <div className="text-xs text-white/50 mt-0.5">Present Today</div>
              </div>
              <div className="glass-card p-4 text-center rounded-2xl">
                <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-rose-soft)' }}>{leaveCount}</div>
                <div className="text-xs text-white/50 mt-0.5">On Leave</div>
              </div>
              <div className="glass-card p-4 text-center rounded-2xl">
                <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-gold)' }}>{pendingCount}</div>
                <div className="text-xs text-white/50 mt-0.5">Pending Check-in</div>
              </div>
            </div>

            {/* Staff list */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : staff.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/5 text-white/50 text-sm">
                No staff assigned to your branch.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(s => {
                  const present = s.presentToday;
                  const checkedIn = s.todayCheckinStatus !== 'NOT_CONFIRMED_YET';
                  const isItemLoading = actionLoading === s.id;
                  const photoCount = (s.galleryPhotos?.length || 0) + (s.profilePhotoUrl ? 1 : 0);

                  return (
                    <div
                      key={s.id}
                      className="glass-card p-6 flex flex-col justify-between gap-5"
                      style={{ borderRadius: 20, borderColor: present ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)' }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
                          >
                            {s.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              s.name[0]
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base truncate" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                              {s.name}
                            </h3>
                            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-gold-light)' }}>
                              {s.specialization || 'Wellness Specialist'}
                            </div>
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

                        {/* Check-in action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleCheckin(s.id, 'PRESENT')}
                            disabled={isItemLoading || present}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-50"
                            style={present
                              ? { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: 'var(--color-jade)' }
                              : { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--color-jade)' }
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {present ? 'Present ✓' : 'Mark Present'}
                          </button>
                          <button
                            onClick={() => handleCheckin(s.id, 'ON_LEAVE')}
                            disabled={isItemLoading || (checkedIn && !present)}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer transition-all disabled:opacity-50"
                            style={checkedIn && !present
                              ? { background: 'rgba(251,113,133,0.15)', border: '1px solid rgba(251,113,133,0.4)', color: 'var(--color-rose-soft)' }
                              : { background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--color-rose-soft)' }
                            }
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {checkedIn && !present ? 'On Leave ✓' : 'Mark Leave'}
                          </button>
                        </div>
                      </div>

                      {/* Manage Gallery Button */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedStaffForGallery(s);
                            setGalleryModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" /> Manage Gallery ({photoCount} photos)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ROSTER & GALLERY SECTION ────────────────── */}
        {activeSection === 'ROSTER' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                  Branch Staff &amp; Photo Gallery
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Full roster of certified therapists assigned to {branchName}.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(s => {
                  const photoCount = (s.galleryPhotos?.length || 0) + (s.profilePhotoUrl ? 1 : 0);

                  return (
                    <div key={s.id} className="glass-card p-6 flex flex-col justify-between gap-4" style={{ borderRadius: 20 }}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
                          >
                            {s.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-white/40" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                              {s.name}
                            </h3>
                            <div className="text-xs text-amber-300/80">{s.specialization || 'Wellness Specialist'}</div>
                          </div>
                        </div>

                        {s.bio && (
                          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                            {s.bio}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedStaffForGallery(s);
                          setGalleryModalOpen(true);
                        }}
                        className="btn-gold w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                        style={{ borderRadius: 10 }}
                      >
                        <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles className="w-3.5 h-3.5" /> Manage Photos ({photoCount})
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MANAGE THERAPIST GALLERY MODAL ───────────── */}
      <StaffGalleryManageModal
        isOpen={galleryModalOpen}
        onClose={() => { setGalleryModalOpen(false); setSelectedStaffForGallery(null); }}
        staff={selectedStaffForGallery}
        isAdmin={false}
        onSuccess={() => {
          setMessage({ text: '✅ Therapist gallery updated successfully!', type: 'success' });
          loadStaff();
        }}
      />
    </div>
  );
}
