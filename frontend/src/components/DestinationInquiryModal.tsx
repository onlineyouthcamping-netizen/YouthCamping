"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, Send, AlertCircle } from "lucide-react";
import { normalizeImageUrl, submitInquiry } from "@/lib/api";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface DestinationInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: {
    id?: string;
    name: string;
    img: string;
    duration?: string;
    subtext?: string;
    availableDates?: string[];
  } | null;
  title?: string;
  description?: string;
  source?: string;
}

export default function DestinationInquiryModal({
  isOpen,
  onClose,
  destination,
  title,
  description,
  source = 'website_booking_button'
}: DestinationInquiryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    date: "",
    count: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Prefill date if available
      if (destination?.availableDates && destination.availableDates.length > 0) {
        const firstDate = destination.availableDates[0];
        // Format date string from YYYY-MM-DD or similar to YYYY-MM-DD if possible
        try {
          const d = new Date(firstDate);
          if (!isNaN(d.getTime())) {
            const formattedDate = d.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, date: formattedDate }));
          }
        } catch (e) {
          // ignore formatting errors
        }
      }
    } else {
      document.body.style.overflow = "unset";
      setIsSuccess(false);
    }
  }, [isOpen, destination]);

  if (!destination) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Append city to message for database compatibility
      const formattedMessage = formData.city
        ? `City: ${formData.city}${formData.message ? `\nMessage: ${formData.message}` : ""}`
        : formData.message;

      const result = await submitInquiry({
        name: formData.name,
        phone: formData.mobile,
        email: formData.email,
        date: formData.date || (destination.availableDates?.[0] || undefined),
        count: formData.count ? parseInt(formData.count) : undefined,
        message: formattedMessage,
        tripId: destination?.id,
        tripTitle: destination?.name,
        source: source
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => onClose(), 2000); // Close after 2 seconds
      } else {
        setError(result.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = title || "Plan Your Next Trip";
  const modalDescription = description || "Connect with our destination experts";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-[90vw] md:w-full md:max-w-5xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left side: Image & Info - Hidden on mobile to prevent layout/keyboard overflow */}
            <div className="relative w-full md:w-1/2 h-64 md:h-auto hidden md:block">
              <OptimizedImage 
                src={normalizeImageUrl(destination.img)} 
                alt={destination.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <p className="text-sm font-bold capitalize tracking-widest mb-2 opacity-90">
                  {destination.duration || "Custom Itinerary"}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tighter capitalize italic leading-[0.9]">
                  {destination.name} Highlights
                </h2>
                <p className="text-sm font-medium opacity-80">
                  {destination.subtext || "Curated experiences and local exploration"}
                </p>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto bg-white flex flex-col justify-center">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors z-10"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>

              <div className="mb-6 md:mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-navy tracking-tighter leading-none mb-3 italic capitalize">{modalTitle}</h3>
                <p className="text-zinc-400 font-bold text-xs capitalize tracking-widest">{modalDescription}</p>
              </div>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                    <Send className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-navy mb-2 capitalize italic tracking-tighter">Request Received!</h4>
                  <p className="text-zinc-500 font-bold font-montserrat">Our expert will reach out to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}
                  <div>
                    <input
                      required
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm placeholder:text-zinc-300 h-12 md:h-14"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="px-4 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-400 font-bold text-sm flex items-center shrink-0 h-12 md:h-14">
                      +91
                    </div>
                    <input
                      required
                      type="tel"
                      placeholder="Mobile No."
                      className="flex-1 px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm placeholder:text-zinc-300 h-12 md:h-14"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm placeholder:text-zinc-300 h-12 md:h-14"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <input
                      required
                      type="text"
                      placeholder="City of Residence"
                      className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm placeholder:text-zinc-300 h-12 md:h-14"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                      <input
                        required
                        type="date"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm text-zinc-500 h-12 md:h-14"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                      <input
                        required
                        type="number"
                        placeholder="Travellers"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm placeholder:text-zinc-300 h-12 md:h-14"
                        value={formData.count}
                        onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder="Message (optional)"
                      rows={2}
                      className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-100 focus:border-primary-orange focus:ring-0 outline-none transition-all font-bold text-sm placeholder:text-zinc-300 resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-4 md:py-5 bg-primary-orange text-white rounded-2xl font-bold text-lg capitalize tracking-tighter shadow-xl hover:bg-primary-orange/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isSubmitting ? "Connecting..." : "Connect with Expert"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
