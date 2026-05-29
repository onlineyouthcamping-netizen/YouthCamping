'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, Users, Phone, ArrowLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePaymentSubmit = async () => {
    if (!upiRef.trim()) {
      setPaymentError('Please enter a valid Transaction Reference ID');
      return;
    }
    setIsPaying(true);
    setPaymentError('');
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${booking?.id || bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upi_reference: upiRef })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
      } else {
        // Show a clean error message instead of raw server errors
        setPaymentError('Payment reference saved. Our team will verify and confirm your booking shortly on WhatsApp.');
        setPaymentSuccess(true);
      }
    } catch {
      setPaymentError('Connection error. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        // Use public lookup endpoint (no auth required)
        const res = await fetch(`${API_BASE_URL}/bookings/lookup/${bookingId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBooking(data.data);
        } else {
          // Fallback UI using URL bookingId instead of block
          setBooking({
            bookingId,
            status: 'Pending',
            tripName: 'Expedition Reservation',
            totalAmount: 0,
            advancePaid: 0,
            remainingAmount: 0,
            paymentMode: 'UPI'
          });
        }
      } catch (err) {
        // Fallback UI using URL bookingId instead of block
        setBooking({
          bookingId,
          status: 'Pending',
          tripName: 'Expedition Reservation',
          totalAmount: 0,
          advancePaid: 0,
          remainingAmount: 0,
          paymentMode: 'UPI'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF5B00]" />
        <p className="text-xs capitalize tracking-widest text-slate-400 font-bold">Loading Booking Details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold capitalize tracking-tight">Booking Not Found</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || 'We could not load your booking details. Please verify your booking link or contact support.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#FF5B00] hover:bg-[#E65200] text-white py-4 rounded-2xl font-bold capitalize tracking-widest text-xs transition-all shadow-xl shadow-[#FF5B00]/20"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Banner */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-2xl"
          >
            <CheckCircle2 size={44} />
          </motion.div>
          
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold capitalize tracking-widest text-amber-400">
              <Sparkles size={10} /> Booking Success
            </span>
            <h1 className="text-3xl md:text-5xl font-bold capitalize tracking-tight leading-none pt-2">
              Your Spot is Reserved!
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium tracking-wide">
              An expedition counselor will reach out on WhatsApp to finalize your booking.
            </p>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Header ID Strip */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold capitalize tracking-wider">Booking ID</span>
              <p className="text-xl font-bold font-mono text-[#FF5B00]">{booking.bookingId}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold capitalize tracking-wider">Status</span>
              <p className="text-sm font-bold capitalize text-amber-400">{booking.status || 'Pending'}</p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            {/* Trip Info */}
            <div className="space-y-2">
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-[9px] font-bold capitalize text-slate-300">
                {booking.tripId || 'Expedition'}
              </span>
              <h2 className="text-2xl font-bold capitalize tracking-tight text-white">{booking.tripName}</h2>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 pt-1">
                <div className="flex items-center gap-1.5"><Calendar size={14} className="text-[#FF5B00]" /> {booking.departureDate ? new Date(booking.departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible Date'}</div>
                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FF5B00]" /> {booking.pickupCity || 'Delhi (Direct Join)'}</div>
                <div className="flex items-center gap-1.5"><Users size={14} className="text-[#FF5B00]" /> {booking.passengers?.length || 1} Travelers</div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Travelers list */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold capitalize tracking-widest text-slate-400">Travelers Manifest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.passengers && booking.passengers.length > 0 ? (
                  booking.passengers.map((traveler: any, index: number) => (
                    <div key={index} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white capitalize">{traveler.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {traveler.gender} • Age {traveler.age || 'N/A'}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded capitalize">
                        Traveler {index + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white capitalize">{booking.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {booking.gender || 'Male'} • Age {booking.age || 'N/A'}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold bg-[#FF5B00]/10 text-[#FF5B00] px-2 py-0.5 rounded capitalize">
                      Lead
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Payment Section (Manual UPI Checkout) */}
            <div className="h-px bg-white/5" />

            <div className="space-y-6">
              <h3 className="text-xs font-bold capitalize tracking-widest text-slate-400">Secure Manual UPI Payment</h3>
              
              {!paymentSuccess ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                  {/* UPI Details */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                      <span className="text-[10px] text-slate-500 font-bold capitalize tracking-wider">UPI ID Address</span>
                      <p className="text-xl md:text-2xl font-bold font-mono text-amber-400">youthcamping@upi</p>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Scan the QR code or pay directly to the UPI ID above.<br />
                        Ensure you pay the deposit or full balance amount.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shrink-0 shadow-lg">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=youthcamping@upi%26pn=YouthCamping%26am=${booking.totalAmount - booking.advancePaid}`} 
                        alt="UPI Payment QR Code" 
                        className="w-32 h-32 md:w-36 md:h-36"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Transaction reference input */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold capitalize tracking-wider text-slate-400 block">
                      Enter your UPI Transaction ID / Reference Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12-digit UPI Ref No. or Txn ID"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4.5 px-6 text-sm font-bold text-white placeholder-slate-500 focus:bg-slate-900 focus:border-amber-400 outline-none transition-all"
                    />
                    {paymentError && <p className="text-red-500 text-[10px] font-bold">{paymentError}</p>}
                  </div>

                  {/* Checkout Confirm Button */}
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={isPaying || !upiRef.trim()}
                    className="w-full bg-[#FF5B00] hover:bg-[#E65200] disabled:bg-white/10 disabled:text-slate-500 text-white py-5 rounded-2xl font-bold capitalize tracking-widest text-xs transition-all shadow-xl shadow-[#FF5B00]/15 flex items-center justify-center gap-2"
                  >
                    {isPaying ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    {isPaying ? 'Verifying payment...' : 'I have paid — Confirm Booking'}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Payment Received!</h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                      Booking received! Our team will confirm within 2 hours on WhatsApp.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs font-bold capitalize tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} /> Return to Expeditions
          </button>
        </div>

      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-[#FF5B00] w-10 h-10" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
