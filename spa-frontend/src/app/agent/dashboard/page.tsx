'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, BranchCheckinStatusResponse, StaffCardResponse } from '@/lib/api';
import { UserCheck, MapPin, CheckCircle2, XCircle, Clock, Camera, Sparkles, AlertCircle, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [compliance, setCompliance] = useState<BranchCheckinStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Photo Update Modal state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const loadAgentDashboard = () => {
    setLoading(true);
    apiFetch<BranchCheckinStatusResponse>('/agent/branch/checkin-status')
      .then(data => setCompliance(data))
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/agent/dashboard');
      return;
    }
    if (user.role !== 'AGENT' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    loadAgentDashboard();
  }, [user, router]);

  const handleCheckin = async (staffId: string, status: 'PRESENT' | 'ON_LEAVE') => {
    setActionLoading(staffId);
    setMessage(null);

    try {
      await apiFetch<void>(`/agent/staff/${staffId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setMessage(`Check-in marked as ${status} successfully.`);
      loadAgentDashboard();
    } catch (err: any) {
      setMessage(err.message || 'Failed to update check-in');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePhotoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId || !newPhotoUrl) return;

    setActionLoading(selectedStaffId);
    try {
      await apiFetch<void>(`/agent/staff/${selectedStaffId}/profile-photo`, {
        method: 'PUT',
        body: JSON.stringify({ photoUrl: newPhotoUrl }),
      });
      setMessage('Profile photo replaced successfully.');
      setPhotoModalOpen(false);
      setNewPhotoUrl('');
      loadAgentDashboard();
    } catch (err: any) {
      setMessage(err.message || 'Failed to update photo');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'AGENT') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="font-serif text-2xl font-bold">Agent Portal Restricted Access</h2>
        <p className="text-xs text-stone-400">Please sign in with an Agent account to access daily branch check-ins.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Agent Operations Desk</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
            {compliance?.branchName || user.assignedBranchName || 'Assigned Branch'}
          </h1>
          <p className="text-xs text-stone-400 mt-1 flex items-center gap-2">
            <span>Agent: <strong>{user.fullName}</strong></span>
            <span>•</span>
            <span>Date: <strong>{new Date().toLocaleDateString()}</strong></span>
          </p>
        </div>

        <button
          onClick={loadAgentDashboard}
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Compliance</span>
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

      {/* 1. COMPLIANCE METRICS WIDGET */}
      {compliance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5">
            <div className="text-stone-400 text-xs font-medium">Total Staff on Roster</div>
            <div className="font-serif text-3xl font-bold text-stone-100 mt-1">{compliance.totalStaff}</div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-5">
            <div className="text-emerald-400 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Present
            </div>
            <div className="font-serif text-3xl font-bold text-emerald-300 mt-1">{compliance.presentCount}</div>
          </div>

          <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-5">
            <div className="text-rose-400 text-xs font-medium flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> On Leave
            </div>
            <div className="font-serif text-3xl font-bold text-rose-300 mt-1">{compliance.onLeaveCount}</div>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-5">
            <div className="text-amber-400 text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Check-in
            </div>
            <div className="font-serif text-3xl font-bold text-amber-300 mt-1">{compliance.pendingCount}</div>
          </div>
        </div>
      )}

      {/* 2. STAFF DAILY CHECK-IN ROSTER */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-stone-100">
            Staff Daily Presence & Photo Management
          </h2>
          <span className="text-xs text-stone-500">Tap below to confirm attendance for today</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
            <span>Loading therapist roster...</span>
          </div>
        ) : compliance && compliance.staffCheckins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {compliance.staffCheckins.map(staff => (
              <div
                key={staff.staffId}
                className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-stone-700 transition"
              >
                <div className="space-y-4">
                  
                  {/* Photo & Name */}
                  <div className="flex items-start gap-4">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-2xl bg-stone-800 overflow-hidden border border-stone-700 shrink-0">
                        {staff.profilePhotoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={staff.profilePhotoUrl}
                            alt={staff.staffName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCheck className="w-8 h-8 text-stone-500 m-4" />
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStaffId(staff.staffId);
                          setNewPhotoUrl(staff.profilePhotoUrl || '');
                          setPhotoModalOpen(true);
                        }}
                        title="Replace Profile Photo"
                        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-amber-300 transition cursor-pointer text-[10px] font-bold gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Replace</span>
                      </button>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-serif text-lg font-bold text-stone-100 truncate">
                        {staff.staffName}
                      </h3>
                      <p className="text-xs text-stone-400 truncate">
                        {staff.specialization}
                      </p>

                      {/* Status Badge */}
                      <div className="pt-1">
                        {staff.status === 'PRESENT' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Present Today
                          </span>
                        )}
                        {staff.status === 'ON_LEAVE' && (
                          <span className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            <XCircle className="w-3 h-3 text-rose-400" /> On Leave
                          </span>
                        )}
                        {staff.status === 'NOT_CONFIRMED_YET' && (
                          <span className="inline-flex items-center gap-1 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-amber-400" /> Not Confirmed Yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {staff.confirmedAt && (
                    <div className="text-[10px] text-stone-500 border-t border-stone-800/80 pt-2 flex justify-between">
                      <span>Confirmed by: {staff.confirmedByAgentName || 'Agent'}</span>
                      <span>{new Date(staff.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}

                </div>

                {/* Quick Check-in One-Tap Buttons */}
                <div className="pt-4 border-t border-stone-800 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCheckin(staff.staffId, 'PRESENT')}
                    disabled={actionLoading === staff.staffId}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      staff.status === 'PRESENT'
                        ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
                        : 'bg-stone-800 hover:bg-stone-700 text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Today</span>
                  </button>

                  <button
                    onClick={() => handleCheckin(staff.staffId, 'ON_LEAVE')}
                    disabled={actionLoading === staff.staffId}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      staff.status === 'ON_LEAVE'
                        ? 'bg-rose-500 text-stone-950 shadow-md shadow-rose-500/20'
                        : 'bg-stone-800 hover:bg-stone-700 text-rose-400'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>On Leave</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-8 text-center text-xs text-stone-400">
            No working staff registered at this branch yet.
          </div>
        )}
      </div>

      {/* REPLACE PROFILE PHOTO MODAL */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
            <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              Replace Therapist Profile Photo
            </h3>

            <form onSubmit={handlePhotoUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                  New Image URL (Cloudinary / CDN)
                </label>
                <input
                  type="url"
                  required
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {newPhotoUrl && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-stone-700 mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
