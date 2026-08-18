'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, User, AlertCircle, Loader2 } from 'lucide-react';

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
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6 text-stone-100 relative">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-100">Welcome Back</h2>
          <p className="text-xs text-stone-400">Sign in to your Serene Haven account</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs tracking-wider uppercase transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        {/* Demo Fast-Login Helpers */}
        <div className="pt-4 border-t border-stone-800 space-y-2">
          <div className="text-[11px] font-semibold text-stone-400 text-center uppercase tracking-wider">
            Demo Credentials
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@serenehaven.com', 'Admin@1234')}
              className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 rounded-lg text-amber-300 transition text-center cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('agent.blr@serenehaven.com', 'Agent@1234')}
              className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 rounded-lg text-amber-300 transition text-center cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
              <span>Agent</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('client@example.com', 'Client@1234')}
              className="p-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 rounded-lg text-amber-300 transition text-center cursor-pointer"
            >
              <User className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
              <span>Client</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-stone-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-amber-400 hover:text-amber-300 font-semibold underline">
            Register Free
          </Link>
        </div>

      </div>
    </div>
  );
}
