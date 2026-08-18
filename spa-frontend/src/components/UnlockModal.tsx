'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch, AuthResponse, PaymentOrderResponse } from '@/lib/api';
import { Lock, Key, CheckCircle2, ShieldCheck, Clock, MapPin, X, CreditCard, Loader2 } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInitiateUnlock = async () => {
    if (!user) {
      window.location.href = `/auth/login`;
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const order = await apiFetch<PaymentOrderResponse>('/payments/branch-unlock/initiate', {
        method: 'POST',
        body: JSON.stringify({ branchId }),
      });

      setStep('PAYING');

      // Simulate Razorpay flow
      setTimeout(async () => {
        try {
          const authRes = await apiFetch<AuthResponse>('/payments/branch-unlock/verify', {
            method: 'POST',
            body: JSON.stringify({
              branchId,
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 12),
              razorpaySignature: 'sig_' + Math.random().toString(36).substring(2, 16),
            }),
          });
          updateAuth(authRes);
          setStep('SUCCESS');
          setLoading(false);
          setTimeout(() => { onSuccess(); onClose(); }, 2000);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Payment verification failed';
          setErrorMsg(msg);
          setStep('DETAILS');
          setLoading(false);
        }
      }, 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initiate payment';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="modal-enter relative w-full max-w-md overflow-hidden"
        style={{
          background: 'rgba(14,12,8,0.97)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 24,
          boxShadow: '0 32px 80px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Gold ambient glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 z-10"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-cream)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-8">

          {/* ── STEP: DETAILS ──────────────────────────── */}
          {step === 'DETAILS' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
                >
                  <Key className="w-7 h-7" style={{ color: 'var(--color-gold)' }} />
                </div>
                <h3
                  className="text-2xl font-bold italic"
                  style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                >
                  Unlock Today&apos;s Roster
                </h3>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--color-gold-light)' }}
                >
                  <MapPin className="w-3 h-3" />
                  {branchName}{branchCity ? ` · ${branchCity}` : ''}
                </div>
              </div>

              {/* What you get */}
              <div
                className="space-y-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {[
                  { icon: <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-jade)' }} />, text: "View all certified therapists confirmed present today" },
                  { icon: <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-jade)' }} />, text: "See therapist photos, specializations, and live presence badges" },
                  { icon: <Clock className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />, text: "1-Day access · Valid until 11:59 PM IST tonight" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-parchment)' }}>
                    <span className="shrink-0 mt-0.5">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Receipt-style price breakdown */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div
                  className="px-5 py-3 flex justify-between text-sm"
                  style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span style={{ color: 'var(--color-muted)' }}>1-Day Branch Unlock</span>
                  <span style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-mono)' }}>₹99.00</span>
                </div>
                <div
                  className="px-5 py-3 flex justify-between text-sm"
                  style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span style={{ color: 'var(--color-muted)' }}>Online Processing Tax (2%)</span>
                  <span style={{ color: 'var(--color-parchment)', fontFamily: 'var(--font-mono)' }}>₹1.98</span>
                </div>
                <div className="px-5 py-4 flex justify-between items-center" style={{ background: 'rgba(212,175,55,0.05)' }}>
                  <span className="font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--color-cream)' }}>Total Due Today</span>
                  <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹100.98</span>
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div
                  className="p-3.5 rounded-xl text-sm text-center"
                  style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}
                >
                  {errorMsg}
                </div>
              )}

              {/* CTA */}
              {!user ? (
                <Link
                  href={`/auth/login`}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-wider"
                  style={{ borderRadius: 12 }}
                >
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock className="w-4 h-4" /> Sign In to Unlock
                  </span>
                </Link>
              ) : (
                <button
                  onClick={handleInitiateUnlock}
                  disabled={loading}
                  className="btn-gold w-full py-4 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  style={{ borderRadius: 12 }}
                >
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 spinner" /> Processing…</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Pay ₹100.98 &amp; Unlock Now</>
                    )}
                  </span>
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-jade)' }} />
                100% Secure Razorpay Payment Gateway
              </div>
            </div>
          )}

          {/* ── STEP: PAYING ──────────────────────────── */}
          {step === 'PAYING' && (
            <div className="py-14 text-center space-y-5">
              <div
                className="w-16 h-16 rounded-full mx-auto"
                style={{ border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid var(--color-gold)', animation: 'spin 0.8s linear infinite' }}
              />
              <h4
                className="text-xl font-bold italic"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-gold-light)' }}
              >
                Processing Payment…
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Verifying ₹100.98 via Razorpay for {branchName}
              </p>
            </div>
          )}

          {/* ── STEP: SUCCESS ──────────────────────────── */}
          {step === 'SUCCESS' && (
            <div className="py-14 text-center space-y-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-jade)' }} />
              </div>
              <h4
                className="text-2xl font-bold italic"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
              >
                Branch Unlocked! 🎉
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-parchment)' }}>
                You now have full access to today&apos;s active therapists at <strong style={{ color: 'var(--color-gold-light)' }}>{branchName}</strong> until 11:59 PM IST.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
