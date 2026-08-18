'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { User, Mail, Phone, Lock, AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const PERKS = [
  'Browse all branch locations free',
  'Unlock daily therapist roster for just ₹99',
  'Book certified therapists online or at the spa',
  'Track all appointments in your dashboard',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await register(fullName, email, phone, password);
      router.push('/client/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Brand Image ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,9,6,0.6) 0%, rgba(10,9,6,0.2) 100%), linear-gradient(to top, #0A0906 0%, transparent 60%)' }} />

        <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-fit"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--color-gold-light)' }}
          >
            ✨ 100% Free to Join
          </div>
          <h1
            className="text-5xl font-bold italic mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)', lineHeight: 1.1 }}
          >
            Begin your<br />
            <span className="gold-gradient-text">wellness journey.</span>
          </h1>
          <p className="text-base max-w-xs mb-8" style={{ color: 'var(--color-parchment)', fontWeight: 300, lineHeight: 1.7 }}>
            Registration is completely free. Pay only when you want to unlock a branch's therapist roster.
          </p>

          {/* Perks */}
          <div className="space-y-3">
            {PERKS.map(perk => (
              <div key={perk} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-parchment)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-jade)' }} />
                {perk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Glass Form ─────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-12"
        style={{ background: 'var(--color-noir)' }}
      >
        <div className="w-full max-w-md">

          {/* Logo + header */}
          <div className="text-center mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 28C16 28 6 22 6 13C6 9.5 9 7 12 8C13.5 8.7 14.9 9.8 16 11C17.1 9.8 18.5 8.7 20 8C23 7 26 9.5 26 13C26 22 16 28 16 28Z" fill="url(#r1)" opacity="0.9" />
                <path d="M16 28C16 28 10 18 10 13C10 10.5 12 9 14 10C14.8 10.4 15.4 10.9 16 11.5C16.6 10.9 17.2 10.4 18 10C20 9 22 10.5 22 13C22 18 16 28 16 28Z" fill="url(#r2)" />
                <ellipse cx="16" cy="12" rx="1.5" ry="2" fill="#F5CC5A" opacity="0.8" />
                <defs>
                  <linearGradient id="r1" x1="6" y1="7" x2="26" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#D4AF37" /><stop offset="1" stopColor="#A08828" /></linearGradient>
                  <linearGradient id="r2" x1="10" y1="9" x2="22" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#F5CC5A" /><stop offset="1" stopColor="#D4AF37" /></linearGradient>
                </defs>
              </svg>
            </div>
            <h2
              className="text-3xl font-bold italic"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
            >
              Create Account
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
              Join Serene Haven — Registration is 100% Free
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div
              className="flex items-center gap-2.5 p-4 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { id: 'fullName', label: 'Full Name', type: 'text', val: fullName, set: setFullName, placeholder: 'Ananya Sharma', Icon: User, required: true },
              { id: 'email', label: 'Email Address', type: 'email', val: email, set: setEmail, placeholder: 'ananya@example.com', Icon: Mail, required: true },
              { id: 'phone', label: 'Phone Number', type: 'tel', val: phone, set: setPhone, placeholder: '+91 9876543210', Icon: Phone, required: false },
              { id: 'password', label: 'Password', type: 'password', val: password, set: setPassword, placeholder: '••••••••', Icon: Lock, required: true },
            ].map(({ id, label, type, val, set, placeholder, Icon, required: req }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-parchment)' }}
                >
                  {label}
                </label>
                <div className="relative">
                  <Icon className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--color-muted)' }} />
                  <input
                    id={id}
                    type={type}
                    required={req}
                    minLength={type === 'password' ? 6 : undefined}
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="input-glass pl-10"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-sm uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50"
              style={{ borderRadius: 12, marginTop: 8 }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 spinner" /> Creating Account…</>
                ) : (
                  <>Create Free Account <ArrowRight className="w-4 h-4" /></>
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold underline transition-colors duration-200"
              style={{ color: 'var(--color-gold)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'; }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
