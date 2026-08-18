'use client';

import React, { useState, useEffect } from 'react';
import { StaffCardResponse, apiFetch } from '@/lib/api';
import { X, Plus, Trash2, CheckCircle2, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface StaffGalleryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffCardResponse | null;
  onSuccess: (updatedStaff: StaffCardResponse) => void;
  isAdmin?: boolean;
}

export default function StaffGalleryManageModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
  isAdmin = true,
}: StaffGalleryManageModalProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (staff) {
      const existing: string[] = [];
      if (staff.profilePhotoUrl) existing.push(staff.profilePhotoUrl);
      if (staff.galleryPhotos && staff.galleryPhotos.length > 0) {
        existing.push(...staff.galleryPhotos);
      } else if (staff.galleryPhotoUrls) {
        existing.push(...staff.galleryPhotoUrls.split(',').map(s => s.trim()).filter(Boolean));
      }
      setPhotoUrls(Array.from(new Set(existing)));
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const handleAddPhoto = () => {
    const trimmed = newUrlInput.trim();
    if (!trimmed) return;
    if (photoUrls.includes(trimmed)) {
      setErrorMsg('This photo URL is already in the gallery.');
      return;
    }
    setPhotoUrls(prev => [...prev, trimmed]);
    setNewUrlInput('');
    setErrorMsg(null);
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotoUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveGallery = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const primaryPhoto = photoUrls.length > 0 ? photoUrls[0] : '';
    const additionalPhotos = photoUrls.length > 1 ? photoUrls.slice(1).join(',') : '';
    const allGalleryUrls = photoUrls.join(',');

    try {
      const endpoint = isAdmin
        ? `/admin/staff/${staff.id}/gallery`
        : `/agent/staff/${staff.id}/gallery`;

      const updated = await apiFetch<StaffCardResponse>(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ galleryPhotoUrls: allGalleryUrls }),
      });

      // Also update primary profile photo if changed
      if (primaryPhoto && primaryPhoto !== staff.profilePhotoUrl) {
        const photoEndpoint = isAdmin
          ? `/admin/staff/${staff.id}/profile-photo`
          : `/agent/staff/${staff.id}/profile-photo`;
        await apiFetch(photoEndpoint, {
          method: 'PUT',
          body: JSON.stringify({ photoUrl: primaryPhoto }),
        });
        updated.profilePhotoUrl = primaryPhoto;
      }

      setSuccessMsg('✅ Gallery photos updated successfully!');
      setTimeout(() => {
        onSuccess(updated);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update therapist gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div
        className="modal-enter relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl z-10 space-y-6"
        style={{
          background: 'rgba(14,12,8,0.98)',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 25px 80px -15px rgba(0,0,0,0.9)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              <ImageIcon className="w-6 h-6" style={{ color: 'var(--color-gold)' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                Manage Gallery: {staff.name}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Add multiple high-resolution photos for this therapist and treatment suites.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add New Photo Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/80">
            + Add New Photo URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-... or image link"
              value={newUrlInput}
              onChange={e => setNewUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhoto(); } }}
              className="input-glass flex-1 text-xs py-2.5"
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              className="btn-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              style={{ borderRadius: 10 }}
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <p className="text-[11px] text-white/40">
            Paste high-res image URLs (Unsplash, Cloudinary, etc.) to showcase this therapist in the client view.
          </p>
        </div>

        {/* Photo Gallery Grid Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-white/60">
              Current Photos ({photoUrls.length})
            </span>
            <span className="text-amber-400 text-[11px]">
              ★ First image is primary profile photo
            </span>
          </div>

          {photoUrls.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 text-white/40 text-xs">
              No photos added yet. Paste a URL above to add the first photo.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
              {photoUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                    {idx === 0 ? (
                      <span className="badge-jade text-[9px] px-1.5 py-0.5">Primary</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          // Move to index 0 (make primary)
                          const reordered = [url, ...photoUrls.filter((_, i) => i !== idx)];
                          setPhotoUrls(reordered);
                        }}
                        title="Make Primary Profile Photo"
                        className="text-[10px] px-2 py-1 rounded bg-amber-400 text-black font-bold cursor-pointer hover:bg-amber-300"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Remove Photo"
                      className="w-7 h-7 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 badge-jade text-[9px] px-1.5 py-0.5 group-hover:hidden">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveGallery}
            className="btn-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            style={{ borderRadius: 10 }}
          >
            <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading ? 'Saving...' : <><Sparkles className="w-3.5 h-3.5" /> Save Gallery</>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
