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

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
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
        <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Loading Booking Details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Booking Not Found</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || 'We could not load your booking details. Please verify your booking link or contact support.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#FF5B00] hover:bg-[#E65200] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#FF5B00]/20"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-400">
              <Sparkles size={10} /> Booking Success
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none pt-2">
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
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booking ID</span>
              <p className="text-xl font-black font-mono text-[#FF5B00]">{booking.bookingId}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
              <p className="text-sm font-black uppercase text-amber-400">{booking.status || 'Pending'}</p>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            {/* Trip Info */}
            <div className="space-y-2">
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded text-[9px] font-black uppercase text-slate-300">
                {booking.tripId || 'Expedition'}
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">{booking.tripName}</h2>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 pt-1">
                <div className="flex items-center gap-1.5"><Calendar size={14} className="text-[#FF5B00]" /> {booking.departureDate ? new Date(booking.departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Flexible Date'}</div>
                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FF5B00]" /> {booking.pickupCity || 'Delhi (Direct Join)'}</div>
                <div className="flex items-center gap-1.5"><Users size={14} className="text-[#FF5B00]" /> {booking.passengers?.length || 1} Travelers</div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Travelers list */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Travelers Manifest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.passengers && booking.passengers.length > 0 ? (
                  booking.passengers.map((traveler: any, index: number) => (
                    <div key={index} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white uppercase">{traveler.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {traveler.gender} • Age {traveler.age || 'N/A'}
                        </p>
                      </div>
                      <span className="text-[9px] font-black bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase">
                        Traveler {index + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white uppercase">{booking.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {booking.gender || 'Male'} • Age {booking.age || 'N/A'}
                      </p>
                    </div>
                    <span className="text-[9px] font-black bg-[#FF5B00]/10 text-[#FF5B00] px-2 py-0.5 rounded uppercase">
                      Lead
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Price breakdown */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Breakdown</h3>
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Package Base Subtotal</span>
                  <span className="font-bold text-white">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Paid Deposit / Advance</span>
                  <span className="font-bold text-white">₹{booking.advancePaid?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Payment Mode Selection</span>
                  <span className="font-black text-amber-400 uppercase text-[10px]">{booking.paymentMode || 'UPI'}</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between items-center text-sm font-black uppercase tracking-wider">
                  <span className="text-[#FF5B00]">Remaining Balance</span>
                  <span className="text-xl text-white">₹{(booking.remainingAmount ?? (booking.totalAmount - booking.advancePaid))?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href={`https://wa.me/9174374374783?text=Hi%2C%20I%20just%20completed%20booking%20${booking.bookingId}%20for%20${encodeURIComponent(booking.tripName)}.%20Please%20verify%20my%20details.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Phone size={14} /> Connect on WhatsApp
              </a>
              
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
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
