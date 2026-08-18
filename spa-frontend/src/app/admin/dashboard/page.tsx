'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  apiFetch,
  BranchResponse,
  StaffCardResponse,
  AgentResponse,
  AppointmentResponse,
  PaymentSummaryDto,
} from '@/lib/api';
import {
  Shield, MapPin, Users, UserCheck, Calendar, CreditCard,
  Plus, Trash2, CheckCircle2, XCircle, Clock, RefreshCw,
  TrendingUp, X, Loader2, LayoutDashboard,
} from 'lucide-react';

type NavSection = 'OVERVIEW' | 'BRANCHES' | 'STAFF' | 'AGENTS' | 'APPOINTMENTS' | 'PAYMENTS';

function SidebarItem({ label, icon, active, badge, onClick }: {
  label: string; icon: React.ReactNode; active: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-left cursor-pointer transition-all duration-200 ${active ? 'sidebar-active' : ''}`}
      style={!active ? { color: 'var(--color-muted)' } : {}}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-parchment)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
    >
      <span className="flex items-center gap-3"><span className="shrink-0">{icon}</span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-bold"
          style={{ background: active ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.08)', color: active ? 'var(--color-gold-light)' : 'var(--color-muted)' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function GlowStatCard({ label, value, sub, icon, accent = 'gold' }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  accent?: 'gold' | 'jade' | 'rose' | 'blue';
}) {
  const colors = {
    gold: { color: 'var(--color-gold-light)', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.2)', glow: 'rgba(212,175,55,0.1)' },
    jade: { color: 'var(--color-jade)', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', glow: 'rgba(52,211,153,0.08)' },
    rose: { color: 'var(--color-rose-soft)', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)', glow: 'rgba(251,113,133,0.06)' },
    blue: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', glow: 'rgba(96,165,250,0.06)' },
  }[accent];

  return (
    <div
      className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden"
      style={{ borderRadius: 16, borderColor: colors.border }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)` }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{label}</span>
        <span style={{ color: colors.color }}>{icon}</span>
      </div>
      <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: colors.color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</div>}
    </div>
  );
}

