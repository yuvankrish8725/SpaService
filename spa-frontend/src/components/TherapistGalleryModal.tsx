'use client';

import React, { useState } from 'react';
import { StaffCardResponse } from '@/lib/api';
import { X, Calendar, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, MapPin, Award, Star } from 'lucide-react';

interface TherapistGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffCardResponse | null;
  branchName?: string;
  branchCity?: string;
  onBook: (staff: StaffCardResponse) => void;
}

const DEFAULT_GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1000&auto=format&fit=crop&q=80',
];

export default function TherapistGalleryModal({
  isOpen,
  onClose,
  staff,
  branchName,
  branchCity,
  onBook,
}: TherapistGalleryModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!isOpen || !staff) return null;

  // Build photo array: main profile photo + dynamic gallery photos
  const rawPhotos = [
    ...(staff.profilePhotoUrl ? [staff.profilePhotoUrl] : []),
    ...((staff.galleryPhotos && staff.galleryPhotos.length > 0)
      ? staff.galleryPhotos
      : DEFAULT_GALLERY_PHOTOS.slice(0, 3)
    ),
  ];
  const photos = rawPhotos.length > 0 ? Array.from(new Set(rawPhotos)) : DEFAULT_GALLERY_PHOTOS;

  const present = staff.presentToday ?? (staff.todayCheckinStatus === 'PRESENT');

  const nextPhoto = () => setActivePhotoIdx(p => (p + 1) % photos.length);
  const prevPhoto = () => setActivePhotoIdx(p => (p - 1 + photos.length) % photos.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="modal-enter relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl z-10 my-8 flex flex-col lg:flex-row"
        style={{
          background: 'rgba(14,12,8,0.98)',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 25px 80px -15px rgba(0,0,0,0.9)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-cream)' }}
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── LEFT: High-Res Photo Gallery Viewer ──────────── */}
        <div className="lg:w-1/2 relative bg-black flex flex-col justify-between min-h-[340px] sm:min-h-[440px]">
          {/* Main Active Image */}
          <div className="relative w-full h-full flex-1 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activePhotoIdx]}
              alt={`${staff.name} photo ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Nav Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all bg-black/60 hover:bg-black/80 text-white border border-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all bg-black/60 hover:bg-black/80 text-white border border-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter */}
            <div
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/70 border border-white/10"
              style={{ color: 'var(--color-parchment)' }}
            >
              {activePhotoIdx + 1} / {photos.length} · {activePhotoIdx === 0 ? 'Therapist Portrait' : 'Treatment Suite'}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="p-3 bg-black/90 flex gap-2 overflow-x-auto border-t border-white/10">
            {photos.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  activePhotoIdx === idx ? 'border-amber-400 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Therapist Info & Booking Actions ──────── */}
        <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="badge-jade inline-flex text-xs px-3 py-1">
                <span className="presence-dot-present" />
                Present &amp; Available Today
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                4.9 · 128 verified sessions
              </div>
            </div>

            {/* Name & Specialization */}
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold italic"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
              >
                {staff.name}
              </h2>
              <div className="text-sm font-medium mt-1" style={{ color: 'var(--color-gold-light)' }}>
                {staff.specialization || 'Certified Senior Wellness Therapist'}
              </div>
              {(branchName || branchCity) && (
                <div className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {branchName} {branchCity ? `· ${branchCity}` : ''}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">About Therapist</span>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-parchment)' }}>
                {staff.bio || 'Dedicated holistic wellness practitioner with deep expertise in therapeutic massage rituals, neuromuscular tension release, and stress revitalization.'}
              </p>
            </div>

            {/* Key Expertise Points */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Certifications &amp; Style</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-white/90">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Licensed Aesthetician</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-white/90">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deep Pressure &amp; Flow</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Ayurvedic &amp; Swedish</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5 text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Organic Essential Oils</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking CTA */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                onBook(staff);
              }}
              className="btn-gold flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              style={{ borderRadius: 12 }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar className="w-4 h-4" /> Book Appointment with {staff.name.split(' ')[0]}
              </span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
