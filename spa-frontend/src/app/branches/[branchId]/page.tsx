'use client';

import React, { useState, useEffect, use } from 'react';
import { apiFetch, BranchResponse, SpaServiceResponse, StaffCardResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MapPin, Clock, Phone, Sparkles, Lock, Key, CheckCircle2, XCircle, AlertCircle, ShieldCheck, ArrowRight, User, Calendar, CreditCard } from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';
import BookingModal from '@/components/BookingModal';

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default function BranchDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const branchId = resolvedParams.branchId;

  const { user, isBranchUnlocked, getBranchUnlockRemainingTime } = useAuth();

  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [staff, setStaff] = useState<StaffCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<StaffCardResponse | null>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<SpaServiceResponse | null>(null);

  const unlocked = isBranchUnlocked(branchId);
  const remainingTime = getBranchUnlockRemainingTime(branchId);

  const loadBranchData = () => {
    setLoading(true);
    apiFetch<BranchResponse>(`/branches/${branchId}`)
      .then(b => setBranch(b))
      .catch(console.error);

    apiFetch<SpaServiceResponse[]>(`/branches/${branchId}/services`)
      .then(s => setServices(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadStaffData = () => {
    if (unlocked) {
      setStaffLoading(true);
      apiFetch<StaffCardResponse[]>(`/branches/${branchId}/staff`)
        .then(st => setStaff(st))
        .catch(console.error)
        .finally(() => setStaffLoading(false));
    }
  };

  useEffect(() => {
    loadBranchData();
  }, [branchId]);

  useEffect(() => {
    loadStaffData();
  }, [branchId, unlocked]);

  if (loading || !branch) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-400 mt-4">Loading branch sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-24">
      
      {/* 1. BRANCH HERO HEADER */}
      <section className="bg-stone-900/80 border-b border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{branch.city}, {branch.state} — Pincode: {branch.pincode}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-100">
                {branch.name}
              </h1>
              <p className="text-sm text-stone-400 max-w-2xl">
                {branch.address}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {branch.mapsUrl && (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 px-4 py-3 rounded-xl text-xs font-semibold transition"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Google Maps Directions</span>
                </a>
              )}

              {!unlocked && (
                <button
                  onClick={() => setUnlockModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock Staff Today (₹100.98)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800/80 text-xs">
            <div className="bg-stone-950/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div className="text-stone-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Operating Hours
              </div>
              <div className="font-semibold text-stone-200">
                {branch.openTime ? branch.openTime.substring(0, 5) : '09:00'} – {branch.closeTime ? branch.closeTime.substring(0, 5) : '21:00'} IST
              </div>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div className="text-stone-400 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> Reception Desk
              </div>
              <div className="font-semibold text-stone-200">{branch.phone || '+91 80 4123 4567'}</div>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div className="text-stone-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Treatments
              </div>
              <div className="font-semibold text-stone-200">{services.length} Signature Rituals</div>
            </div>

            <div className="bg-stone-950/60 border border-stone-800/80 p-3.5 rounded-xl">
              <div className="text-stone-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Today&apos;s Status
              </div>
              <div className="font-semibold text-emerald-400">
                {unlocked ? `Unlocked (${remainingTime || 'Active'})` : 'Staff Gated (₹99)'}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. TODAY'S THERAPISTS SECTION (LOCKED VS UNLOCKED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Practitioners</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
              Today&apos;s Available Therapists
            </h2>
          </div>

          {unlocked && (
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-semibold">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Access active until 11:59 PM IST tonight ({remainingTime} remaining)</span>
            </div>
          )}
        </div>

        {/* --- UNLOCKED STATE --- */}
        {unlocked ? (
          <div>
            {staffLoading ? (
              <div className="py-12 text-center text-xs text-stone-400">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading therapist roster & live check-ins...</span>
              </div>
            ) : staff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {staff.map(member => (
                  <div
                    key={member.id}
                    className="bg-stone-900/70 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-amber-500/40 transition group hover:shadow-xl hover:shadow-amber-500/5"
                  >
                    <div className="space-y-4">
                      
                      {/* Photo & Presence Header */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-stone-800 overflow-hidden border border-stone-700 shrink-0 relative">
                          {member.profilePhotoUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={member.profilePhotoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <User className="w-8 h-8 text-stone-500 m-4" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-200 transition">
                            {member.name}
                          </h3>
                          <p className="text-xs text-stone-400 font-medium">
                            {member.specialization}
                          </p>

                          {/* Check-in Presence Badge */}
                          <div className="pt-1">
                            {member.todayCheckinStatus === 'PRESENT' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Confirmed In Today
                              </span>
                            )}
                            {member.todayCheckinStatus === 'ON_LEAVE' && (
                              <span className="inline-flex items-center gap-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                On Leave Today
                              </span>
                            )}
                            {member.todayCheckinStatus === 'NOT_CONFIRMED_YET' && (
                              <span className="inline-flex items-center gap-1 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3 text-amber-400" />
                                Check-in Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed border-t border-stone-800/80 pt-3">
                          {member.bio}
                        </p>
                      )}

                    </div>

                    {/* Booking Action */}
                    <div className="pt-3 border-t border-stone-800">
                      <button
                        onClick={() => {
                          setSelectedStaffForBooking(member);
                          setBookingModalOpen(true);
                        }}
                        disabled={member.todayCheckinStatus === 'ON_LEAVE'}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          member.todayCheckinStatus === 'ON_LEAVE'
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {member.todayCheckinStatus === 'ON_LEAVE' ? 'Unavailable Today' : 'Book Session with ' + member.name.split(' ')[0]}
                        </span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-8 text-center text-xs text-stone-400">
                No therapists are assigned to this branch yet.
              </div>
            )}
          </div>
        ) : (
          /* --- LOCKED PAYWALL CARD --- */
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                Live Therapist Roster is Locked
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                To guarantee safety, verified attendance, and exclusivity, viewing which therapists are on duty at <strong className="text-amber-200">{branch.name}</strong> requires a daily unlock.
              </p>
            </div>

            {/* Pricing Box */}
            <div className="inline-flex items-baseline gap-2 bg-stone-950 border border-stone-800 px-6 py-3 rounded-2xl">
              <span className="text-xs text-stone-400">Unlock Today:</span>
              <span className="font-serif text-2xl font-bold text-amber-300">₹99.00</span>
              <span className="text-[11px] text-stone-500">+ 2% tax (₹100.98 Total)</span>
            </div>

            <div>
              <button
                onClick={() => setUnlockModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 text-sm tracking-wide transition cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Available Therapists for ₹100.98</span>
              </button>
              <p className="text-[11px] text-stone-500 mt-2">
                Valid for 1 Day • Access expires at 11:59 PM IST tonight
              </p>
            </div>

          </div>
        )}

      </section>

      {/* 3. TREATMENTS / SERVICES CATALOG FOR THIS BRANCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="border-b border-stone-800 pb-4">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Ritual Menu
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
            Treatments at {branch.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(svc => (
            <div
              key={svc.id}
              className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 rounded-full">
                    {svc.category}
                  </span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-500" /> {svc.durationMinutes} mins
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-200 transition">
                  {svc.name}
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-500 uppercase">Base Price</div>
                  <div className="font-serif text-xl font-bold text-amber-300">₹{svc.price}</div>
                </div>

                <button
                  onClick={() => {
                    if (!unlocked) {
                      setUnlockModalOpen(true);
                    } else {
                      setSelectedServiceForBooking(svc);
                      setBookingModalOpen(true);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    unlocked
                      ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  <span>{unlocked ? 'Book Now' : '🔒 Unlock to Book'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Unlock Paywall Modal */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        branchId={branch.id}
        branchName={branch.name}
        branchCity={branch.city}
        onSuccess={() => {
          loadStaffData();
        }}
      />

      {/* Booking Modal */}
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
