'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch, SpaServiceResponse, StaffCardResponse, TimeSlotDto, AppointmentResponse, PaymentOrderResponse } from '@/lib/api';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, CreditCard, Banknote, X, ArrowRight, Loader2, User } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  branchCity?: string;
  preselectedStaff?: StaffCardResponse | null;
  preselectedService?: SpaServiceResponse | null;
  initialStaff?: StaffCardResponse | null;
  initialService?: SpaServiceResponse | null;
  onBookingSuccess?: () => void;
}

/* ── Step dots indicator ─────────────────────────────────── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            background: i <= current ? 'var(--color-gold)' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  );
}

export default function BookingModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  branchCity,
  preselectedStaff,
  preselectedService,
  initialStaff,
  initialService,
  onBookingSuccess,
}: BookingModalProps) {
  const { user, isBranchUnlocked } = useAuth();

  const effectiveInitialStaff = preselectedStaff || initialStaff;
  const effectiveInitialService = preselectedService || initialService;

  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [staffList, setStaffList] = useState<StaffCardResponse[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(effectiveInitialService?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(effectiveInitialStaff?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'AT_SPA'>('ONLINE');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState<'FORM' | 'PAYING' | 'SUCCESS'>('FORM');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentResponse | null>(null);

  useEffect(() => {
    if (!isOpen || !branchId) return;
    apiFetch<SpaServiceResponse[]>(`/branches/${branchId}/services`)
      .then(data => {
        setServices(data);
        if (!selectedServiceId && data.length > 0) setSelectedServiceId(effectiveInitialService?.id || data[0].id);
      }).catch(console.error);

    if (user && isBranchUnlocked(branchId)) {
      apiFetch<StaffCardResponse[]>(`/branches/${branchId}/staff`)
        .then(data => {
          setStaffList(data);
          if (!selectedStaffId && data.length > 0) setSelectedStaffId(effectiveInitialStaff?.id || data[0].id);
        }).catch(console.error);
    }
  }, [isOpen, branchId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!branchId || !selectedStaffId || !selectedServiceId || !selectedDate || !user || !isBranchUnlocked(branchId)) return;
    setSlotsLoading(true);
    apiFetch<TimeSlotDto[]>(`/appointments/slots?branchId=${branchId}&staffId=${selectedStaffId}&serviceId=${selectedServiceId}&date=${selectedDate}`)
      .then(slots => {
        setTimeSlots(slots);
        const first = slots.find(s => s.isAvailable);
        setSelectedSlot(first?.startTime || '');
      }).catch(console.error).finally(() => setSlotsLoading(false));
  }, [branchId, selectedStaffId, selectedServiceId, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const selectedService = services.find(s => s.id === selectedServiceId) || effectiveInitialService;
  const basePrice = selectedService ? Number(selectedService.price) : 0;
  const taxAmount = paymentMode === 'ONLINE' ? Number((basePrice * 0.02).toFixed(2)) : 0;
  const totalPrice = Number((basePrice + taxAmount).toFixed(2));

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { window.location.href = '/auth/login'; return; }
    if (!selectedSlot) { setErrorMsg('Please select an available time slot'); return; }

    setLoading(true);
    setErrorMsg(null);

    try {
      const appointment = await apiFetch<AppointmentResponse>('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          branchId, staffId: selectedStaffId, serviceId: selectedServiceId,
          appointmentDate: selectedDate, startTime: selectedSlot, paymentMode, notes,
        }),
      });

      if (paymentMode === 'ONLINE') {
        setStep('PAYING');
        const order = await apiFetch<PaymentOrderResponse>('/payments/booking/initiate', {
          method: 'POST',
          body: JSON.stringify({ appointmentId: appointment.id }),
        });
        setTimeout(async () => {
          try {
            await apiFetch<void>('/payments/booking/verify', {
              method: 'POST',
              body: JSON.stringify({
                appointmentId: appointment.id,
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 12),
                razorpaySignature: 'sig_' + Math.random().toString(36).substring(2, 16),
              }),
            });
            setConfirmedBooking(appointment);
            setStep('SUCCESS');
            setLoading(false);
            onBookingSuccess?.();
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Payment verification failed';
            setErrorMsg(msg); setStep('FORM'); setLoading(false);
          }
        }, 1600);
      } else {
        setConfirmedBooking(appointment);
        setStep('SUCCESS');
        setLoading(false);
        onBookingSuccess?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete booking';
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="modal-enter relative w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{
          background: 'rgba(14,12,8,0.97)',
          border: '1px solid rgba(212,175,55,0.18)',
          borderRadius: 24,
          boxShadow: '0 32px 80px -16px rgba(0,0,0,0.8)',
        }}
      >
        {/* Gold ambient glow */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />

        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 z-10"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-muted)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-cream)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-muted)'; }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-8">

          {/* ── STEP: FORM ─────────────────────────────── */}
          {step === 'FORM' && (
            <form onSubmit={handleBookingSubmit} className="space-y-7">
              <StepDots current={0} total={3} />

              {/* Header */}
              <div>
                <h3
                  className="text-2xl font-bold italic mb-1"
                  style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}
                >
                  Reserve Your Session
                </h3>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--color-gold)' }} />
                  {branchName}{branchCity ? ` · ${branchCity}` : ''}
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div
                  className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm"
                  style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}
                </div>
              )}

              {/* Section label helper */}
              {(() => {
                const SectionLabel = ({ num, text }: { num: string; text: string }) => (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(212,175,55,0.3)' }}
                    >{num}</span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-parchment)' }}>{text}</span>
                  </div>
                );

                return (
                  <>
                    {/* 1. Select Treatment */}
                    <div>
                      <SectionLabel num="1" text="Select Treatment" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {services.map(svc => (
                          <button
                            type="button"
                            key={svc.id}
                            onClick={() => setSelectedServiceId(svc.id)}
                            className="text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer"
                            style={selectedServiceId === svc.id
                              ? { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--color-cream)' }
                              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-parchment)' }
                            }
                          >
                            <div className="font-semibold text-xs">{svc.name}</div>
                            <div className="flex justify-between items-center text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.durationMinutes} min</span>
                              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹{svc.price}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Select Therapist */}
                    <div>
                      <SectionLabel num="2" text="Select Therapist" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {staffList.map(st => (
                          <button
                            type="button"
                            key={st.id}
                            onClick={() => st.presentToday && setSelectedStaffId(st.id)}
                            disabled={!st.presentToday}
                            className="text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer"
                            style={selectedStaffId === st.id
                              ? { background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--color-cream)' }
                              : !st.presentToday
                                ? { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-muted)', opacity: 0.5, cursor: 'not-allowed' }
                                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-parchment)' }
                            }
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(255,255,255,0.08)' }}
                              >
                                {st.profilePhotoUrl
                                  ? <img src={st.profilePhotoUrl} alt={st.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                                  : <User className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                                }
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{st.name}</div>
                              </div>
                            </div>
                            <div className="text-[10px] font-medium">
                              {st.presentToday
                                ? <span style={{ color: 'var(--color-jade)' }}>✓ In Today</span>
                                : <span style={{ color: 'var(--color-rose-soft)' }}>✗ On Leave</span>
                              }
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <SectionLabel num="3" text="Select Date" />
                        <input
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="input-glass text-sm"
                        />
                      </div>
                      <div>
                        <SectionLabel num="4" text="Time Slot" />
                        {slotsLoading ? (
                          <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--color-muted)' }}>
                            <Loader2 className="w-4 h-4 spinner" style={{ color: 'var(--color-gold)' }} />
                            Checking availability…
                          </div>
                        ) : timeSlots.length > 0 ? (
                          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                            {timeSlots.map(slot => (
                              <button
                                type="button"
                                key={slot.startTime}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot.startTime)}
                                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                                style={selectedSlot === slot.startTime
                                  ? { background: 'var(--color-gold)', color: '#0A0906', fontWeight: 700 }
                                  : slot.isAvailable
                                    ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-parchment)' }
                                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-muted)', cursor: 'not-allowed', textDecoration: 'line-through' }
                                }
                              >
                                {slot.startTime.substring(0, 5)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs py-3" style={{ color: 'var(--color-muted)' }}>Select therapist & date first.</p>
                        )}
                      </div>
                    </div>

                    {/* 5. Payment Mode */}
                    <div>
                      <SectionLabel num="5" text="Payment Preference" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            mode: 'ONLINE' as const,
                            icon: <CreditCard className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />,
                            title: 'Pay Online (Razorpay)',
                            sub: `Instant confirmation · +2% tax (₹${(basePrice * 0.02).toFixed(2)})`,
                          },
                          {
                            mode: 'AT_SPA' as const,
                            icon: <Banknote className="w-4 h-4" style={{ color: 'var(--color-jade)' }} />,
                            title: 'Pay at Reception',
                            sub: 'Reserve now, pay on arrival · No online tax',
                          },
                        ].map(({ mode, icon, title, sub }) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setPaymentMode(mode)}
                            className="p-4 rounded-xl text-left cursor-pointer transition-all duration-200"
                            style={paymentMode === mode
                              ? { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.35)', color: 'var(--color-cream)' }
                              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-parchment)' }
                            }
                          >
                            <div className="flex items-center gap-2 font-semibold text-xs mb-1">{icon}{title}</div>
                            <div className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price breakdown */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="px-5 py-3 flex justify-between text-sm" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--color-muted)' }}>Treatment Fee</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-parchment)' }}>₹{basePrice.toFixed(2)}</span>
                      </div>
                      {paymentMode === 'ONLINE' && (
                        <div className="px-5 py-3 flex justify-between text-sm" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ color: 'var(--color-muted)' }}>Online Tax (2%)</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-parchment)' }}>₹{taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="px-5 py-4 flex justify-between items-center" style={{ background: 'rgba(212,175,55,0.05)' }}>
                        <span className="font-bold uppercase tracking-wider text-xs" style={{ color: 'var(--color-cream)' }}>
                          {paymentMode === 'ONLINE' ? 'Total Now' : 'Due at Spa'}
                        </span>
                        <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || !selectedSlot}
                      className="btn-gold w-full py-4 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      style={{ borderRadius: 12 }}
                    >
                      <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {loading
                          ? <><Loader2 className="w-4 h-4 spinner" /> Processing…</>
                          : <>{paymentMode === 'ONLINE' ? `Confirm & Pay ₹${totalPrice.toFixed(2)}` : 'Confirm Slot (Pay at Spa)'} <ArrowRight className="w-4 h-4" /></>
                        }
                      </span>
                    </button>
                  </>
                );
              })()}
            </form>
          )}

          {/* ── STEP: PAYING ─────────────────────────── */}
          {step === 'PAYING' && (
            <div className="py-16 text-center space-y-5">
              <StepDots current={1} total={3} />
              <div
                className="w-16 h-16 rounded-full mx-auto"
                style={{ border: '2px solid rgba(212,175,55,0.2)', borderTop: '2px solid var(--color-gold)', animation: 'spin 0.8s linear infinite' }}
              />
              <h4 className="text-xl font-bold italic" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-gold-light)' }}>
                Processing Payment…
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Securing your session for ₹{totalPrice.toFixed(2)}</p>
            </div>
          )}

          {/* ── STEP: SUCCESS ─────────────────────────── */}
          {step === 'SUCCESS' && confirmedBooking && (
            <div className="py-8 text-center space-y-6">
              <StepDots current={2} total={3} />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--color-jade)' }} />
              </div>
              <div>
                <h4 className="text-2xl font-bold italic mb-1" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-cream)' }}>
                  Reservation Confirmed! 🎉
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-parchment)' }}>Your spa ritual has been successfully booked.</p>
              </div>

              {/* Booking receipt */}
              <div
                className="text-left rounded-xl overflow-hidden max-w-sm mx-auto"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {[
                  { label: 'Treatment', value: confirmedBooking.serviceName },
                  { label: 'Therapist', value: confirmedBooking.staffName },
                  { label: 'Date & Time', value: `${confirmedBooking.appointmentDate} at ${confirmedBooking.startTime?.substring(0, 5)}` },
                  { label: 'Location', value: confirmedBooking.branchName },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className="px-5 py-3 flex justify-between text-sm"
                    style={{ background: 'rgba(255,255,255,0.03)', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                  >
                    <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-cream)' }}>{value}</span>
                  </div>
                ))}
                <div className="px-5 py-4 flex justify-between items-center" style={{ background: 'rgba(212,175,55,0.05)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-cream)' }}>
                    {confirmedBooking.paymentMode === 'ONLINE' ? 'Paid Online' : 'Pay at Spa'}
                  </span>
                  <span className="font-bold text-xl" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold-light)' }}>
                    ₹{confirmedBooking.totalPrice}
                  </span>
                </div>
              </div>

              {confirmedBooking.branchMapsUrl && (
                <a
                  href={confirmedBooking.branchMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium transition-colors duration-200"
                  style={{ color: 'var(--color-gold)' }}
                >
                  <MapPin className="w-3.5 h-3.5" /> Open in Google Maps ↗
                </a>
              )}

              <button
                onClick={onClose}
                className="btn-ghost w-full max-w-xs mx-auto py-3 text-sm font-semibold cursor-pointer block"
                style={{ borderRadius: 12 }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
