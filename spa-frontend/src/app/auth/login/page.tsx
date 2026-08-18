'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck, UserCheck, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const auth = await login(email, password);
      if (auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (auth.user.role === 'AGENT') {
        router.push('/agent/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleQuickLogin = (q: string, p: string) => { setEmail(q); setPassword(p); };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Immersive Brand Image ──────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1200&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,9,6,0.5) 0%, rgba(10,9,6,0.1) 100%), linear-gradient(to top, #0A0906 0%, transparent 60%)' }} />

        {/* Brand copy */}
        <div className="relative z-10 flex flex-col justify-end p-14 pb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-fit"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--color-gold-light)' }}
          >
            🌿 Luxury Spa &amp; Holistic Wellness
          </div>
          <h1
            className="text-5xl font-bold italic mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)', lineHeight: 1.1 }}
          >
            Welcome back<br />
            <span className="gold-gradient-text">to your sanctuary.</span>
          </h1>
          <p className="text-base max-w-xs" style={{ color: 'var(--color-parchment)', fontWeight: 300, lineHeight: 1.7 }}>
            Sign in to unlock today's certified therapist roster, manage bookings, and track your wellness journey.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-col gap-2.5 mt-8">
            {[
              '🔒 Secure JWT authentication',
              '✅ Razorpay-powered payments',
              '🌿 Live daily therapist check-ins',
            ].map(item => (
              <div key={item} className="text-sm" style={{ color: 'rgba(199,184,153,0.7)' }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Glass Form ──────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-12"
        style={{ background: 'var(--color-noir)' }}
      >
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 28C16 28 6 22 6 13C6 9.5 9 7 12 8C13.5 8.7 14.9 9.8 16 11C17.1 9.8 18.5 8.7 20 8C23 7 26 9.5 26 13C26 22 16 28 16 28Z" fill="url(#l1)" opacity="0.9" />
                <path d="M16 28C16 28 10 18 10 13C10 10.5 12 9 14 10C14.8 10.4 15.4 10.9 16 11.5C16.6 10.9 17.2 10.4 18 10C20 9 22 10.5 22 13C22 18 16 28 16 28Z" fill="url(#l2)" />
                <ellipse cx="16" cy="12" rx="1.5" ry="2" fill="#F5CC5A" opacity="0.8" />
                <defs>
                  <linearGradient id="l1" x1="6" y1="7" x2="26" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#D4AF37" /><stop offset="1" stopColor="#A08828" /></linearGradient>
                  <linearGradient id="l2" x1="10" y1="9" x2="22" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#F5CC5A" /><stop offset="1" stopColor="#D4AF37" /></linearGradient>
                </defs>
              </svg>
            </div>
            <h2
              className="text-3xl font-bold italic"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
            >
              Welcome Back
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
              Sign in to your Serene Haven account
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
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--color-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-glass pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-parchment)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--color-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-sm uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50"
              style={{ borderRadius: 12, marginTop: 8 }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 spinner" /> Signing In…</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </span>
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem' }}>
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>
              Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Admin', email: 'admin@serenehaven.com', pass: 'Admin@1234', icon: ShieldCheck, desc: 'Full portal' },
                { label: 'Agent', email: 'agent.blr@serenehaven.com', pass: 'Agent@1234', icon: UserCheck, desc: 'Check-in desk' },
                { label: 'Client', email: 'client@example.com', pass: 'Client@1234', icon: User, desc: 'Booking' },
              ].map(({ label, email: e, pass, icon: Icon, desc }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickLogin(e, pass)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--color-parchment)',
                  }}
                  onMouseEnter={el => {
                    (el.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.35)';
                    (el.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)';
                  }}
                  onMouseLeave={el => {
                    (el.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                    (el.currentTarget as HTMLElement).style.color = 'var(--color-parchment)';
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                  <span className="font-bold">{label}</span>
                  <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm mt-8" style={{ color: 'var(--color-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold underline transition-colors duration-200"
              style={{ color: 'var(--color-gold)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)'; }}
            >
              Register Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
