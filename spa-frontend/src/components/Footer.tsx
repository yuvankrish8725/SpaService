'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-serif text-xl font-bold text-amber-100">Serene Haven</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              Experience the pinnacle of holistic wellness, bespoke therapeutic massages, and organic revitalization rituals across multiple premier locations.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/80">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Certified Therapists & 100% Organic Products</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-stone-200 uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/branches" className="hover:text-amber-300 transition">Our Spa Locations</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-amber-300 transition">Therapeutic Treatments</Link>
              </li>
              <li>
                <Link href="/client/dashboard" className="hover:text-amber-300 transition">Client Booking Portal</Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-amber-300 transition">Therapist / Staff Check-in</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div>
            <h4 className="text-sm font-semibold text-stone-200 uppercase tracking-wider mb-4">Operating Hours</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Monday – Sunday</span>
              </li>
              <li className="text-stone-300 font-medium pl-5.5">09:00 AM – 09:00 PM IST</li>
              <li className="text-[11px] text-stone-500 pl-5.5">Daily Therapist check-ins active from 08:30 AM</li>
            </ul>
          </div>

          {/* Col 4: Contact & Locations */}
          <div>
            <h4 className="text-sm font-semibold text-stone-200 uppercase tracking-wider mb-4">Headquarters</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Koramangala 5th Block, Bangalore & Anna Nagar, Chennai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+91 80 4123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>concierge@serenehaven.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Serene Haven Spa & Wellness. All rights reserved. Secure Razorpay & JWT Protection.</p>
        </div>
      </div>
    </footer>
  );
}
