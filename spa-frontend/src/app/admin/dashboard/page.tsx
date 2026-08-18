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
  SpaServiceResponse,
  BranchCheckinStatusResponse,
} from '@/lib/api';
import {
  Shield,
  MapPin,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Search,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANCHES' | 'STAFF' | 'AGENTS' | 'COMPLIANCE' | 'APPOINTMENTS' | 'PAYMENTS'>('OVERVIEW');
  const [stats, setStats] = useState<any>({});
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [staff, setStaff] = useState<StaffCardResponse[]>([]);
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [payments, setPayments] = useState<PaymentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Form Modals
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    latitude: '',
    longitude: '',
    mapsUrl: '',
    openTime: '09:00',
    closeTime: '21:00',
  });

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    branchId: '',
    name: '',
    specialization: '',
    bio: '',
    profilePhotoUrl: '',
  });

  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentForm, setAgentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    assignedBranchId: '',
  });

  const loadAllAdminData = () => {
    setLoading(true);
    Promise.all([
      apiFetch<any>('/admin/dashboard').catch(() => ({})),
      apiFetch<BranchResponse[]>('/admin/branches').catch(() => []),
      apiFetch<StaffCardResponse[]>('/admin/staff').catch(() => []),
      apiFetch<AgentResponse[]>('/admin/agents').catch(() => []),
      apiFetch<AppointmentResponse[]>('/admin/appointments').catch(() => []),
      apiFetch<PaymentSummaryDto[]>('/admin/payments').catch(() => []),
    ])
      .then(([statsData, branchesData, staffData, agentsData, apptsData, paymentsData]) => {
        setStats(statsData);
        setBranches(branchesData);
        setStaff(staffData);
        setAgents(agentsData);
        setAppointments(apptsData);
        setPayments(paymentsData);
        if (!staffForm.branchId && branchesData.length > 0) {
          setStaffForm(prev => ({ ...prev, branchId: branchesData[0].id }));
        }
        if (!agentForm.assignedBranchId && branchesData.length > 0) {
          setAgentForm(prev => ({ ...prev, assignedBranchId: branchesData[0].id }));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/admin/dashboard');
      return;
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    loadAllAdminData();
  }, [user, router]);

  // Handler for creating branch with required geo-location
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch<BranchResponse>('/admin/branches', {
        method: 'POST',
        body: JSON.stringify({
          ...branchForm,
          latitude: parseFloat(branchForm.latitude),
          longitude: parseFloat(branchForm.longitude),
        }),
      });
      setMessage('Branch created successfully with geo-location & maps link!');
      setBranchModalOpen(false);
      setBranchForm({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        latitude: '',
        longitude: '',
        mapsUrl: '',
        openTime: '09:00',
        closeTime: '21:00',
      });
      loadAllAdminData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to create branch');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch<StaffCardResponse>('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(staffForm),
      });
      setMessage('Therapist added to branch roster successfully!');
      setStaffModalOpen(false);
      setStaffForm({
        branchId: branches[0]?.id || '',
        name: '',
        specialization: '',
        bio: '',
        profilePhotoUrl: '',
      });
      loadAllAdminData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to add staff');
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch<AgentResponse>('/admin/agents', {
        method: 'POST',
        body: JSON.stringify(agentForm),
      });
      setMessage('Agent account created and assigned to branch!');
      setAgentModalOpen(false);
      setAgentForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        assignedBranchId: branches[0]?.id || '',
      });
      loadAllAdminData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to create agent');
    }
  };

  const handleDeleteStaffPhoto = async (staffId: string) => {
    if (!confirm('Are you sure you want to permanently delete this profile photo?')) return;
    try {
      await apiFetch<void>(`/admin/staff/${staffId}/profile-photo`, { method: 'DELETE' });
      setMessage('Staff profile photo deleted permanently');
      loadAllAdminData();
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete photo');
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Master Administration Suite</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
            Serene Haven Operations Center
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Logged in as <strong>{user.fullName}</strong> ({user.role}) • {user.email}
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh All Metrics</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-200">
            &times;
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-4">
        {[
          { id: 'OVERVIEW', label: 'Executive Metrics', icon: TrendingUp },
          { id: 'BRANCHES', label: `Branches (${branches.length})`, icon: MapPin },
          { id: 'STAFF', label: `Staff Roster (${staff.length})`, icon: Users },
          { id: 'AGENTS', label: `Agent Desk (${agents.length})`, icon: UserCheck },
          { id: 'APPOINTMENTS', label: `Bookings (${appointments.length})`, icon: Calendar },
          { id: 'PAYMENTS', label: `Revenue & Invoices (${payments.length})`, icon: CreditCard },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
              <div className="text-xs text-stone-400 font-medium">Total Completed Revenue</div>
              <div className="font-serif text-3xl font-bold text-amber-300 mt-2">
                ₹{stats.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : '0'}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">From ₹99 unlocks & online bookings</div>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
              <div className="text-xs text-stone-400 font-medium">Active Spa Branches</div>
              <div className="font-serif text-3xl font-bold text-stone-100 mt-2">
                {stats.totalBranches || branches.length}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">With geo-location & maps</div>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
              <div className="text-xs text-stone-400 font-medium">Therapists on Roster</div>
              <div className="font-serif text-3xl font-bold text-stone-100 mt-2">
                {stats.totalStaff || staff.length}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Across all branches</div>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6">
              <div className="text-xs text-stone-400 font-medium">Registered Clients</div>
              <div className="font-serif text-3xl font-bold text-stone-100 mt-2">
                {stats.totalClients || '0'}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">Free client accounts</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BRANCHES TAB (WITH REQUIRED GEO-LOCATION) */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-2xl font-bold text-stone-100">Spa Branch Management</h2>
            <button
              onClick={() => setBranchModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map(b => (
              <div key={b.id} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="inline-flex items-center gap-1.5 bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{b.city}, {b.state}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">{b.name}</h3>
                  <p className="text-xs text-stone-400 mt-1">{b.address}, PIN: {b.pincode}</p>
                </div>

                <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 text-xs space-y-1.5 text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Geo-Coordinates:</span>
                    <span className="font-mono text-stone-200">{b.latitude}, {b.longitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Hours:</span>
                    <span className="font-medium text-stone-200">{b.openTime ? b.openTime.substring(0, 5) : '09:00'} - {b.closeTime ? b.closeTime.substring(0, 5) : '21:00'}</span>
                  </div>
                </div>

                {b.mapsUrl && (
                  <a
                    href={b.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STAFF TAB */}
      {activeTab === 'STAFF' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-2xl font-bold text-stone-100">Working Staff & Therapists</h2>
            <button
              onClick={() => setStaffModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Therapist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staff.map(s => (
              <div key={s.id} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-800 overflow-hidden border border-stone-700 shrink-0">
                    {s.profilePhotoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={s.profilePhotoUrl} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-stone-500 m-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-100">{s.name}</h3>
                    <p className="text-xs text-stone-400">{s.specialization}</p>
                    <span className="inline-block mt-1 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-md">
                      {s.branchName}
                    </span>
                  </div>
                </div>

                {s.bio && <p className="text-xs text-stone-400 line-clamp-2">{s.bio}</p>}

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-stone-500">Today: {s.todayCheckinStatus}</span>
                  {s.profilePhotoUrl && (
                    <button
                      onClick={() => handleDeleteStaffPhoto(s.id)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Photo</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AGENTS TAB */}
      {activeTab === 'AGENTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-100">Branch Agent Desk</h2>
              <p className="text-xs text-stone-400">Agents are restricted to daily check-ins & photo replace for their assigned branch</p>
            </div>
            <button
              onClick={() => setAgentModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Agent Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agents.map(ag => (
              <div key={ag.id} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ag.assignedBranchName}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                    Active Agent
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-100">{ag.fullName}</h3>
                  <p className="text-xs text-stone-400">{ag.email}</p>
                  {ag.phone && <p className="text-xs text-stone-500">{ag.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. APPOINTMENTS TAB */}
      {activeTab === 'APPOINTMENTS' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-stone-100">All Appointments & Bookings</h2>

          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Branch</th>
                    <th className="p-4">Therapist</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-stone-800/30">
                      <td className="p-4 font-mono">{a.appointmentDate} {a.startTime.substring(0, 5)}</td>
                      <td className="p-4 font-semibold text-stone-200">{a.clientName}</td>
                      <td className="p-4">{a.branchName}</td>
                      <td className="p-4">{a.staffName}</td>
                      <td className="p-4">{a.serviceName}</td>
                      <td className="p-4 font-bold text-amber-300">{a.paymentMode}</td>
                      <td className="p-4 font-serif font-bold text-amber-200">₹{a.totalPrice}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. PAYMENTS & REVENUE TAB */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-stone-100">Revenue & Unlock Audit Trail</h2>

          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Base</th>
                    <th className="p-4">2% Tax</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-stone-800/30">
                      <td className="p-4 font-mono text-stone-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-stone-200">{p.clientName}</td>
                      <td className="p-4">{p.paymentType === 'BRANCH_UNLOCK' ? '₹99 Branch Unlock' : 'Service Booking'}</td>
                      <td className="p-4">₹{p.baseAmount}</td>
                      <td className="p-4 text-stone-400">₹{p.taxAmount}</td>
                      <td className="p-4 font-serif font-bold text-amber-300">₹{p.totalAmount}</td>
                      <td className="p-4 font-mono text-[10px] text-stone-400">{p.razorpayOrderId || 'AT_SPA'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE BRANCH MODAL */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold text-stone-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              Create Spa Branch
            </h3>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="Serene Haven — Whitefield"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Full Street Address *</label>
                <input
                  type="text"
                  required
                  value={branchForm.address}
                  onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="ITPL Main Road, Prestige Ozone"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={e => setBranchForm({ ...branchForm, city: e.target.value })}
                    placeholder="Bangalore"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.state}
                    onChange={e => setBranchForm({ ...branchForm, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={branchForm.pincode}
                    onChange={e => setBranchForm({ ...branchForm, pincode: e.target.value })}
                    placeholder="560066"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                  />
                </div>
              </div>

              {/* Geo-location fields (Mandatory) */}
              <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Mandatory Geo-Location (Latitude & Longitude)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={branchForm.latitude}
                      onChange={e => setBranchForm({ ...branchForm, latitude: e.target.value })}
                      placeholder="12.9698"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={branchForm.longitude}
                      onChange={e => setBranchForm({ ...branchForm, longitude: e.target.value })}
                      placeholder="77.7499"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-stone-100">Add Therapist</h3>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Assigned Branch *</label>
                <select
                  value={staffForm.branchId}
                  onChange={e => setStaffForm({ ...staffForm, branchId: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Therapist Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="Kavitha Nair"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  value={staffForm.specialization}
                  onChange={e => setStaffForm({ ...staffForm, specialization: e.target.value })}
                  placeholder="Deep Tissue & Hot Stone Therapy"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Profile Photo URL</label>
                <input
                  type="url"
                  value={staffForm.profilePhotoUrl}
                  onChange={e => setStaffForm({ ...staffForm, profilePhotoUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Therapist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE AGENT MODAL */}
      {agentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-stone-100">Create Agent Account</h3>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Assigned Branch *</label>
                <select
                  value={agentForm.assignedBranchId}
                  onChange={e => setAgentForm({ ...agentForm, assignedBranchId: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Agent Full Name *</label>
                <input
                  type="text"
                  required
                  value={agentForm.fullName}
                  onChange={e => setAgentForm({ ...agentForm, fullName: e.target.value })}
                  placeholder="Pooja Verma"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Agent Email *</label>
                <input
                  type="email"
                  required
                  value={agentForm.email}
                  onChange={e => setAgentForm({ ...agentForm, email: e.target.value })}
                  placeholder="agent.whitefield@serenehaven.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={agentForm.password}
                  onChange={e => setAgentForm({ ...agentForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAgentModalOpen(false)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