function FormModal({ title, isOpen, onClose, children }: { title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}>
      <div
        className="modal-enter relative w-full max-w-xl max-h-[92vh] overflow-y-auto"
        style={{ background: 'rgba(14,12,8,0.97)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 24 }}
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>{label}</label>
      <input className="input-glass text-sm" {...props} />
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<NavSection>('OVERVIEW');
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [staff, setStaff] = useState<StaffCardResponse[]>([]);
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [payments, setPayments] = useState<PaymentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Branch form
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', address: '', city: '', state: '', pincode: '', phone: '', latitude: '', longitude: '', mapsUrl: '', openTime: '09:00', closeTime: '21:00' });

  // Staff form
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ branchId: '', name: '', specialization: '', bio: '', profilePhotoUrl: '' });

  // Agent form
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({ fullName: '', email: '', phone: '', password: '', assignedBranchId: '' });

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadAllAdminData = () => {
    setLoading(true);
    Promise.all([
      apiFetch<Record<string, unknown>>('/admin/dashboard').catch(() => ({})),
      apiFetch<BranchResponse[]>('/admin/branches').catch(() => []),
      apiFetch<StaffCardResponse[]>('/admin/staff').catch(() => []),
      apiFetch<AgentResponse[]>('/admin/agents').catch(() => []),
      apiFetch<AppointmentResponse[]>('/admin/appointments').catch(() => []),
      apiFetch<PaymentSummaryDto[]>('/admin/payments').catch(() => []),
    ]).then(([s, b, st, ag, ap, py]) => {
      setStats(s); setBranches(b); setStaff(st); setAgents(ag); setAppointments(ap); setPayments(py);
      if (!staffForm.branchId && b.length > 0) setStaffForm(prev => ({ ...prev, branchId: b[0].id }));
      if (!agentForm.assignedBranchId && b.length > 0) setAgentForm(prev => ({ ...prev, assignedBranchId: b[0].id }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') { router.push('/'); return; }
    loadAllAdminData();
  }, [user, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      await apiFetch<BranchResponse>('/admin/branches', { method: 'POST', body: JSON.stringify({ ...branchForm, latitude: parseFloat(branchForm.latitude), longitude: parseFloat(branchForm.longitude) }) });
      showMsg('✅ Branch created with geo-location successfully!');
      setBranchModalOpen(false);
      setBranchForm({ name: '', address: '', city: '', state: '', pincode: '', phone: '', latitude: '', longitude: '', mapsUrl: '', openTime: '09:00', closeTime: '21:00' });
      loadAllAdminData();
    } catch (err: unknown) { showMsg((err instanceof Error ? err.message : 'Failed to create branch'), 'error'); }
    finally { setFormLoading(false); }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      await apiFetch<StaffCardResponse>('/admin/staff', { method: 'POST', body: JSON.stringify(staffForm) });
      showMsg('✅ Therapist added to roster!');
      setStaffModalOpen(false);
      setStaffForm({ branchId: branches[0]?.id || '', name: '', specialization: '', bio: '', profilePhotoUrl: '' });
      loadAllAdminData();
    } catch (err: unknown) { showMsg((err instanceof Error ? err.message : 'Failed to add staff'), 'error'); }
    finally { setFormLoading(false); }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true);
    try {
      await apiFetch<AgentResponse>('/admin/agents', { method: 'POST', body: JSON.stringify(agentForm) });
      showMsg('✅ Agent account created & assigned!');
      setAgentModalOpen(false);
      setAgentForm({ fullName: '', email: '', phone: '', password: '', assignedBranchId: branches[0]?.id || '' });
      loadAllAdminData();
    } catch (err: unknown) { showMsg((err instanceof Error ? err.message : 'Failed to create agent'), 'error'); }
    finally { setFormLoading(false); }
  };

  const handleDeleteStaffPhoto = async (staffId: string) => {
    if (!confirm('Delete this profile photo permanently?')) return;
    try {
      await apiFetch<void>(`/admin/staff/${staffId}/profile-photo`, { method: 'DELETE' });
      showMsg('Profile photo deleted'); loadAllAdminData();
    } catch (err: unknown) { showMsg((err instanceof Error ? err.message : 'Failed'), 'error'); }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) return null;

  const initials = user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const totalRevenue = payments.reduce((s, p) => s + Number(p.totalAmount || 0), 0);

  const navItems: { section: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { section: 'OVERVIEW', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: 'BRANCHES', label: 'Branches', icon: <MapPin className="w-4 h-4" />, badge: branches.length },
    { section: 'STAFF', label: 'Staff Roster', icon: <Users className="w-4 h-4" />, badge: staff.length },
    { section: 'AGENTS', label: 'Agents', icon: <UserCheck className="w-4 h-4" />, badge: agents.length },
    { section: 'APPOINTMENTS', label: 'Appointments', icon: <Calendar className="w-4 h-4" />, badge: appointments.length },
    { section: 'PAYMENTS', label: 'Payments', icon: <CreditCard className="w-4 h-4" />, badge: payments.length },
  ];

  // Shared form select style
  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '0.75rem 1rem',
    color: 'var(--color-parchment)',
    fontSize: '0.875rem',
    outline: 'none',
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Sidebar (desktop) ──────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col shrink-0 w-64 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto"
        style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Identity */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1.5px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
            >
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{user.fullName}</div>
              <div className="badge-gold inline-flex mt-1 text-[10px] px-2 py-0.5">
                <Shield className="w-2.5 h-2.5" /> {user.role}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(n => (
            <SidebarItem key={n.section} label={n.label} icon={n.icon} badge={n.badge} active={activeSection === n.section} onClick={() => setActiveSection(n.section)} />
          ))}
        </nav>

        <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={loadAllAdminData} className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium cursor-pointer" style={{ borderRadius: 10 }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab ─────────────────────────────── */}
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

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 pb-24 lg:pb-10 space-y-8">

        {/* Message toast */}
        {message && (
          <div
            className="flex items-center justify-between gap-3 p-4 rounded-xl text-sm"
            style={{
              background: message.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)',
              border: `1px solid ${message.type === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.25)'}`,
              color: message.type === 'success' ? 'var(--color-jade)' : 'var(--color-rose-soft)',
            }}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── OVERVIEW ────────────────────────────────────── */}
        {activeSection === 'OVERVIEW' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold italic mb-1" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                Operations Centre
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Serene Haven · {user.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <GlowStatCard icon={<TrendingUp className="w-4 h-4" />} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub="All completed payments" accent="gold" />
              <GlowStatCard icon={<MapPin className="w-4 h-4" />} label="Active Branches" value={String(branches.length)} sub="With GPS & Maps" accent="jade" />
              <GlowStatCard icon={<Users className="w-4 h-4" />} label="Staff Therapists" value={String(staff.length)} sub="Across all branches" accent="blue" />
              <GlowStatCard icon={<UserCheck className="w-4 h-4" />} label="Agents" value={String(agents.length)} sub="Branch check-in agents" accent="gold" />
              <GlowStatCard icon={<Calendar className="w-4 h-4" />} label="Total Bookings" value={String(appointments.length)} sub="All time appointments" accent="jade" />
              <GlowStatCard icon={<CreditCard className="w-4 h-4" />} label="Payments" value={String(payments.length)} sub="Unlock + Booking transactions" accent="rose" />
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Add Branch', onClick: () => { setActiveSection('BRANCHES'); setBranchModalOpen(true); }, icon: <MapPin className="w-4 h-4" /> },
                  { label: 'Add Therapist', onClick: () => { setActiveSection('STAFF'); setStaffModalOpen(true); }, icon: <Users className="w-4 h-4" /> },
                  { label: 'Create Agent', onClick: () => { setActiveSection('AGENTS'); setAgentModalOpen(true); }, icon: <UserCheck className="w-4 h-4" /> },
                ].map(({ label, onClick, icon }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer"
                    style={{ borderRadius: 10 }}
                  >
                    <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {icon} {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BRANCHES ─────────────────────────────────────── */}
        {activeSection === 'BRANCHES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Spa Branches</h1>
              <button onClick={() => setBranchModalOpen(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer" style={{ borderRadius: 10 }}>
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Plus className="w-3.5 h-3.5" /> New Branch</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {branches.map(b => (
                  <div key={b.id} className="glass-card p-6 space-y-3" style={{ borderRadius: 18 }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>{b.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--color-gold)' }}>
                          <MapPin className="w-3 h-3" /> {b.city}, {b.state}
                        </div>
                      </div>
                      <span className="badge-jade shrink-0">Active</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{b.address}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ color: 'var(--color-muted)' }}>Hours: <span style={{ color: 'var(--color-parchment)' }}>{b.openTime?.substring(0,5)}–{b.closeTime?.substring(0,5)}</span></div>
                      <div style={{ color: 'var(--color-muted)' }}>Staff: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>{b.staffCount}</span></div>
                    </div>
                    {b.mapsUrl && (
                      <a href={b.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1" style={{ color: 'var(--color-gold)' }}>
                        <MapPin className="w-3 h-3" /> View on Google Maps ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STAFF ──────────────────────────────────────────── */}
        {activeSection === 'STAFF' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Staff Roster</h1>
              <button onClick={() => setStaffModalOpen(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer" style={{ borderRadius: 10 }}>
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Plus className="w-3.5 h-3.5" /> Add Therapist</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {staff.map(s => (
                  <div key={s.id} className="glass-card p-5 space-y-4" style={{ borderRadius: 18 }}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-lg" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-gold)' }}>
                        {s.profilePhotoUrl
                          ? <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                          : s.name[0]
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>{s.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.specializations?.join(', ')}</div>
                        <div className="mt-1.5">
                          {s.presentToday
                            ? <span className="badge-jade"><span className="presence-dot-present" /> Present</span>
                            : <span className="badge-rose"><XCircle className="w-3 h-3" /> On Leave</span>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{branches.find(b => b.id === s.branchId)?.name || 'No Branch'}</span>
                      {s.profilePhotoUrl && (
                        <button
                          onClick={() => handleDeleteStaffPhoto(s.id)}
                          className="flex items-center gap-1 text-xs cursor-pointer transition-colors duration-200"
                          style={{ color: 'var(--color-rose-soft)' }}
                          title="Delete profile photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Photo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AGENTS ─────────────────────────────────────────── */}
        {activeSection === 'AGENTS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Branch Agents</h1>
              <button onClick={() => setAgentModalOpen(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer" style={{ borderRadius: 10 }}>
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Plus className="w-3.5 h-3.5" /> Create Agent</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {agents.length === 0 ? (
                  <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>No agents yet. Create your first agent above.</div>
                ) : agents.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                    style={{ borderBottom: i < agents.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  >
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-cream)' }}>{a.fullName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{a.email} {a.phone ? `· ${a.phone}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--color-parchment)' }}>{a.assignedBranchName}</span>
                      <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa' }}>AGENT</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPOINTMENTS ──────────────────────────────────── */}
        {activeSection === 'APPOINTMENTS' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>All Appointments</h1>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {appointments.length === 0 ? (
                  <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>No appointments yet.</div>
                ) : appointments.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
                    style={{ borderBottom: i < appointments.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  >
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-cream)' }}>{a.serviceName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{a.clientName} · {a.staffName} · {a.branchName}</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{a.appointmentDate} at {a.startTime?.substring(0, 5)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={a.status === 'CONFIRMED' ? 'badge-jade' : a.status === 'CANCELLED' ? 'badge-rose' : 'badge-gold'}>
                        {a.status === 'CONFIRMED' ? <CheckCircle2 className="w-3 h-3" /> : a.status === 'CANCELLED' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {a.status}
                      </span>
                      <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹{a.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS ─────────────────────────────────────── */}
        {activeSection === 'PAYMENTS' && (() => {
          const clientSpendMap = payments.reduce<Record<string, { name: string; email: string; totalSpent: number; count: number; lastDate: string }>>((acc, p) => {
            const key = p.clientEmail || p.clientName || 'Unknown Client';
            if (!acc[key]) {
              acc[key] = {
                name: p.clientName || 'Client',
                email: p.clientEmail || key,
                totalSpent: 0,
                count: 0,
                lastDate: p.createdAt || '',
              };
            }
            acc[key].totalSpent += Number(p.totalAmount || 0);
            acc[key].count += 1;
            if (p.createdAt && (!acc[key].lastDate || new Date(p.createdAt) > new Date(acc[key].lastDate))) {
              acc[key].lastDate = p.createdAt;
            }
            return acc;
          }, {});

          const clientSpendList = Object.values(clientSpendMap).sort((a, b) => b.totalSpent - a.totalSpent);

          return (
            <div className="space-y-8">
              {/* Header & Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                    Client Spending &amp; Payment History
                  </h1>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    Track per-client lifetime value, branch unlock fees, and treatment transaction logs.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--color-gold-light)', fontFamily: 'var(--font-mono)' }}
                  >
                    Total Collected: ₹{totalRevenue.toLocaleString()}
                  </div>
                  <div
                    className="px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: 'var(--color-jade)', fontFamily: 'var(--font-mono)' }}
                  >
                    {clientSpendList.length} Paying Clients
                  </div>
                </div>
              </div>

              {/* 1. Client Lifetime Spend Table */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                  Client Lifetime Spend Breakdown
                </h2>
                {loading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
                ) : clientSpendList.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--color-muted)' }}>
                    No client payment records yet.
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="grid grid-cols-4 px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(212,175,55,0.06)', color: 'var(--color-gold-light)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <span>Client</span>
                      <span>Transactions</span>
                      <span>Last Activity</span>
                      <span className="text-right">Total Spent</span>
                    </div>
                    {clientSpendList.map((c, i) => (
                      <div
                        key={c.email || i}
                        className="grid grid-cols-4 items-center px-5 py-4 text-sm"
                        style={{
                          borderBottom: i < clientSpendList.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        }}
                      >
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--color-cream)' }}>{c.name}</div>
                          <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.email}</div>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-parchment)' }}>
                          {c.count} {c.count === 1 ? 'payment' : 'payments'}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {c.lastDate ? new Date(c.lastDate).toLocaleDateString('en-IN') : '—'}
                        </div>
                        <div className="text-right font-bold text-base" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                          ₹{c.totalSpent.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Detailed Payment Transaction Log */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                    Detailed Transactions Log
                  </h2>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Showing {payments.length} transactions
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}</div>
                ) : (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    {payments.length === 0 ? (
                      <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>No payments yet.</div>
                    ) : payments.map((p, i) => (
                      <div
                        key={p.id || i}
                        className="flex items-center justify-between px-5 py-4"
                        style={{ borderBottom: i < payments.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                      >
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'var(--color-parchment)' }}>
                            {p.description || p.paymentType}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            <span className="font-semibold text-white/80">{p.clientName || 'Client'}</span> ({p.clientEmail || 'client@example.com'}) · {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                            ₹{p.totalAmount}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: p.status === 'COMPLETED' ? 'var(--color-jade)' : 'var(--color-muted)' }}>
                            {p.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>

      {/* ══ CREATE BRANCH MODAL ══════════════════════════════ */}
      <FormModal title="Create New Branch" isOpen={branchModalOpen} onClose={() => setBranchModalOpen(false)}>
        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Branch Name" required placeholder="Indiranagar Spa" value={branchForm.name} onChange={e => setBranchForm(p => ({ ...p, name: e.target.value }))} />
            <InputField label="Phone" placeholder="+91 80 1234 5678" value={branchForm.phone} onChange={e => setBranchForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <InputField label="Address" required placeholder="100, 12th Main, Indiranagar" value={branchForm.address} onChange={e => setBranchForm(p => ({ ...p, address: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <InputField label="City" required placeholder="Bangalore" value={branchForm.city} onChange={e => setBranchForm(p => ({ ...p, city: e.target.value }))} />
            <InputField label="State" required placeholder="Karnataka" value={branchForm.state} onChange={e => setBranchForm(p => ({ ...p, state: e.target.value }))} />
            <InputField label="Pincode" required placeholder="560038" value={branchForm.pincode} onChange={e => setBranchForm(p => ({ ...p, pincode: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Latitude (GPS)" required type="number" step="any" placeholder="12.9716" value={branchForm.latitude} onChange={e => setBranchForm(p => ({ ...p, latitude: e.target.value }))} />
            <InputField label="Longitude (GPS)" required type="number" step="any" placeholder="77.5946" value={branchForm.longitude} onChange={e => setBranchForm(p => ({ ...p, longitude: e.target.value }))} />
          </div>
          <InputField label="Google Maps URL" placeholder="https://maps.google.com/..." value={branchForm.mapsUrl} onChange={e => setBranchForm(p => ({ ...p, mapsUrl: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Open Time" type="time" value={branchForm.openTime} onChange={e => setBranchForm(p => ({ ...p, openTime: e.target.value }))} />
            <InputField label="Close Time" type="time" value={branchForm.closeTime} onChange={e => setBranchForm(p => ({ ...p, closeTime: e.target.value }))} />
          </div>
          <button type="submit" disabled={formLoading} className="btn-gold w-full py-3.5 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50" style={{ borderRadius: 12, marginTop: 8 }}>
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {formLoading ? <><Loader2 className="w-4 h-4 spinner" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Branch</>}
            </span>
          </button>
        </form>
      </FormModal>

      {/* ══ ADD STAFF MODAL ══════════════════════════════════ */}
      <FormModal title="Add Therapist" isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)}>
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>Assign to Branch</label>
            <select value={staffForm.branchId} onChange={e => setStaffForm(p => ({ ...p, branchId: e.target.value }))} style={selectStyle}>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
            </select>
          </div>
          <InputField label="Therapist Name" required placeholder="Ananya Sharma" value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))} />
          <InputField label="Specialization" placeholder="Deep Tissue, Aromatherapy" value={staffForm.specialization} onChange={e => setStaffForm(p => ({ ...p, specialization: e.target.value }))} />
          <InputField label="Profile Photo URL" placeholder="https://cloudinary.com/..." value={staffForm.profilePhotoUrl} onChange={e => setStaffForm(p => ({ ...p, profilePhotoUrl: e.target.value }))} />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>Short Bio</label>
            <textarea
              value={staffForm.bio}
              onChange={e => setStaffForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="10+ years specializing in therapeutic deep tissue and hot stone massage…"
              rows={3}
              style={{ ...selectStyle, resize: 'vertical' }}
            />
          </div>
          <button type="submit" disabled={formLoading} className="btn-gold w-full py-3.5 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50" style={{ borderRadius: 12 }}>
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {formLoading ? <><Loader2 className="w-4 h-4 spinner" /> Adding…</> : <><Plus className="w-4 h-4" /> Add Therapist</>}
            </span>
          </button>
        </form>
      </FormModal>

      {/* ══ CREATE AGENT MODAL ════════════════════════════════ */}
      <FormModal title="Create Agent Account" isOpen={agentModalOpen} onClose={() => setAgentModalOpen(false)}>
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <InputField label="Full Name" required placeholder="Ravi Kumar" value={agentForm.fullName} onChange={e => setAgentForm(p => ({ ...p, fullName: e.target.value }))} />
          <InputField label="Email Address" type="email" required placeholder="agent@serenehaven.com" value={agentForm.email} onChange={e => setAgentForm(p => ({ ...p, email: e.target.value }))} />
          <InputField label="Phone" placeholder="+91 9876543210" value={agentForm.phone} onChange={e => setAgentForm(p => ({ ...p, phone: e.target.value }))} />
          <InputField label="Password" type="password" required minLength={6} placeholder="••••••••" value={agentForm.password} onChange={e => setAgentForm(p => ({ ...p, password: e.target.value }))} />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>Assign to Branch</label>
            <select value={agentForm.assignedBranchId} onChange={e => setAgentForm(p => ({ ...p, assignedBranchId: e.target.value }))} style={selectStyle}>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
            </select>
          </div>
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: 'var(--color-muted)' }}>
            <strong style={{ color: 'var(--color-gold-light)' }}>Agent Permissions:</strong> Can only toggle staff PRESENT / ON_LEAVE for today. Cannot create branches, manage payments, or view client data.
          </div>
          <button type="submit" disabled={formLoading} className="btn-gold w-full py-3.5 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50" style={{ borderRadius: 12 }}>
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {formLoading ? <><Loader2 className="w-4 h-4 spinner" /> Creating…</> : <><UserCheck className="w-4 h-4" /> Create Agent Account</>}
            </span>
          </button>
        </form>
      </FormModal>
    </div>
  );
}
