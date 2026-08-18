'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Globe, Share2, ArrowRight } from 'lucide-react';

function LotusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 28C16 28 6 22 6 13C6 9.5 9 7 12 8C13.5 8.7 14.9 9.8 16 11C17.1 9.8 18.5 8.7 20 8C23 7 26 9.5 26 13C26 22 16 28 16 28Z"
        fill="url(#footer-lotus-a)" opacity="0.9"
      />
      <path
        d="M16 28C16 28 10 18 10 13C10 10.5 12 9 14 10C14.8 10.4 15.4 10.9 16 11.5C16.6 10.9 17.2 10.4 18 10C20 9 22 10.5 22 13C22 18 16 28 16 28Z"
        fill="url(#footer-lotus-b)"
      />
      <ellipse cx="16" cy="12" rx="1.5" ry="2" fill="#F5CC5A" opacity="0.7" />
      <defs>
        <linearGradient id="footer-lotus-a" x1="6" y1="7" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" /><stop offset="1" stopColor="#A08828" />
        </linearGradient>
        <linearGradient id="footer-lotus-b" x1="10" y1="9" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5CC5A" /><stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Once logged in (client, agent, or admin), hide the marketing footer completely
  if (user) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); }
  };

  return (
    <footer style={{ background: '#070605', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      
      {/* ── Newsletter Banner ─────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(212,175,55,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-xl font-bold italic mb-1"
                style={{ fontFamily: 'var(--font-playfair)', color: '#F5CC5A' }}
              >
                Wellness Updates &amp; Exclusive Offers
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-parchment)' }}>
                Be the first to know about new therapists, seasonal rituals, and branch openings.
              </p>
            </div>
            {subscribed ? (
              <div
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--color-jade)' }}
              >
                <span>✓</span> You are subscribed to luxury updates!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input-glass text-sm px-4 py-3 min-w-[240px]"
                />
                <button
                  type="submit"
                  className="btn-gold px-5 py-3 text-xs uppercase tracking-wider font-bold shrink-0 cursor-pointer"
                  style={{ borderRadius: 12 }}
                >
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Subscribe <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── 4-Col Grid ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Col 1: Brand (spans 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <LotusIcon size={18} />
              </div>
              <span
                className="text-xl font-bold italic"
                style={{ fontFamily: 'var(--font-playfair)', color: '#F5CC5A' }}
              >
                Serene Haven
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Experience the pinnacle of holistic wellness — bespoke therapeutic massages, organic botanical rituals, and live therapist transparency across premier locations.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-gold-light)' }}>
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Therapists • 100% Organic</span>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { Icon: Globe, label: 'Website' },
                { Icon: Share2, label: 'Social Media' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--color-muted)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.35)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)';
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-[0.18em] mb-6"
              style={{ color: 'var(--color-cream)' }}
            >
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/branches', label: 'Our Spa Locations' },
                { href: '/services', label: 'Therapeutic Treatments' },
                { href: '/client/dashboard', label: 'Client Dashboard' },
                { href: '/auth/login', label: 'Staff & Agent Portal' },
                { href: '/auth/register', label: 'Register Free' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--color-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-gold-light)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-[0.18em] mb-6"
              style={{ color: 'var(--color-cream)' }}
            >
              Operating Hours
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>Monday – Sunday</span>
              </li>
              <li className="pl-6.5 font-semibold" style={{ color: 'var(--color-parchment)', paddingLeft: '1.625rem' }}>
                09:00 AM – 09:00 PM IST
              </li>
              <li style={{ color: 'var(--color-muted)', fontSize: '0.75rem', paddingLeft: '1.625rem' }}>
                Therapist check-ins active from 8:30 AM daily
              </li>
              <li className="pt-2 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-jade)', animation: 'blink-dot 2.5s ease-in-out infinite' }}
                />
                <span className="text-xs" style={{ color: 'var(--color-jade)' }}>All branches open today</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-[0.18em] mb-6"
              style={{ color: 'var(--color-cream)' }}
            >
              Headquarters
            </h4>
            <ul className="space-y-4 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-gold)' }} />
                <span>Koramangala 5th Block, Bangalore &amp; Anna Nagar, Chennai</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>+91 80 4123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>concierge@serenehaven.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Certification Bar ──────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            © {new Date().getFullYear()} Serene Haven Spa &amp; Wellness. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span>🔒</span> SSL Secured
            </span>
            <span className="w-px h-3" style={{ background: 'var(--glass-border)' }} />
            <span className="flex items-center gap-1.5">
              <span>✅</span> Razorpay Partner
            </span>
            <span className="w-px h-3" style={{ background: 'var(--glass-border)' }} />
            <span className="flex items-center gap-1.5">
              <span>🌿</span> Organic Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
