'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { MapPin, Calendar, LogOut, Shield, UserCheck, Menu, X, Key, Sparkles } from 'lucide-react';

/* ─── SVG Lotus Logo ─────────────────────────────────────── */
function LotusIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 28C16 28 6 22 6 13C6 9.5 9 7 12 8C13.5 8.7 14.9 9.8 16 11C17.1 9.8 18.5 8.7 20 8C23 7 26 9.5 26 13C26 22 16 28 16 28Z"
        fill="url(#lotus-grad)"
        opacity="0.9"
      />
      <path
        d="M16 28C16 28 10 18 10 13C10 10.5 12 9 14 10C14.8 10.4 15.4 10.9 16 11.5C16.6 10.9 17.2 10.4 18 10C20 9 22 10.5 22 13C22 18 16 28 16 28Z"
        fill="url(#lotus-grad2)"
      />
      <path d="M16 28V14" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" />
      <ellipse cx="16" cy="12" rx="1.5" ry="2" fill="#F5CC5A" opacity="0.8" />
      <defs>
        <linearGradient id="lotus-grad" x1="6" y1="7" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#A08828" />
        </linearGradient>
        <linearGradient id="lotus-grad2" x1="10" y1="9" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5CC5A" />
          <stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Nav Link with animated gold underline ──────────────── */
function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className="relative group text-sm font-medium transition-colors duration-200"
      style={{ color: active ? 'var(--color-gold-light)' : 'var(--color-parchment)' }}
    >
      {children}
      <span
        className="absolute -bottom-1 left-0 h-px transition-all duration-300 ease-out"
        style={{
          width: active ? '100%' : '0%',
          background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-light))',
        }}
      />
      <span
        className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ease-out"
        style={{ background: 'linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))' }}
      />
    </Link>
  );
}

