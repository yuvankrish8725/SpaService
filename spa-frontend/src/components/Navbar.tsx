'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Sparkles, MapPin, Calendar, User, LogOut, Shield, UserCheck, Menu, X, Clock, Key } from 'lucide-react';

export default function Navbar() {
  const { user, activeUnlocks, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center text-stone-950 font-serif font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-wide font-bold text-amber-200 block leading-tight">Serene Haven</span>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-sans">Luxury Spa & Wellness</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-stone-300 hover:text-amber-200 transition-colors">
              Home
            </Link>
            <Link href="/branches" className="flex items-center gap-1.5 text-stone-300 hover:text-amber-200 transition-colors">
              <MapPin className="w-4 h-4 text-amber-400" />
              Branches & Locations
            </Link>
            <Link href="/services" className="text-stone-300 hover:text-amber-200 transition-colors">
              Treatments & Services
            </Link>

            {/* If Client, show unlocked status badge */}
            {user?.role === 'CLIENT' && activeUnlocks.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs px-3 py-1.5 rounded-full font-sans">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeUnlocks.length} Branch{activeUnlocks.length > 1 ? 'es' : ''} Unlocked</span>
              </div>
            )}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Role Portals */}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 bg-stone-900 border border-amber-500/40 text-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Portal
                  </Link>
                )}

                {user.role === 'AGENT' && (
                  <Link
                    href="/agent/dashboard"
                    className="flex items-center gap-1.5 bg-stone-900 border border-amber-500/40 text-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-stone-800 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Agent Portal ({user.assignedBranchName || 'Assigned Branch'})
                  </Link>
                )}

                {user.role === 'CLIENT' && (
                  <Link
                    href="/client/dashboard"
                    className="flex items-center gap-1.5 bg-stone-900 border border-stone-700 text-stone-200 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:border-amber-400/50 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    My Bookings
                  </Link>
                )}

                <div className="h-6 w-px bg-stone-800 mx-1" />

                <div className="text-right">
                  <div className="text-xs font-semibold text-stone-200">{user.fullName}</div>
                  <div className="text-[10px] text-stone-400">{user.role}</div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-stone-400 hover:text-rose-400 transition hover:bg-stone-900 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-stone-300 hover:text-amber-200 text-sm font-medium px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-md shadow-amber-500/10 transition"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:bg-stone-800"
          >
            Home
          </Link>
          <Link
            href="/branches"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:bg-stone-800"
          >
            Branches & Locations
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-stone-300 hover:bg-stone-800"
          >
            Services & Treatments
          </Link>

          {user ? (
            <div className="pt-4 border-t border-stone-800 space-y-2">
              <div className="px-3 text-xs text-stone-400">Signed in as <span className="text-amber-200 font-semibold">{user.fullName}</span> ({user.role})</div>
              {user.role === 'CLIENT' && (
                <Link
                  href="/client/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-amber-300 hover:bg-stone-800"
                >
                  My Bookings & Unlocks
                </Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-amber-300 hover:bg-stone-800"
                >
                  Admin Portal
                </Link>
              )}
              {user.role === 'AGENT' && (
                <Link
                  href="/agent/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-amber-300 hover:bg-stone-800"
                >
                  Agent Portal ({user.assignedBranchName})
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-rose-400 hover:bg-stone-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-stone-800 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 border border-stone-700 rounded-lg text-sm text-stone-300 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-lg text-sm"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
