'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch, AuthResponse, PaymentOrderResponse } from '@/lib/api';
import { Lock, Sparkles, CheckCircle2, ShieldCheck, Clock, MapPin, X, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  branchCity?: string;
  onSuccess: () => void;
}

export default function UnlockModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  branchCity,
  onSuccess,
}: UnlockModalProps) {
  const { user, updateAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'DETAILS' | 'PAYING' | 'SUCCESS'>('DETAILS');
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInitiateUnlock = async () => {
    if (!user) {
      window.location.href = `/auth/login?redirect=/branches/${branchId}`;
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Call Backend to create unlock payment order
      const order = await apiFetch<PaymentOrderResponse>('/payments/branch-unlock/initiate', {
        method: 'POST',
        body: JSON.stringify({ branchId }),
      });
      setPaymentOrder(order);
      setStep('PAYING');

      // 2. Simulate Razorpay payment modal completion (or live Razorpay if SDK is embedded)
      setTimeout(async () => {
        try {
          // Call backend verify endpoint
          const authRes = await apiFetch<AuthResponse>('/payments/branch-unlock/verify', {
            method: 'POST',
            body: JSON.stringify({
              branchId,
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 12),
              razorpaySignature: 'sig_' + Math.random().toString(36).substring(2, 16),
            }),
          });

          // Update client JWT & unlock state
          updateAuth(authRes);
          setStep('SUCCESS');
          setLoading(false);

          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1800);
        } catch (verifyErr: any) {
          setErrorMsg(verifyErr.message || 'Payment verification failed');
          setStep('DETAILS');
          setLoading(false);
        }
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate unlock');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 shadow-2xl text-stone-100 overflow-hidden">
        
        {/* Decorative ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'DETAILS' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-amber-100">
                Unlock Daily Therapist Availability
              </h3>
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5" />
                <span>{branchName} {branchCity ? `(${branchCity})` : ''}</span>
              </div>
            </div>

            {/* Explanatory benefit cards */}
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>View verified therapist profiles, photos, and today&apos;s live presence check-in status.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Enable instant appointment bookings with your preferred certified therapist.</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Valid for <strong className="text-amber-200">1 Day</strong> (access expires at midnight 11:59 PM IST tonight).</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-stone-400">
                <span>1-Day Branch Unlock Access</span>
                <span>₹99.00</span>
              </div>
              <div className="flex justify-between text-xs text-stone-400">
                <span>Online Processing & Service Tax (2%)</span>
                <span>₹1.98</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-stone-200">Total Amount</span>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-amber-300">₹100.98</span>
                  <span className="block text-[10px] text-stone-400">One-time payment for today</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* CTA Button */}
            {!user ? (
              <Link
                href={`/auth/login?redirect=/branches/${branchId}`}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition"
              >
                <span>Sign in to Unlock (₹100.98)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={handleInitiateUnlock}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition disabled:opacity-50 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹100.98 & Unlock Now</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Secure Razorpay Payment Gateway</span>
            </div>

          </div>
        )}

        {step === 'PAYING' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <h4 className="font-serif text-xl font-bold text-amber-200">Processing Razorpay Payment...</h4>
            <p className="text-xs text-stone-400">Verifying transaction of ₹100.98 for {branchName}...</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-emerald-200">Branch Unlocked!</h4>
            <p className="text-xs text-stone-300">
              You now have full access to today&apos;s active therapists at <strong className="text-amber-200">{branchName}</strong> until midnight.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