/* ─── Avatar / Initials circle ───────────────────────────── */
function Avatar({ name, role }: { name: string; role: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'var(--color-gold)',
    ADMIN: 'var(--color-gold)',
    AGENT: '#60a5fa',
    CLIENT: 'var(--color-jade)',
  };

  return (
    <div
      className="relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0"
      style={{
        background: 'var(--glass-bg)',
        border: `1.5px solid ${roleColor[role] || 'var(--glass-border)'}`,
        color: roleColor[role] || 'var(--color-parchment)',
        fontFamily: 'var(--font-inter)',
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Main Navbar ────────────────────────────────────────── */
export default function Navbar() {
  const { user, activeUnlocks, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  const portalHref = user?.role === 'CLIENT'
    ? '/client/dashboard'
    : user?.role === 'AGENT'
      ? '/agent/dashboard'
      : '/admin/dashboard';

  return (
    <>
      {/* ── Navbar Bar ────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(10,9,6,0.88)'
            : 'rgba(10,9,6,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: scrolled ? '0 4px 40px -4px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* ── LEFT SIDE: Brand Logo Only ── */}
            <div className="flex items-center gap-8 lg:gap-10">
              <Link href={user ? portalHref : '/'} className="flex items-center gap-3 group shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)',
                    border: '1px solid rgba(212,175,55,0.3)',
                  }}
                >
                  <LotusIcon size={22} />
                </div>
                <div className="leading-none">
                  <span
                    className="block text-xl font-bold italic"
                    style={{ fontFamily: 'var(--font-playfair)', color: '#F5CC5A', letterSpacing: '-0.02em' }}
                  >
                    Serene Haven
                  </span>
                  <span
                    className="block text-[9px] uppercase tracking-[0.22em] mt-0.5"
                    style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-inter)' }}
                  >
                    Luxury Spa &amp; Wellness
                  </span>
                </div>
              </Link>

              {/* ── Public nav links (Only when NOT logged in) ── */}
              {!user && (
                <nav className="hidden md:flex items-center gap-6">
                  <NavLink href="/" active={pathname === '/'}>Home</NavLink>
                  <NavLink href="/services" active={pathname.startsWith('/services')}>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                      Treatments
                    </span>
                  </NavLink>
                </nav>
              )}
            </div>

            {/* ── RIGHT SIDE: Profile, Portal CTA & Session ── */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {/* Active unlock badge (for clients) */}
                  {user.role === 'CLIENT' && activeUnlocks.length > 0 && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(212,175,55,0.08)',
                        border: '1px solid rgba(212,175,55,0.25)',
                        color: 'var(--color-gold-light)',
                      }}
                    >
                      <span
                        className="presence-dot-present"
                        style={{ width: 6, height: 6, background: 'var(--color-gold)' }}
                      />
                      <Key className="w-3 h-3" />
                      {activeUnlocks.length} Unlocked
                    </div>
                  )}

                  {/* Portal link */}
                  <Link
                    href={portalHref}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--color-gold-light)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg-hover)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)';
                    }}
                  >
                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && <Shield className="w-3.5 h-3.5" />}
                    {user.role === 'AGENT' && <UserCheck className="w-3.5 h-3.5" />}
                    {user.role === 'CLIENT' && <Calendar className="w-3.5 h-3.5" />}
                    {user.role === 'CLIENT' ? 'My Dashboard' : `${user.role === 'AGENT' ? 'Agent' : 'Admin'} Portal`}
                  </Link>

                  {/* Divider */}
                  <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} />

                  {/* Avatar + name */}
                  <div className="flex items-center gap-2">
                    <Avatar name={user.fullName} role={user.role} />
                    <div className="text-right leading-none">
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-cream)' }}>
                        {user.fullName.split(' ')[0]}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {user.role}
                      </div>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="p-2 rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ color: 'var(--color-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fb7185'; (e.currentTarget as HTMLElement).style.background = 'rgba(251,113,133,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                    style={{ color: 'var(--color-parchment)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-cream)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-parchment)' }}
                  >
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="btn-gold px-5 py-2.5 text-xs uppercase tracking-wider" style={{ borderRadius: 10, display: 'inline-block', position: 'relative', zIndex: 1 }}>
                    <span style={{ position: 'relative', zIndex: 2 }}>Register Free</span>
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ─────────────────────── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex md:hidden p-2 rounded-xl cursor-pointer transition-colors duration-200"
              style={{ color: 'var(--color-parchment)', background: mobileOpen ? 'var(--glass-bg)' : 'transparent' }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 h-full w-72 flex flex-col"
            style={{
              background: 'rgba(16,13,9,0.97)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <LotusIcon size={18} />
                <span className="font-bold italic text-base" style={{ fontFamily: 'var(--font-playfair)', color: '#F5CC5A' }}>
                  Serene Haven
                </span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg cursor-pointer" style={{ color: 'var(--color-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer nav items */}
            <nav className="flex-1 px-4 pt-6 space-y-1">
              {!user ? (
                <>
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
                    style={{
                      color: pathname === '/' ? 'var(--color-gold-light)' : 'var(--color-parchment)',
                      background: pathname === '/' ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    href="/services"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
                    style={{
                      color: pathname.startsWith('/services') ? 'var(--color-gold-light)' : 'var(--color-parchment)',
                      background: pathname.startsWith('/services') ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
                    Treatments
                  </Link>
                </>
              ) : (
                <Link
                  href={portalHref}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mt-3 transition-colors duration-200"
                  style={{ color: 'var(--color-gold-light)', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                  {user.role === 'CLIENT' ? <Calendar className="w-4 h-4" /> : user.role === 'AGENT' ? <UserCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  {user.role === 'CLIENT' ? 'My Dashboard' : `${user.role === 'AGENT' ? 'Agent' : 'Admin'} Portal`}
                </Link>
              )}
            </nav>

            {/* Drawer bottom: user info or auth */}
            <div className="px-4 pb-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar name={user.fullName} role={user.role} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-cream)' }}>{user.fullName}</div>
                      <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors duration-200"
                    style={{ color: '#fb7185', background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)' }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="block text-center py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--color-parchment)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-gold block text-center py-2.5 text-xs uppercase tracking-wider font-bold"
                    style={{ borderRadius: 10 }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>Register Free</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
