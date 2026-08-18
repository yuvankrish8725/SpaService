'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch, SpaServiceResponse, StaffCardResponse, TimeSlotDto, AppointmentResponse, PaymentOrderResponse } from '@/lib/api';
import { Calendar, Clock, Sparkles, MapPin, User, CheckCircle2, AlertCircle, CreditCard, Banknote, X, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName: string;
  branchCity?: string;
  initialStaff?: StaffCardResponse | null;
  initialService?: SpaServiceResponse | null;
  onBookingSuccess?: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  branchCity,
  initialStaff,
  initialService,
  onBookingSuccess,
}: BookingModalProps) {
  const { user, isBranchUnlocked } = useAuth();

  const [services, setServices] = useState<SpaServiceResponse[]>([]);
  const [staffList, setStaffList] = useState<StaffCardResponse[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialService?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaff?.id || '');
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

  // Load available services & staff for this branch
  useEffect(() => {
    if (isOpen && branchId) {
      // 1. Fetch branch services
      apiFetch<SpaServiceResponse[]>(`/branches/${branchId}/services`)
        .then(data => {
          setServices(data);
          if (!selectedServiceId && data.length > 0) {
            setSelectedServiceId(initialService?.id || data[0].id);
          }
        })
        .catch(console.error);

      // 2. Fetch staff if unlocked
      if (user && isBranchUnlocked(branchId)) {
        apiFetch<StaffCardResponse[]>(`/branches/${branchId}/staff`)
          .then(data => {
            setStaffList(data);
            if (!selectedStaffId && data.length > 0) {
              setSelectedStaffId(initialStaff?.id || data[0].id);
            }
          })
          .catch(console.error);
      }
    }
  }, [isOpen, branchId, user, isBranchUnlocked, initialService, initialStaff, selectedServiceId, selectedStaffId]);

  // Load time slots when service, staff, and date are selected
  useEffect(() => {
    if (branchId && selectedStaffId && selectedServiceId && selectedDate && user && isBranchUnlocked(branchId)) {
      setSlotsLoading(true);
      apiFetch<TimeSlotDto[]>(`/appointments/slots?branchId=${branchId}&staffId=${selectedStaffId}&serviceId=${selectedServiceId}&date=${selectedDate}`)
        .then(slots => {
          setTimeSlots(slots);
          const firstAvailable = slots.find(s => s.isAvailable);
          if (firstAvailable) {
            setSelectedSlot(firstAvailable.startTime);
          } else {
            setSelectedSlot('');
          }
        })
        .catch(console.error)
        .finally(() => setSlotsLoading(false));
    }
  }, [branchId, selectedStaffId, selectedServiceId, selectedDate, user, isBranchUnlocked]);

  if (!isOpen) return null;

  const selectedService = services.find(s => s.id === selectedServiceId) || initialService;
  const selectedStaff = staffList.find(s => s.id === selectedStaffId) || initialStaff;

  const basePrice = selectedService ? Number(selectedService.price) : 0;
  const taxAmount = paymentMode === 'ONLINE' ? Number((basePrice * 0.02).toFixed(2)) : 0;
  const totalPrice = Number((basePrice + taxAmount).toFixed(2));

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = `/auth/login?redirect=/branches/${branchId}`;
      return;
    }

    if (!selectedSlot) {
      setErrorMsg('Please select an available time slot');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Create Appointment
      const appointment = await apiFetch<AppointmentResponse>('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          branchId,
          staffId: selectedStaffId,
          serviceId: selectedServiceId,
          appointmentDate: selectedDate,
          startTime: selectedSlot,
          paymentMode,
          notes,
        }),
      });

      if (paymentMode === 'ONLINE') {
        setStep('PAYING');
        // Initiate Online Payment with 2% tax
        const order = await apiFetch<PaymentOrderResponse>('/payments/booking/initiate', {
          method: 'POST',
          body: JSON.stringify({ appointmentId: appointment.id }),
        });

        // Simulate Razorpay verify callback
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
            if (onBookingSuccess) onBookingSuccess();
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification failed');
            setStep('FORM');
            setLoading(false);
          }
        }, 1500);

      } else {
        // At-Spa mode: confirmed immediately
        setConfirmedBooking(appointment);
        setStep('SUCCESS');
        setLoading(false);
        if (onBookingSuccess) onBookingSuccess();
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete booking');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 shadow-2xl text-stone-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'FORM' && (
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            
            {/* Header */}
            <div>
              <h3 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Reserve Your Spa Session
              </h3>
              <div className="flex items-center gap-2 text-xs text-amber-300/80 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{branchName} {branchCity ? `— ${branchCity}` : ''}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Select Service */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                1. Select Treatment / Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-1">
                {services.map(svc => (
                  <button
                    type="button"
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`text-left p-3 rounded-xl border transition ${
                      selectedServiceId === svc.id
                        ? 'border-amber-500 bg-amber-950/30 text-amber-100'
                        : 'border-stone-800 bg-stone-950/50 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">{svc.name}</div>
                    <div className="flex justify-between items-center text-[11px] text-stone-400 mt-1">
                      <span>{svc.durationMinutes} mins</span>
                      <span className="font-bold text-amber-300">₹{svc.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Therapist */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                2. Select Available Therapist
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {staffList.map(st => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setSelectedStaffId(st.id)}
                    className={`text-left p-3 rounded-xl border transition relative ${
                      selectedStaffId === st.id
                        ? 'border-amber-500 bg-amber-950/30 text-amber-100 ring-1 ring-amber-500'
                        : 'border-stone-800 bg-stone-950/50 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-stone-800 overflow-hidden shrink-0 border border-stone-700">
                        {st.profilePhotoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={st.profilePhotoUrl} alt={st.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-stone-500 m-2.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate">{st.name}</div>
                        <div className="text-[10px] text-stone-400 truncate">{st.specialization}</div>
                      </div>
                    </div>

                    {/* Check-in badge */}
                    <div className="mt-2 text-[10px] flex items-center gap-1 font-medium">
                      {st.todayCheckinStatus === 'PRESENT' && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Today
                        </span>
                      )}
                      {st.todayCheckinStatus === 'ON_LEAVE' && (
                        <span className="text-rose-400 flex items-center gap-1">
                          <X className="w-3 h-3" /> On Leave
                        </span>
                      )}
                      {st.todayCheckinStatus === 'NOT_CONFIRMED_YET' && (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  3. Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  4. Available Time Slots
                </label>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-stone-400 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Checking therapist availability...</span>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                    {timeSlots.map(slot => (
                      <button
                        type="button"
                        key={slot.startTime}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot.startTime)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          selectedSlot === slot.startTime
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-500 shadow-md shadow-amber-500/20'
                            : slot.isAvailable
                            ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-amber-500/50'
                            : 'border-stone-900 bg-stone-950/30 text-stone-600 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.startTime.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 py-2.5">No slots available for this therapist on selected date.</div>
                )}
              </div>
            </div>

            {/* Payment Mode Selection (Online with 2% Tax OR Pay-at-Spa) */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                5. Payment Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMode('ONLINE')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    paymentMode === 'ONLINE'
                      ? 'border-amber-500 bg-amber-950/30 text-amber-100 ring-1 ring-amber-500'
                      : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Pay Online (Razorpay)</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Instant confirmation + 2% service tax (₹{((basePrice * 0.02) || 0).toFixed(2)})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('AT_SPA')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    paymentMode === 'AT_SPA'
                      ? 'border-amber-500 bg-amber-950/30 text-amber-100 ring-1 ring-amber-500'
                      : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Pay at Reception (At Spa)</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Reserve slot now, pay upon arrival (No online tax)
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown Footer */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Treatment Service Fee</span>
                <span>₹{basePrice.toFixed(2)}</span>
              </div>
              {paymentMode === 'ONLINE' && (
                <div className="flex justify-between text-stone-400">
                  <span>Online Service Tax (2%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
                <span className="font-semibold text-stone-200 text-sm">
                  {paymentMode === 'ONLINE' ? 'Total Payable Now' : 'Payable at Spa Arrival'}
                </span>
                <span className="font-serif text-2xl font-bold text-amber-300">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {paymentMode === 'ONLINE'
                      ? `Confirm & Pay ₹${totalPrice.toFixed(2)}`
                      : 'Confirm Slot (Pay at Spa)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

        {step === 'PAYING' && (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <h4 className="font-serif text-xl font-bold text-amber-200">Processing Online Razorpay Checkout...</h4>
            <p className="text-xs text-stone-400">Securing appointment for ₹{totalPrice.toFixed(2)}...</p>
          </div>
        )}

        {step === 'SUCCESS' && confirmedBooking && (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-2xl font-bold text-emerald-200">Reservation Confirmed!</h4>
              <p className="text-xs text-stone-400">Your luxury spa ritual has been booked.</p>
            </div>

            {/* Booking Summary Box */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Treatment</span>
                <span className="font-semibold text-stone-200">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Therapist</span>
                <span className="font-semibold text-stone-200">{confirmedBooking.staffName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Date & Time</span>
                <span className="font-semibold text-stone-200">{confirmedBooking.appointmentDate} at {confirmedBooking.startTime.substring(0, 5)}</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-2">
                <span className="text-stone-400">Location</span>
                <span className="font-semibold text-stone-200">{confirmedBooking.branchName}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-400">Payment Status</span>
                <span className="font-bold text-amber-300">
                  {confirmedBooking.paymentMode === 'ONLINE' ? 'PAID ONLINE (₹' + confirmedBooking.totalPrice + ')' : 'PAY AT SPA (₹' + confirmedBooking.totalPrice + ')'}
                </span>
              </div>
            </div>

            {confirmedBooking.branchMapsUrl && (
              <a
                href={confirmedBooking.branchMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open Location in Google Maps</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="block w-full max-w-xs mx-auto bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
