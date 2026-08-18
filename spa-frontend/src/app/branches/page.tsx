'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch, BranchResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MapPin, Clock, Key, Lock, Phone, Sparkles, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import UnlockModal from '@/components/UnlockModal';

export default function BranchesPage() {
  const { user, isBranchUnlocked, getBranchUnlockRemainingTime } = useAuth();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedBranchToUnlock, setSelectedBranchToUnlock] = useState<BranchResponse | null>(null);

  useEffect(() => {
    apiFetch<BranchResponse[]>('/branches')
      .then(data => setBranches(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(searchCity.toLowerCase()) ||
    b.city.toLowerCase().includes(searchCity.toLowerCase()) ||
    b.address.toLowerCase().includes(searchCity.toLowerCase())
  );

  const cities = Array.from(new Set(branches.map(b => b.city)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
          <MapPin className="w-3.5 h-3.5" />
          <span>Premier Spa Network</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-100">
          Find Your Sanctuary
        </h1>
        <p className="text-sm text-stone-400">
          Browse verified locations, review operating schedules, and unlock today&apos;s active therapist roster.
        </p>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setSearchCity('')}
            className={`text-xs px-4 py-2 rounded-full border transition ${
              searchCity === ''
                ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            All Cities ({branches.length})
          </button>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSearchCity(city)}
              className={`text-xs px-4 py-2 rounded-full border transition ${
                searchCity === city
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}
            >
              📍 {city}
            </button>
          ))}
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredBranches.map(branch => {
          const unlocked = isBranchUnlocked(branch.id);
          const remainingTime = getBranchUnlockRemainingTime(branch.id);

          return (
            <div
              key={branch.id}
              className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition group hover:shadow-xl hover:shadow-amber-500/5 relative"
            >
              <div className="space-y-4">
                
                {/* Location Chip + Status */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-amber-950/50 border border-amber-800/40 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{branch.city}, {branch.state}</span>
                  </div>

                  {unlocked ? (
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Key className="w-3 h-3" /> Unlocked ({remainingTime || 'Today'})
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 font-medium bg-stone-950 border border-stone-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" /> ₹99 / Day
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100 group-hover:text-amber-200 transition">
                    {branch.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    {branch.address}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    PIN: {branch.pincode}
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-2 text-xs text-stone-300">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Hours:
                    </span>
                    <span className="font-medium text-stone-200">
                      {branch.openTime ? branch.openTime.substring(0, 5) : '09:00'} - {branch.closeTime ? branch.closeTime.substring(0, 5) : '21:00'} IST
                    </span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" /> Desk:
                      </span>
                      <span className="text-stone-200">{branch.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                    <span className="text-stone-400">Therapists:</span>
                    <span className="font-bold text-amber-300">{branch.staffCount} Assigned</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center gap-3">
                <Link
                  href={`/branches/${branch.id}`}
                  className={`flex-1 text-center font-bold py-2.5 rounded-xl text-xs transition ${
                    unlocked
                      ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                  }`}
                >
                  {unlocked ? 'View Today\'s Therapists' : 'View Branch & Unlock'}
                </Link>

                {!unlocked && (
                  <button
                    onClick={() => setSelectedBranchToUnlock(branch)}
                    title="Unlock with ₹99"
                    className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl transition cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}

                {branch.mapsUrl && (
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Google Maps"
                    className="p-2.5 bg-stone-950 border border-stone-800 hover:border-amber-500/50 text-amber-400 rounded-xl transition"
                  >
                    <MapPin className="w-4 h-4" />
                  </a>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Paywall Unlock Modal */}
      {selectedBranchToUnlock && (
        <UnlockModal
          isOpen={!!selectedBranchToUnlock}
          onClose={() => setSelectedBranchToUnlock(null)}
          branchId={selectedBranchToUnlock.id}
          branchName={selectedBranchToUnlock.name}
          branchCity={selectedBranchToUnlock.city}
          onSuccess={() => {
            window.location.href = `/branches/${selectedBranchToUnlock.id}`;
          }}
        />
      )}

    </div>
  );
}
