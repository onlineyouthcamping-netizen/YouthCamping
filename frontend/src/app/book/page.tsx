'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, Users, Bed, Train, 
  ChevronRight, ChevronLeft, Calendar, MapPin, CheckCircle2,
  Loader2, AlertCircle, Info, Navigation, ShieldCheck, Tag, Star, 
  Headset, Lock, Check, Sparkles, AlertTriangle, CreditCard, Building
} from 'lucide-react';
import { API_BASE_URL, normalizeImageUrl } from '@/lib/api';
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { cn } from "@/lib/utils";

// Hardcoded fallback list of Joining Points
const FALLBACK_JOINING_POINTS = [
  { cityName: 'Delhi', deductionAmount: 0, skipDays: 0, pickupPoint: 'Majnu ka Tilla' },
  { cityName: 'Mumbai', deductionAmount: 1500, skipDays: 1, pickupPoint: 'Bandra Terminus' },
  { cityName: 'Ahmedabad', deductionAmount: 1000, skipDays: 1, pickupPoint: 'Kalupur Station' },
  { cityName: 'Bengaluru', deductionAmount: 2000, skipDays: 2, pickupPoint: 'Majestic Terminal' },
  { cityName: 'Pune', deductionAmount: 1500, skipDays: 1, pickupPoint: 'Pune Railway Station' },
  { cityName: 'Direct Join', deductionAmount: 2500, skipDays: 2, pickupPoint: 'Base Camp / Destination' }
];

