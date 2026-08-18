'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, AppointmentResponse, BranchUnlockDto, PaymentSummaryDto } from '@/lib/api';
import { Calendar, Key, Clock, MapPin, Sparkles, CreditCard, AlertCircle, ArrowRight, User, CheckCircle2, X } from 'lucide-react';

export default function ClientDashboardPage() {
  const router = useRouter();
  const { user, activeUnlocks, getBranchUnlockRemainingTime } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [payments, setPayments] = useState<PaymentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/client/dashboard');
      return;
    }

    Promise.all([
      apiFetch<AppointmentResponse[]>('/appointments/my').catch(() => []),
      apiFetch<PaymentSummaryDto[]>('/client/payments').catch(() => []),
    ])
      .then(([appts, pymts]) => {
        setAppointments(appts);
        setPayments(pymts);
      })
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Wellness Portal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
            Welcome, {user.fullName}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {user.email} {user.phone ? `• ${user.phone}` : ''}
          </p>
        </div>

        <Link
          href="/branches"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 px-5 py-3 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <Calendar className="w-4 h-4" />
          <span>Book a New Ritual</span>
        </Link>
      </div>

      {/* 1. ACTIVE 1-DAY BRANCH UNLOCKS */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-200 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Active 1-Day Branch Access
        </h2>

        {activeUnlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeUnlocks.map(unlock => {
              const remaining = getBranchUnlockRemainingTime(unlock.branchId);

              return (
                <div
                  key={unlock.branchId}
                  className="bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg shadow-amber-500/5"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked Today
                    </span>
                    <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {remaining || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-100">
                      {unlock.branchName}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Access to view today&apos;s active therapists & online bookings.
                    </p>
                  </div>

                  <Link
                    href={`/branches/${unlock.branchId}`}
                    className="block text-center bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2 rounded-xl text-xs transition"
                  >
                    View Branch Therapists
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 text-center space-y-3">
            <Key className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="text-xs text-stone-400">
              You do not have any active branch unlocks today. Unlock any branch for ₹99 (+ 2% tax) to view available therapists.
            </p>
            <Link
              href="/branches"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
            >
              <span>Browse Spa Locations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. MY APPOINTMENTS */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-200 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          My Spa Appointments
        </h2>

        {appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map(app => (
              <div
                key={app.id}
                className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full">
                      {app.appointmentDate} at {app.startTime.substring(0, 5)}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      app.status === 'CONFIRMED'
                        ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-300'
                        : app.status === 'CANCELLED'
                        ? 'bg-rose-950/60 border border-rose-800/50 text-rose-300'
                        : 'bg-amber-950/60 border border-amber-800/50 text-amber-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-100">
                      {app.serviceName}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Therapist: <strong className="text-stone-200">{app.staffName}</strong> ({app.staffSpecialization})
                    </p>
                    <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{app.branchName} ({app.branchCity})</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400">Total Price: </span>
                    <span className="font-serif text-base font-bold text-amber-300">₹{app.totalPrice}</span>
                    <span className="text-[10px] text-stone-500 block">
                      ({app.paymentMode === 'ONLINE' ? 'Paid Online via Razorpay' : 'Pay at Reception'})
                    </span>
                  </div>

                  {app.branchMapsUrl && (
                    <a
                      href={app.branchMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 text-center text-xs text-stone-400">
            You have no upcoming spa appointments booked yet.
          </div>
        )}
      </div>

      {/* 3. PAYMENT & UNLOCK INVOICES */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-200 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-400" />
          Payment Receipts & Invoices
        </h2>

        {payments.length > 0 ? (
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-800">
                  <tr>
                    <th className="p-4">Date</th>
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
                      <td className="p-4 font-mono text-stone-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-stone-200">
                        {p.paymentType === 'BRANCH_UNLOCK' ? '1-Day Branch Unlock' : 'Spa Treatment Booking'}
                      </td>
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
        ) : (
          <div className="bg-stone-900/40 border border-stone-800 rounded-2xl p-6 text-center text-xs text-stone-400">
            No transaction records found.
          </div>
        )}
      </div>

    </div>
  );
}
