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
  Users, MapPin, Calendar, CreditCard,
  Plus, Trash2, XCircle, LayoutDashboard, UserCheck,
  CheckCircle2, X, Loader2, Image as ImageIcon,
  ArrowRightLeft, Sparkles
} from 'lucide-react';
import StaffGalleryManageModal from '@/components/StaffGalleryManageModal';

type NavSection = 'OVERVIEW' | 'BRANCHES' | 'STAFF' | 'AGENTS' | 'APPOINTMENTS' | 'PAYMENTS';

function SidebarItem({
  label, icon, active, badge, onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-left cursor-pointer transition-all duration-200 ${active ? 'sidebar-active' : ''}`}
      style={!active ? { color: 'var(--color-muted)' } : {}}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-parchment)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
          style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--color-gold-light)' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function GlowStatCard({
  icon, label, value, sub, accent = 'gold',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: 'gold' | 'jade' | 'blue' | 'rose';
}) {
  const borderColors = {
    gold: 'rgba(212,175,55,0.2)',
    jade: 'rgba(52,211,153,0.2)',
    blue: 'rgba(96,165,250,0.2)',
    rose: 'rgba(251,113,133,0.2)',
  };
  const iconColors = {
    gold: 'var(--color-gold)',
    jade: 'var(--color-jade)',
    blue: '#60a5fa',
    rose: 'var(--color-rose-soft)',
  };

  return (
    <div
      className="glass-card p-6 flex flex-col gap-3 relative overflow-hidden"
      style={{ borderRadius: 20, borderColor: borderColors[accent] }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{label}</span>
        <span style={{ color: iconColors[accent] }}>{icon}</span>
      </div>
      <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cream)' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{sub}</div>}
    </div>
  );
}

function FormModal({
  title, isOpen, onClose, children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="modal-enter relative w-full max-w-lg p-8 rounded-3xl z-10 my-8 space-y-6"
        style={{ background: 'rgba(14,12,8,0.98)', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 25px 80px -15px rgba(0,0,0,0.85)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
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
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
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

  // Staff form & Gallery
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ branchId: '', name: '', specialization: '', bio: '', profilePhotoUrl: '', galleryPhotoUrls: '' });
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedStaffForGallery, setSelectedStaffForGallery] = useState<StaffCardResponse | null>(null);

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
    ]).then(([, b, st, ag, ap, py]) => {
      setBranches(b); setStaff(st); setAgents(ag); setAppointments(ap); setPayments(py);
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
      showMsg('✅ Therapist added to roster with gallery photos!');
      setStaffModalOpen(false);
      setStaffForm({ branchId: branches[0]?.id || '', name: '', specialization: '', bio: '', profilePhotoUrl: '', galleryPhotoUrls: '' });
      loadAllAdminData();
    } catch (err: unknown) { showMsg((err instanceof Error ? err.message : 'Failed to add staff'), 'error'); }
    finally { setFormLoading(false); }
  };

  const handleReassignBranch = async (staffId: string, targetBranchId: string) => {
    try {
      await apiFetch<StaffCardResponse>(`/admin/staff/${staffId}/assign-branch`, {
        method: 'POST',
        body: JSON.stringify({ branchId: targetBranchId }),
      });
      showMsg('✅ Therapist reassigned to branch successfully!');
      loadAllAdminData();
    } catch (err: unknown) {
      showMsg(err instanceof Error ? err.message : 'Failed to reassign therapist', 'error');
    }
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
      await apiFetch(`/admin/staff/${staffId}/profile-photo`, { method: 'DELETE' });
      showMsg('Profile photo deleted.');
      loadAllAdminData();
    } catch (err: unknown) { showMsg((err instanceof Error ? err.message : 'Failed to delete photo'), 'error'); }
  };

  if (!user) return null;

  const initials = user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.totalAmount) || 0), 0);

  const navItems = [
    { section: 'OVERVIEW' as NavSection, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { section: 'BRANCHES' as NavSection, label: 'Branches', icon: <MapPin className="w-4 h-4" />, badge: branches.length },
    { section: 'STAFF' as NavSection, label: 'Staff Roster', icon: <Users className="w-4 h-4" />, badge: staff.length },
    { section: 'AGENTS' as NavSection, label: 'Agents', icon: <UserCheck className="w-4 h-4" />, badge: agents.length },
    { section: 'APPOINTMENTS' as NavSection, label: 'Appointments', icon: <Calendar className="w-4 h-4" />, badge: appointments.length },
    { section: 'PAYMENTS' as NavSection, label: 'Payments', icon: <CreditCard className="w-4 h-4" />, badge: payments.length },
  ];

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: 'var(--color-cream)',
    padding: '10px 14px',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  };

  // Branches for Staff Organization
  const visibleBranches = selectedBranchFilter === 'ALL'
    ? branches
    : branches.filter(b => b.id === selectedBranchFilter);

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
              style={{ background: 'rgba(212,175,55,0.12)', border: '1.5px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
            >
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{user.fullName}</div>
              <div className="badge-gold inline-flex mt-1 text-[10px] px-2 py-0.5">{user.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(n => (
            <SidebarItem key={n.section} label={n.label} icon={n.icon} active={activeSection === n.section} badge={n.badge} onClick={() => setActiveSection(n.section)} />
          ))}
        </nav>
      </aside>

      {/* ── Mobile bottom tab ────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto"
        style={{ background: 'rgba(14,12,8,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {navItems.map(n => (
          <button
            key={n.section}
            onClick={() => setActiveSection(n.section)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium cursor-pointer transition-colors duration-200 min-w-[56px]"
            style={{ color: activeSection === n.section ? 'var(--color-gold-light)' : 'var(--color-muted)' }}
          >
            {n.icon}
            <span>{n.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 lg:p-10 pb-24 lg:pb-10">

        {/* Global message banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm ${message.type === 'success' ? 'badge-jade' : 'badge-rose'}`}
            style={{ borderRadius: 12 }}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── OVERVIEW ─────────────────────────────────────── */}
        {activeSection === 'OVERVIEW' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold italic mb-1" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                Executive Overview
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Real-time business and operations intelligence</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <GlowStatCard icon={<CreditCard className="w-4 h-4" />} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub="Lifetime platform collections" accent="gold" />
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
                  { label: 'Add Therapist & Gallery', onClick: () => { setActiveSection('STAFF'); setStaffModalOpen(true); }, icon: <Users className="w-4 h-4" /> },
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
                      <div style={{ color: 'var(--color-muted)' }}>Staff: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>{staff.filter(s => s.branchId === b.id).length}</span></div>
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

        {/* ── STAFF ROSTER (ORGANIZED BY BRANCHES) ───────────── */}
        {activeSection === 'STAFF' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                  Staff Roster &amp; Branch Assignments
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Organize therapists branch-by-branch, manage multi-photo galleries, and reassign staff across sanctuaries.
                </p>
              </div>

              <button
                onClick={() => {
                  setStaffForm(p => ({
                    ...p,
                    branchId: selectedBranchFilter !== 'ALL' ? selectedBranchFilter : (branches[0]?.id || '')
                  }));
                  setStaffModalOpen(true);
                }}
                className="btn-gold flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide cursor-pointer self-start sm:self-auto"
                style={{ borderRadius: 10 }}
              >
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus className="w-3.5 h-3.5" /> Add Therapist
                </span>
              </button>
            </div>

            {/* Branch Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-1 border-b border-white/10 pb-4">
              <button
                onClick={() => setSelectedBranchFilter('ALL')}
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200"
                style={selectedBranchFilter === 'ALL'
                  ? { background: 'var(--color-gold)', color: '#0A0906', fontWeight: 'bold' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-parchment)' }
                }
              >
                All Branches ({staff.length})
              </button>
              {branches.map(b => {
                const count = staff.filter(s => s.branchId === b.id).length;
                const active = selectedBranchFilter === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranchFilter(b.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200"
                    style={active
                      ? { background: 'var(--color-gold)', color: '#0A0906', fontWeight: 'bold' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-parchment)' }
                    }
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{b.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px]" style={{ background: active ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)' }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Branch Groups */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2].map(i => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : visibleBranches.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white/5 text-white/50 text-sm">
                No branches found.
              </div>
            ) : (
              <div className="space-y-10">
                {visibleBranches.map(branch => {
                  const branchStaff = staff.filter(s => s.branchId === branch.id);

                  return (
                    <div
                      key={branch.id}
                      className="p-6 sm:p-8 rounded-3xl space-y-6"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(212,175,55,0.15)',
                      }}
                    >
                      {/* Branch Header Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="badge-gold text-[10px]">SANCTUARY</span>
                            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{branch.city}, {branch.state}</span>
                          </div>
                          <h2 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                            {branch.name}
                          </h2>
                          <div className="flex items-center gap-4 text-xs mt-1 text-white/50">
                            <span>⏱ {branch.openTime?.substring(0, 5)} - {branch.closeTime?.substring(0, 5)}</span>
                            <span>👥 {branchStaff.length} Therapists Assigned</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setStaffForm(p => ({ ...p, branchId: branch.id }));
                            setStaffModalOpen(true);
                          }}
                          className="btn-gold flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer self-start sm:self-auto"
                          style={{ borderRadius: 10 }}
                        >
                          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Plus className="w-3.5 h-3.5" /> Add Therapist to this Branch
                          </span>
                        </button>
                      </div>

                      {/* Staff Cards inside this branch */}
                      {branchStaff.length === 0 ? (
                        <div
                          className="p-8 text-center rounded-2xl border border-dashed border-white/10 space-y-3"
                          style={{ background: 'rgba(0,0,0,0.2)' }}
                        >
                          <Users className="w-8 h-8 mx-auto" style={{ color: 'var(--color-gold)' }} />
                          <div className="text-sm font-semibold" style={{ color: 'var(--color-parchment)' }}>
                            No therapists assigned to {branch.name} yet.
                          </div>
                          <p className="text-xs text-white/40 max-w-sm mx-auto">
                            Add a new therapist or reassign an existing staff member from another branch below.
                          </p>
                          <button
                            onClick={() => {
                              setStaffForm(p => ({ ...p, branchId: branch.id }));
                              setStaffModalOpen(true);
                            }}
                            className="btn-gold inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            style={{ borderRadius: 8 }}
                          >
                            <span style={{ position: 'relative', zIndex: 2 }}>+ Add First Therapist</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {branchStaff.map(s => {
                            const photoCount = (s.galleryPhotos?.length || 0) + (s.profilePhotoUrl ? 1 : 0);

                            return (
                              <div
                                key={s.id}
                                className="glass-card p-6 flex flex-col justify-between gap-5"
                                style={{ borderRadius: 20 }}
                              >
                                <div className="space-y-4">
                                  {/* Avatar & Presence */}
                                  <div className="flex items-start gap-4">
                                    <div className="relative shrink-0">
                                      <div
                                        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
                                      >
                                        {s.profilePhotoUrl ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" />
                                        ) : (
                                          s.name[0]
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-bold text-base truncate" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                                        {s.name}
                                      </h3>
                                      <div className="text-xs font-medium truncate mt-0.5" style={{ color: 'var(--color-gold-light)' }}>
                                        {s.specialization || 'Wellness Specialist'}
                                      </div>
                                      <div className="mt-2">
                                        {s.presentToday ? (
                                          <span className="badge-jade text-[10px] px-2 py-0.5"><span className="presence-dot-present" /> Present</span>
                                        ) : (
                                          <span className="badge-rose text-[10px] px-2 py-0.5"><XCircle className="w-3 h-3" /> On Leave</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bio preview */}
                                  {s.bio && (
                                    <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                      {s.bio}
                                    </p>
                                  )}

                                  {/* Branch Reassign Control */}
                                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-amber-300/70 flex items-center gap-1">
                                      <ArrowRightLeft className="w-3 h-3" /> Assigned Sanctuary:
                                    </label>
                                    <select
                                      value={s.branchId}
                                      onChange={e => handleReassignBranch(s.id, e.target.value)}
                                      className="w-full text-xs py-2 px-3 rounded-xl cursor-pointer bg-white/5 border border-white/10 text-white/90 hover:border-amber-400/40 transition-colors"
                                    >
                                      {branches.map(b => (
                                        <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                                          {b.name} ({b.city})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Actions: Manage Gallery & Delete Photo */}
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedStaffForGallery(s);
                                        setGalleryModalOpen(true);
                                      }}
                                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5" />
                                      <span>Gallery ({photoCount})</span>
                                    </button>

                                    {s.profilePhotoUrl && (
                                      <button
                                        onClick={() => handleDeleteStaffPhoto(s.id)}
                                        title="Delete profile photo"
                                        className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors bg-white/5 hover:bg-rose-500/20 text-rose-300 border border-white/10"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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
              <div className="space-y-3">
                {agents.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-5 rounded-2xl glass-card" style={{ borderRadius: 16 }}>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-cream)' }}>{a.fullName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{a.email} {a.phone ? `· ${a.phone}` : ''}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-gold)' }}>Assigned: {a.assignedBranchName || 'No branch assigned'}</div>
                    </div>
                    <span className="badge-jade">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APPOINTMENTS ───────────────────────────────────── */}
        {activeSection === 'APPOINTMENTS' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>Appointments</h1>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Calendar className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No appointments booked yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-5 rounded-2xl glass-card" style={{ borderRadius: 16 }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <Calendar className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{a.serviceName}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Client: {a.clientName} ({a.clientPhone || a.clientEmail})</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Therapist: {a.staffName} · {a.branchName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹{a.totalPrice}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{a.appointmentDate} · {a.startTime?.substring(0,5)}</div>
                      <div className="mt-1"><span className={a.status === 'CONFIRMED' ? 'badge-jade' : 'badge-gold'}>{a.status}</span></div>
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

      {/* ══ ADD STAFF & MULTI-GALLERY MODAL ══════════════════ */}
      <FormModal title="Add Therapist & Photo Gallery" isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)}>
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>Assign to Branch</label>
            <select value={staffForm.branchId} onChange={e => setStaffForm(p => ({ ...p, branchId: e.target.value }))} style={selectStyle}>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
            </select>
          </div>
          <InputField label="Therapist Name" required placeholder="Ananya Sharma" value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))} />
          <InputField label="Specialization" placeholder="Deep Tissue, Aromatherapy, Swedish" value={staffForm.specialization} onChange={e => setStaffForm(p => ({ ...p, specialization: e.target.value }))} />
          <InputField label="Primary Profile Photo URL" placeholder="https://images.unsplash.com/... or image link" value={staffForm.profilePhotoUrl} onChange={e => setStaffForm(p => ({ ...p, profilePhotoUrl: e.target.value }))} />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-parchment)' }}>
              Additional Gallery Photo URLs (Multiple images)
            </label>
            <p className="text-[11px] text-white/40 mb-2">Separate multiple image URLs with commas (,)</p>
            <textarea
              value={staffForm.galleryPhotoUrls}
              onChange={e => setStaffForm(p => ({ ...p, galleryPhotoUrls: e.target.value }))}
              placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
              rows={2}
              style={{ ...selectStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>Short Bio &amp; Qualifications</label>
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
              {formLoading ? <><Loader2 className="w-4 h-4 spinner" /> Adding…</> : <><Plus className="w-4 h-4" /> Create Therapist &amp; Gallery</>}
            </span>
          </button>
        </form>
      </FormModal>

      {/* ══ MANAGE THERAPIST GALLERY MODAL ════════════════════ */}
      <StaffGalleryManageModal
        isOpen={galleryModalOpen}
        onClose={() => { setGalleryModalOpen(false); setSelectedStaffForGallery(null); }}
        staff={selectedStaffForGallery}
        isAdmin={true}
        onSuccess={() => {
          showMsg('✅ Therapist gallery updated successfully!');
          loadAllAdminData();
        }}
      />

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
            <strong style={{ color: 'var(--color-gold-light)' }}>Agent Permissions:</strong> Can only toggle staff PRESENT / ON_LEAVE for today and update photos at their assigned branch.
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
