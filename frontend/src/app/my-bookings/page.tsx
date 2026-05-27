'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, CreditCard, ChevronRight, Hash, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from '@/lib/api';

export default function MyBookingsPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/my-bookings/search?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      if (data.success) {
        setBookings(data.data);
        setSearched(true);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-navy uppercase tracking-tighter"
          >
            My <span className="text-primary-orange">Bookings</span>
          </motion.h1>
          <p className="text-zinc-500 font-medium">Track your upcoming adventures and payment status.</p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-[32px] shadow-xl shadow-zinc-200/50 border border-zinc-100 max-w-xl mx-auto"
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="tel"
                placeholder="Enter your phone number..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-orange transition-all font-bold text-navy"
              />
            </div>
            <button 
              disabled={loading}
              type="submit"
              className="bg-navy text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs font-bold mt-3 px-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
        </motion.div>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {searched && bookings.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-zinc-200"
              >
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-black text-navy uppercase">No Bookings Found</h3>
                <p className="text-zinc-500 text-sm mt-1">We couldn't find any bookings for this number.</p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking, idx) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedBooking(booking)}
                    className="group bg-white p-6 rounded-[32px] border border-zinc-100 hover:border-primary-orange/30 hover:shadow-2xl hover:shadow-primary-orange/5 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center cursor-pointer"
                  >
                    {/* Status Icon */}
                    <div className={cn(
                      "w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110",
                      booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {booking.status === 'confirmed' ? <Calendar className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">
                          {booking.bookingId}
                        </span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          booking.paymentStatus === 'Paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-navy uppercase tracking-tight">{booking.tripName || "Adventure Trip"}</h3>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-400">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {booking.pickupCity || "Departure TBD"}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : 'Date TBD'}</span>
                      </div>
                    </div>

                    {/* Financial Info */}
                    <div className="w-full md:w-auto text-left md:text-right space-y-1 pr-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount Paid</p>
                      <p className="text-2xl font-black text-navy tracking-tighter">₹{booking.advancePaid?.toLocaleString() || 0}</p>
                      <p className="text-[10px] font-bold text-zinc-400">Total: ₹{booking.totalAmount?.toLocaleString() || 0}</p>
                    </div>

                    <ChevronRight className="w-6 h-6 text-zinc-200 group-hover:text-primary-orange group-hover:translate-x-1 transition-all hidden md:block" />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 overflow-y-auto scrollbar-hide flex-1 space-y-8">
                {/* Modal Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-orange">{selectedBooking.bookingId}</span>
                    <h2 className="text-3xl font-black text-navy uppercase tracking-tighter leading-none">{selectedBooking.tripName}</h2>
                    <p className="text-zinc-500 text-sm font-medium">{selectedBooking.departureDate ? new Date(selectedBooking.departureDate).toLocaleDateString('en-IN', { dateStyle: 'full' }) : 'Date to be announced'}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest",
                    selectedBooking.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {selectedBooking.status}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 p-6 rounded-[32px] border border-zinc-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Bill</p>
                    <p className="text-2xl font-black text-navy tracking-tight">₹{selectedBooking.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-6 rounded-[32px] border border-emerald-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Paid</p>
                    <p className="text-2xl font-black text-emerald-700 tracking-tight">₹{selectedBooking.advancePaid?.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50/50 p-6 rounded-[32px] border border-red-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Remaining</p>
                    <p className="text-2xl font-black text-red-700 tracking-tight">₹{(selectedBooking.totalAmount - selectedBooking.advancePaid).toLocaleString()}</p>
                  </div>
                </div>

                {/* Primary Guest */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-100 pb-2">Primary Guest Details</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Name</p>
                      <p className="font-bold text-navy">{selectedBooking.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Phone</p>
                      <p className="font-bold text-navy">{selectedBooking.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Email</p>
                      <p className="font-bold text-navy">{selectedBooking.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Pickup</p>
                      <p className="font-bold text-navy">{selectedBooking.pickupCity || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Travelers */}
                {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-100 pb-2">Co-Travelers ({selectedBooking.passengers.length})</h4>
                    <div className="space-y-2">
                      {selectedBooking.passengers.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-100">{i + 1}</div>
                            <span className="font-bold text-navy uppercase text-sm">{p.name}</span>
                          </div>
                          <span className="text-xs font-medium text-zinc-500">{p.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trip Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-100 pb-2">Preferences</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-zinc-400">Payment Mode</span>
                        <span className="text-xs font-bold text-navy">{selectedBooking.paymentMode || 'UPI'}</span>
                      </div>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-zinc-400">Room Type</span>
                        <span className="text-xs font-bold text-navy">{selectedBooking.roomType || 'Standard'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Important Notes</h4>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-medium text-amber-900 italic leading-relaxed">
                      "{selectedBooking.notes}"
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                <Button 
                  onClick={() => window.print()}
                  className="flex-1 bg-white border border-zinc-200 text-navy hover:bg-zinc-100 h-14 rounded-2xl font-black uppercase text-xs tracking-widest"
                >
                  Download Receipt
                </Button>
                <Button 
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 bg-navy text-white hover:bg-black h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-navy/20"
                >
                  Close View
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