// Coupon Codes mapping
const COUPONS: { [key: string]: { discount: number; type: 'flat' | 'percent'; desc: string } } = {
  'CAMP500': { discount: 500, type: 'flat', desc: 'Flat ₹500 discount on your booking' },
  'YOUTH10': { discount: 10, type: 'percent', desc: '10% discount on package total' },
  'FIRSTCAMP': { discount: 1000, type: 'flat', desc: 'Flat ₹1000 introductory discount' }
};

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initial parameters parsed from URL
  const initialParams = useMemo(() => {
    try {
      const trip = searchParams.get('trip');
      const date = searchParams.get('date');
      const tid = searchParams.get('tid');
      const price = searchParams.get('price');
      const salesperson = searchParams.get('salesperson');

      const sanitize = (val: string | null) => 
        val ? decodeURIComponent(val.replace(/\+/g, ' ')).trim() : '';

      return {
        tripName: sanitize(trip),
        date: sanitize(date),
        tripId: sanitize(tid),
        salesPersonName: sanitize(salesperson) || 'Direct',
        basePrice: price ? parseInt(price) : 0
      };
    } catch (e) {
      console.error("❌ Failed to parse URL parameters:", e);
      return { tripName: '', date: '', tripId: '', salesPersonName: 'Direct', basePrice: 0 };
    }
  }, [searchParams]);

  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(true);
  const [error, setError] = useState('');
  const [tripData, setTripData] = useState<any>(null);
  const [basePrice, setBasePrice] = useState(initialParams.basePrice || 13999);

  // Dynamic joining points loaded from tripData or fallback
  const joiningPoints = useMemo(() => {
    // 1. Primary Source: Location Variants (variants)
    if (tripData?.variants && Array.isArray(tripData.variants) && tripData.variants.length > 0) {
      const baselinePrice = tripData.price || Math.max(...tripData.variants.map((v: any) => v.discountedPrice || 0), basePrice);
      return tripData.variants.map((v: any) => {
        const variantPrice = Number(v.discountedPrice) || Number(v.originalPrice) || 0;
        const deduction = Math.max(0, baselinePrice - variantPrice);
        return {
          cityName: v.location || 'Unknown Point',
          deductionAmount: deduction,
          skipDays: Number(v.skipDays) || 0,
          pickupPoint: v.duration || 'Standard Package'
        };
      });
    }

    // 2. Secondary Source: Pickup Cities
    if (tripData?.pickupCities && Array.isArray(tripData.pickupCities) && tripData.pickupCities.length > 0) {
      return tripData.pickupCities.map((c: any) => ({
        cityName: c.cityName || 'Unknown Point',
        deductionAmount: Number(c.deductionAmount) || 0,
        skipDays: Number(c.skipDays) || 0,
        pickupPoint: c.pickupPoint || 'Assigned Landmark'
      }));
    }

    // 3. Fallback
    return FALLBACK_JOINING_POINTS;
  }, [tripData, basePrice]);

  const [selectedCity, setSelectedCity] = useState<typeof FALLBACK_JOINING_POINTS[0]>(FALLBACK_JOINING_POINTS[0]);
  
  // Keep selectedCity synced once joiningPoints are resolved, matching the url price param if applicable
  useEffect(() => {
    if (joiningPoints.length > 0) {
      if (initialParams.basePrice && tripData?.variants && Array.isArray(tripData.variants)) {
        const matchingVariantIdx = tripData.variants.findIndex((v: any) => v.discountedPrice === initialParams.basePrice);
        if (matchingVariantIdx !== -1 && joiningPoints[matchingVariantIdx]) {
          setSelectedCity(joiningPoints[matchingVariantIdx]);
          return;
        }
      }
      setSelectedCity(joiningPoints[0]);
    }
  }, [joiningPoints, initialParams.basePrice, tripData]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Full Payment' | 'Partial Payment'>('Full Payment');

  // Checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Unified booking state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cityState: '',
    specialRequests: '',
    participants: 1,
    participantsList: [{ name: '', phone: '', email: '', age: '', gender: 'Male', roomSharing: 'Triple Sharing', trainOption: 'Sleeper' }]
  });

  // Fetch Trip information
  useEffect(() => {
    const fetchTrip = async () => {
      setDataFetching(true);
      setError('');
      try {
        let foundTrip = null;
        if (initialParams.tripId) {
          const res = await fetch(`${API_BASE_URL}/trips/${initialParams.tripId}`);
          const json = await res.json();
          if (json.success && json.data) {
            foundTrip = json.data;
          }
        }
        if (!foundTrip && initialParams.tripName) {
          const res = await fetch(`${API_BASE_URL}/trips?status=all`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            // Normalize spaces, casing, and all types of dashes for robust matching
            const normalize = (str: string) => 
              (str || '')
                .toLowerCase()
                .replace(/[\u2013\u2014-]/g, '-') // Normalize en-dash, em-dash, and hyphens to a single dash
                .replace(/[^a-z0-9]/g, '')        // Keep only alphanumeric characters for comparison
                .trim();

            const targetNormalized = normalize(initialParams.tripName);
            
            // 1. Try exact normalized match of title or slug
            foundTrip = json.data.find((t: any) => normalize(t.title) === targetNormalized || normalize(t.slug) === targetNormalized);
            
            // 2. Try fuzzy/partial match of title
            if (!foundTrip) {
              foundTrip = json.data.find((t: any) => 
                normalize(t.title).includes(targetNormalized) || 
                targetNormalized.includes(normalize(t.title))
              );
            }
            
            // 3. Fallback to index 0 if no match
            if (!foundTrip) {
              foundTrip = json.data[0];
            }
          }
        }

        if (foundTrip) {
          setTripData(foundTrip);
          // Always use the master trip price as the baseline basePrice so that the variant deductions are calculated correctly from the baseline
          const baseline = foundTrip.price || (foundTrip.variants && foundTrip.variants.length > 0 ? Math.max(...foundTrip.variants.map((v: any) => v.discountedPrice || 0)) : 13999);
          setBasePrice(baseline);
        }
      } catch (err) {
        console.warn("Could not fetch live trip info, using fallback data.");
      } finally {
        setDataFetching(false);
      }
    };
    fetchTrip();
  }, [initialParams.tripId, initialParams.tripName, initialParams.basePrice]);

  // Adjust passengers list size dynamically
  const syncParticipantsCount = (count: number) => {
    const list = [...formData.participantsList];
    if (list.length < count) {
      for (let i = list.length; i < count; i++) {
        list.push({ name: '', phone: '', email: '', age: '', gender: 'Male', roomSharing: 'Triple Sharing', trainOption: 'Sleeper' });
      }
    } else if (list.length > count) {
      list.splice(count);
    }
    setFormData(prev => ({
      ...prev,
      participants: count,
      participantsList: list
    }));
  };

  const handleParticipantChange = (index: number, field: string, value: string) => {
    const list = [...formData.participantsList];
    list[index] = { ...list[index], [field]: value };
    setFormData(prev => ({ ...prev, participantsList: list }));
  };

  // Pricing calculations
  const pricing = useMemo(() => {
    let originalTotalBase = 0;

    formData.participantsList.forEach((p) => {
      let travelerPrice = basePrice;
      
      // Train options adjustment
      if (p.trainOption === '3AC') travelerPrice += 2000;
      if (p.trainOption === '2AC') travelerPrice += 3500;
      if (p.trainOption === 'No Train') travelerPrice -= 1500;

      // Room sharing options adjustment
      if (p.roomSharing === 'Double Sharing') travelerPrice += 1500;
      if (p.roomSharing === 'Quad Sharing') travelerPrice -= 500;

      // Joining point deductions
      const deduction = selectedCity?.deductionAmount || 0;
      travelerPrice = Math.max(0, travelerPrice - deduction);

      originalTotalBase += travelerPrice;
    });

    // Coupon Discount
    let couponDiscount = 0;
    if (appliedCoupon && COUPONS[appliedCoupon]) {
      const rule = COUPONS[appliedCoupon];
      if (rule.type === 'flat') {
        couponDiscount = rule.discount;
      } else if (rule.type === 'percent') {
        couponDiscount = Math.round(originalTotalBase * (rule.discount / 100));
      }
    }

    const netBase = Math.max(0, originalTotalBase - couponDiscount);
    
    // Partial payment details: ₹2000 deposit per traveler
    const depositPerPax = 2000;
    const partialBaseAmount = depositPerPax * formData.participants;

    // GST Calculation
    let gstAmount = 0;
    let finalTotal = 0;
    let advancePaid = 0;

    if (paymentMode === 'Full Payment') {
      gstAmount = Math.round(netBase * 0.05);
      finalTotal = netBase + gstAmount;
      advancePaid = finalTotal;
    } else {
      gstAmount = Math.round(partialBaseAmount * 0.05);
      finalTotal = partialBaseAmount + gstAmount;
      advancePaid = finalTotal;
    }

    return {
      originalTotalBase,
      couponDiscount,
      netBase,
      partialBaseAmount,
      gstAmount,
      finalTotal,
      advancePaid,
      remainingBalance: (netBase + Math.round(netBase * 0.05)) - advancePaid
    };
  }, [basePrice, selectedCity, formData.participants, formData.participantsList, appliedCoupon, paymentMode]);

  // Apply Coupon Code
  const applyPromo = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
    } else {
      setCouponError('Invalid promo code');
      setAppliedCoupon(null);
    }
  };

  // Step-by-Step validation
  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.name.trim()) return 'Lead Traveler Name is required';
      if (!formData.phone.trim()) return 'Mobile number is required';
      if (formData.phone.replace(/\D/g, '').length !== 10) return 'WhatsApp number must be a valid 10-digit number';
      if (!formData.cityState.trim()) return 'City/State is required';
    } else if (currentStep === 2) {
      if (!selectedCity) return 'Please select a joining point';
      for (let i = 0; i < formData.participantsList.length; i++) {
        const traveler = formData.participantsList[i];
        if (!traveler.name.trim()) return `Name is required for Traveler ${i + 1}`;
        if (!traveler.phone.trim()) return `Mobile is required for Traveler ${i + 1}`;
        if (traveler.phone.replace(/\D/g, '').length !== 10) return `Traveler ${i + 1} mobile number must be 10 digits`;
        if (!traveler.age.trim()) return `Age is required for Traveler ${i + 1}`;
      }
    } else if (currentStep === 4) {
      if (!acceptTerms) return 'You must accept the Terms and Conditions to continue';
    }
    return '';
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  // Submit Final Booking Data to /api/bookings/create
  const handleFinalSubmit = async () => {
    const valError = validateStep();
    if (valError) {
      setError(valError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        fullName: formData.name,
        name: formData.name,
        mobile: formData.phone,
        phone: formData.phone,
        email: formData.email || null,
        tripId: initialParams.tripId || tripData?.id || 'manual',
        tripName: initialParams.tripName || tripData?.title || 'Expedition',
        departureDate: initialParams.date ? new Date(initialParams.date) : null,
        pickupCity: selectedCity.cityName,
        skipDays: selectedCity.skipDays,
        adjustedPrice: pricing.originalTotalBase / formData.participants,
        amount: pricing.netBase,
        totalAmount: paymentMode === 'Full Payment' ? pricing.finalTotal : (pricing.netBase + Math.round(pricing.netBase * 0.05)),
        advancePaid: pricing.advancePaid,
        status: 'pending',
        paymentStatus: paymentMode === 'Full Payment' ? 'Paid' : 'Partial',
        paymentMode: 'UPI',
        notes: `City/State: ${formData.cityState}. Requests: ${formData.specialRequests}. WhatsApp Opt-in: ${whatsappOptIn ? 'Yes' : 'No'}`,
        passengers: formData.participantsList.map(p => ({
          name: p.name,
          phone: p.phone,
          email: p.email || null,
          age: parseInt(p.age) || null,
          gender: p.gender,
          roomSharing: p.roomSharing,
          trainOption: p.trainOption
        })),
        trainClass: formData.participantsList[0]?.trainOption || 'Sleeper',
        roomType: formData.participantsList[0]?.roomSharing || 'Triple Sharing',
        ticketStatus: 'Not Booked',
        basePrice: basePrice,
        gstAmount: pricing.gstAmount
      };

      const res = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data?.bookingId) {
        router.push(`/book/confirmation?bookingId=${data.data.bookingId}`);
      } else {
        setError(data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setError('Connection to booking engine failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-slate-900 pb-20">
      
      {/* Top Banner / Backdrop (Premium Light Layout) */}
      <div className="relative h-[250px] w-full overflow-hidden bg-slate-900">
        {tripData?.images?.[0] ? (
          <OptimizedImage 
            src={normalizeImageUrl(tripData.images[0])} 
            alt={initialParams.tripName} 
            className="w-full h-full object-cover opacity-45 scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-8 max-w-7xl mx-auto px-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF5B00]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#FF5B00] mb-2">
            <Sparkles size={10} /> Premium Expeditions
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-white">
            {initialParams.tripName || 'Adventure Checkout'}
          </h1>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-4">
            <span>Date: {initialParams.date || 'Flexible'}</span>
            <span>Code: {initialParams.tripId || 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="max-w-7xl mx-auto px-6 mb-10 -mt-6 relative z-10">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-md">
          {[
            { step: 1, label: 'Lead Contact' },
            { step: 2, label: 'Travelers List' },
            { step: 3, label: 'Pricing Summary' },
            { step: 4, label: 'Verification' }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                currentStep >= item.step 
                  ? "bg-[#FF5B00] text-white shadow-lg shadow-[#FF5B00]/25" 
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              )}>
                {currentStep > item.step ? <Check size={12} strokeWidth={4} /> : item.step}
              </div>
              <span className={cn(
                "text-[10px] uppercase font-black tracking-widest",
                currentStep >= item.step ? "text-slate-900" : "text-slate-400"
              )}>
                {item.label}
              </span>
              {item.step < 4 && <div className={cn("w-8 md:w-16 h-[2px] bg-slate-100", currentStep > item.step && "bg-[#FF5B00]")} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Area: Inputs */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF5B00]/10 rounded-2xl flex items-center justify-center text-[#FF5B00]">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Lead Contact Details</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary booking supervisor</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative group">
                        <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF5B00] transition-colors" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#FF5B00] focus:ring-4 focus:ring-[#FF5B00]/5 outline-none transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                          <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF5B00] transition-colors" />
                          <input
                            type="tel"
                            required
                            placeholder="WhatsApp Number *"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#FF5B00] focus:ring-4 focus:ring-[#FF5B00]/5 outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>

                        <div className="relative group">
                          <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF5B00] transition-colors" />
                          <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#FF5B00] focus:ring-4 focus:ring-[#FF5B00]/5 outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* City/State Text Field */}
                      <div className="relative group">
                        <Building size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF5B00] transition-colors" />
                        <input
                          type="text"
                          required
                          placeholder="City/State *"
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#FF5B00] focus:ring-4 focus:ring-[#FF5B00]/5 outline-none transition-all"
                          value={formData.cityState}
                          onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  {/* Joining Point Selection */}
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF5B00]/10 rounded-2xl flex items-center justify-center text-[#FF5B00]">
                        <Navigation size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Joining Point</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select where you want to meet us (Loaded from Trip info)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {joiningPoints.map((city: any) => {
                        const active = selectedCity?.cityName === city.cityName;
                        return (
                          <button
                            key={city.cityName}
                            type="button"
                            onClick={() => setSelectedCity(city)}
                            className={cn(
                              "text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[110px]",
                              active 
                                ? "border-[#FF5B00] bg-[#FF5B00]/5" 
                                : "border-slate-100 bg-slate-50/50 hover:border-slate-350"
                            )}
                          >
                            <div className="flex justify-between w-full items-start">
                              <div>
                                <p className="text-xs font-black uppercase text-slate-800">{city.cityName}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{city.pickupPoint}</p>
                              </div>
                              {active && <Check size={14} className="text-[#FF5B00]" />}
                            </div>
                            <div className="flex justify-between items-end w-full pt-2 mt-2 border-t border-slate-100 text-[9px] font-black uppercase text-slate-400">
                              <span className="text-emerald-600">Deduction: -₹{city.deductionAmount}</span>
                              <span className="text-slate-500">Skip: {city.skipDays} Days</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Travelers Manifest Inputs */}
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF5B00]/10 rounded-2xl flex items-center justify-center text-[#FF5B00]">
                        <Users size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Traveler Manifest</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fill info for all tour members</p>
                      </div>
                    </div>

                    {/* Quick Traveler Count Select */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Number of Travelers</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => syncParticipantsCount(n)}
                            className={cn(
                              "py-3.5 rounded-xl font-black text-xs transition-all border",
                              formData.participants === n 
                                ? "bg-[#FF5B00] border-[#FF5B00] text-white shadow-lg shadow-[#FF5B00]/25" 
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Participant detail loops */}
                    <div className="space-y-4 pt-2">
                      {formData.participantsList.map((traveler, index) => (
                        <div key={index} className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#FF5B00]">Traveler {index + 1} details</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              required
                              placeholder="Full Name *"
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#FF5B00]"
                              value={traveler.name}
                              onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                            />
                            <input
                              required
                              placeholder="Mobile Number *"
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#FF5B00]"
                              value={traveler.phone}
                              onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              required
                              type="number"
                              placeholder="Age *"
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none focus:border-[#FF5B00]"
                              value={traveler.age}
                              onChange={(e) => handleParticipantChange(index, 'age', e.target.value)}
                            />
                            <select
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none"
                              value={traveler.gender}
                              onChange={(e) => handleParticipantChange(index, 'gender', e.target.value)}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Room Sharing Option for this traveler */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1"><Bed size={10} /> Room Sharing Option</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Double Sharing', 'Triple Sharing', 'Quad Sharing'].map((room) => (
                                <button
                                  key={room}
                                  type="button"
                                  onClick={() => handleParticipantChange(index, 'roomSharing', room)}
                                  className={cn(
                                    "py-2 rounded-lg font-bold text-[9px] border text-center transition-all",
                                    traveler.roomSharing === room ? "bg-[#FF5B00]/10 border-[#FF5B00] text-[#FF5B00]" : "bg-white border-slate-200 text-slate-500"
                                  )}
                                >
                                  {room}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Train Class Option for this traveler */}
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[8px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1"><Train size={10} /> Train Ticket Option</label>
                            <div className="grid grid-cols-4 gap-2">
                              {['Sleeper', '3AC', '2AC', 'No Train'].map((train) => (
                                <button
                                  key={train}
                                  type="button"
                                  onClick={() => handleParticipantChange(index, 'trainOption', train)}
                                  className={cn(
                                    "py-2 rounded-lg font-bold text-[9px] border text-center transition-all",
                                    traveler.trainOption === train ? "bg-[#FF5B00]/10 border-[#FF5B00] text-[#FF5B00]" : "bg-white border-slate-200 text-slate-500"
                                  )}
                                >
                                  {train}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests textarea (optional) */}
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 space-y-4 shadow-sm">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2"><Info size={12}/> Special Requests (Optional)</span>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF5B00] min-h-[100px] transition-all"
                      placeholder="Tell us about food allergies, physical requirements, room requests, or other details..."
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  {/* Coupon & Payment Modes */}
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF5B00]/10 rounded-2xl flex items-center justify-center text-[#FF5B00]">
                        <Tag size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Coupons & Payments</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select payment type and apply promos</p>
                      </div>
                    </div>

                    {/* Coupons */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Promo Coupon Code</label>
                      <div className="flex gap-2">
                        <input
                          placeholder="e.g. CAMP500"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 uppercase outline-none focus:bg-white focus:border-[#FF5B00]"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={applyPromo}
                          className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-700"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-red-500 text-[10px] font-bold">{couponError}</p>}
                      {appliedCoupon && (
                        <p className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={10} /> Coupon Applied: {appliedCoupon} ({COUPONS[appliedCoupon]?.desc})
                        </p>
                      )}
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Payment Mode Selection */}
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block flex items-center gap-1.5"><CreditCard size={12} /> Payment Plan Selection</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMode('Full Payment')}
                          className={cn(
                            "text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[90px]",
                            paymentMode === 'Full Payment' ? "border-[#FF5B00] bg-[#FF5B00]/5" : "border-slate-100 bg-slate-50/50 hover:border-slate-350"
                          )}
                        >
                          <div className="flex justify-between w-full items-center">
                            <span className="text-xs font-black uppercase text-slate-800">Pay In Full</span>
                            {paymentMode === 'Full Payment' && <Check size={14} className="text-[#FF5B00]" />}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Get immediate confirmation of booking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMode('Partial Payment')}
                          className={cn(
                            "text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[90px]",
                            paymentMode === 'Partial Payment' ? "border-[#FF5B00] bg-[#FF5B00]/5" : "border-slate-100 bg-slate-50/50 hover:border-slate-350"
                          )}
                        >
                          <div className="flex justify-between w-full items-center">
                            <span className="text-xs font-black uppercase text-slate-800">Partial Payment (Deposit)</span>
                            {paymentMode === 'Partial Payment' && <Check size={14} className="text-[#FF5B00]" />}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Pay only ₹2,000/pax to reserve. Pay rest later.</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-8 md:p-10 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF5B00]/10 rounded-2xl flex items-center justify-center text-[#FF5B00]">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Terms & Verification</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirm final submission</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 text-xs font-medium text-slate-500 leading-relaxed">
                      <p>
                        By placing this booking, you verify that all traveler names, mobile numbers, and personal details match Government-issued photo IDs.
                      </p>
                      <p>
                        Cancellations, transfers, and refunds are managed strictly under the YouthCamping standard trip reservation agreement.
                      </p>
                    </div>

                    {/* Step 4: Mandatory T&C + optional WhatsApp opt-in checkboxes */}
                    <div className="space-y-4 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[#FF5B00] rounded focus:ring-offset-slate-950"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                        />
                        <span className={cn("font-bold text-slate-700", !acceptTerms && "text-slate-500")}>
                          I agree to the terms and conditions and trip reservation guidelines * (Mandatory)
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[#FF5B00] rounded focus:ring-offset-slate-950"
                          checked={whatsappOptIn}
                          onChange={(e) => setWhatsappOptIn(e.target.checked)}
                        />
                        <span className="font-bold text-slate-700">
                          Opt-in to receive booking updates and itinerary information directly on WhatsApp (Optional)
                        </span>
                      </label>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 p-5 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between items-center gap-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrev}
                  type="button"
                  className="bg-white border border-slate-200 text-slate-700 rounded-2xl py-4.5 px-8 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-50"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  type="button"
                  className="ml-auto bg-[#FF5B00] hover:bg-[#E65200] text-white rounded-2xl py-4.5 px-8 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-[#FF5B00]/20"
                >
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  type="button"
                  className="ml-auto bg-[#FF5B00] hover:bg-[#E65200] text-white rounded-2xl py-5 px-10 font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-[#FF5B00]/30 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={14} />}
                  {loading ? 'Processing...' : 'Confirm & Place Booking'}
                </button>
              )}
            </div>
          </div>

          {/* Right Area: Sticky Desktop Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-10 space-y-6">
              
              {/* Summary Card */}
              <div className="bg-white border border-slate-200/80 rounded-[2.5rem] overflow-hidden shadow-md">
                <div className="p-8 space-y-6">
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-[#FF5B00] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={10} /> Live Expedition Summary
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                      {initialParams.tripName || 'Trip Checkout'}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {initialParams.date || 'Flexible'}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {formData.participants} Travelers</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Calculations breakdown */}
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Package Base Total</span>
                      <span className="font-bold text-slate-900">₹{pricing.originalTotalBase.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-500">
                      <span>Joining Point</span>
                      <span className="font-black uppercase text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{selectedCity?.cityName || 'Delhi'}</span>
                    </div>

                    {selectedCity?.deductionAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Pickup City Discount</span>
                        <span className="font-bold">-₹{(selectedCity.deductionAmount * formData.participants).toLocaleString()}</span>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Promo Code: {appliedCoupon}</span>
                        <span className="font-bold">-₹{pricing.couponDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-500">
                      <span>GST @ 5%</span>
                      <span className="font-bold text-slate-900">+₹{pricing.gstAmount.toLocaleString()}</span>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />

                    {/* Plan description */}
                    <div className="bg-slate-50 p-4 rounded-xl space-y-1 border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Plan Selected</p>
                      <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{paymentMode}</p>
                      <p className="text-[9px] text-slate-500 font-bold leading-tight uppercase">
                        {paymentMode === 'Full Payment' ? 'Immediate full checkout' : `Reserve at deposit of ₹2,000/pax. Balance due before trip start.`}
                      </p>
                    </div>

                    {/* Grand Total */}
                    <div className="bg-[#FF5B00] bg-gradient-to-br from-[#FF5B00] to-[#FF8A00] p-6 rounded-2xl flex flex-col justify-between text-white shadow-xl shadow-[#FF5B00]/10">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-70">Total Amount Due Now</span>
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-3xl font-black tracking-tighter">₹{pricing.finalTotal.toLocaleString()}</span>
                        <span className="text-[9px] font-bold opacity-60">Inclusive of GST</span>
                      </div>
                    </div>

                    {paymentMode === 'Partial Payment' && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest pt-1">
                        <span>Remaining Balance Later</span>
                        <span className="text-slate-800">₹{pricing.remainingBalance.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges footer */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm">
                  <ShieldCheck className="text-[#FF5B00]" size={16} />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">100% Secured</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm">
                  <Lock className="text-[#FF5B00]" size={16} />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">SSL Checkout</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="animate-spin text-[#FF5B00] w-10 h-10" /></div>}>
        <BookingForm />
      </Suspense>
    </main>
  );
}
