import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Clock, Calendar as CalendarIcon, CheckCircle2, 
  CreditCard, Scissors, AlertCircle, ArrowLeft, ShieldCheck, Zap, Sparkles, Award, Star, ExternalLink 
} from 'lucide-react';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    fetchShopAndServices();
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [id, selectedDate]);

  const fetchShopAndServices = async () => {
    try {
      setLoading(true);
      const [shopRes, servicesRes] = await Promise.all([
        api.get(`/customer/shops/${id}`),
        api.get(`/customer/shops/${id}/services`),
      ]);
      setShop(shopRes.data);
      setServices(servicesRes.data);
      if (servicesRes.data.length > 0) {
        setSelectedService(servicesRes.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load salon details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    try {
      setSlotLoading(true);
      setSelectedSlot(null);
      const res = await api.get(`/customer/shops/${id}/slots`, {
        params: { date },
      });
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSlotLoading(false);
    }
  };

  const isSlotPast = (slotDate, slotStartTime) => {
    if (!slotDate || !slotStartTime) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (slotDate < todayStr) return true;
    if (slotDate === todayStr) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      return slotStartTime.slice(0, 5) < currentTimeStr;
    }
    return false;
  };

  const handleStartBooking = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/shops/${id}` } } });
      return;
    }

    if (!selectedService || !selectedSlot) {
      setError('Please select both a service and a time slot.');
      return;
    }

    // Edge Case Check: Ensure slot has not elapsed in real time
    if (isSlotPast(selectedDate, selectedSlot.startTime)) {
      setError(`Cannot book this slot (${selectedSlot.startTime?.slice(0, 5)}). The appointment time has already passed.`);
      setSelectedSlot(null);
      fetchSlots(selectedDate);
      return;
    }

    setError('');
    setBookingLoading(true);

    try {
      // 1. Create Booking on Backend
      const bookingRes = await api.post('/customer/bookings', {
        shopId: shop.id,
        serviceId: selectedService.id,
        slotId: selectedSlot.id,
      });

      const newBooking = bookingRes.data.booking;
      setCreatedBookingId(newBooking.id);

      // 2. Generate Razorpay Payment Order
      const payRes = await api.post(`/customer/payments/order?bookingId=${newBooking.id}`);
      setPaymentOrder(payRes.data);

      // 3. Open Payment Modal
      setPaymentModalOpen(true);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || 'Failed to book slot. It may have just been booked by another patron or time elapsed.');
      // Auto-refresh slots to reflect real-time availability
      fetchSlots(selectedDate);
      setSelectedSlot(null);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!createdBookingId || !paymentOrder) return;

    setPaymentProcessing(true);
    try {
      // Complete payment verification on backend
      const res = await api.post('/customer/payments/verify', {
        bookingId: createdBookingId,
        razorpayOrderId: paymentOrder.orderId,
        razorpayPaymentId: 'pay_rzp_mock_' + Math.random().toString(36).substring(2, 9),
        razorpaySignature: '',
      });

      setSuccessBooking(res.data);
      setPaymentModalOpen(false);
    } catch (err) {
      console.error(err);
      setError('Payment verification failed.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-serif-vintage font-bold text-[#fef3c7]">Parlour not discovered</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-5 py-2 retro-btn-brass rounded-xl text-xs font-cinzel uppercase"
        >
          Return to All Salons
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-xs font-cinzel text-amber-400/80 hover:text-amber-300 mb-6 transition tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Parlours</span>
      </button>

      {/* Success Booking Banner */}
      {successBooking && (
        <div className="mb-8 p-6 bg-[#162719] border-2 border-emerald-600/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel tracking-widest uppercase text-emerald-400 font-bold block">
                Appointment Pass Issued
              </span>
              <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">Booking Confirmed & Secured!</h3>
              <p className="text-xs text-[#a9d9b4] mt-0.5">
                Your session for <strong>{selectedService?.name}</strong> at <strong>{shop.name}</strong> has been confirmed.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-cinzel font-bold text-xs rounded-xl shadow-lg transition tracking-wider uppercase cursor-pointer"
          >
            View Appointment Pass
          </button>
        </div>
      )}

      {/* Parlour Header Card with Photography Banner */}
      <div className="retro-card retro-corner-flourish rounded-3xl shadow-2xl relative overflow-hidden mb-8 border-2 border-[#574132]">
        {/* Salon Cover Photo Banner */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#16120e]">
          <img
            src={shop.imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80'}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191410] via-[#191410]/70 to-black/40"></div>

          {/* Top Badges over banner */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#120e0b]/90 backdrop-blur-sm border border-amber-600/50 text-amber-300 text-[10px] font-cinzel font-bold rounded-md uppercase tracking-wider">
                Certified Guild Parlour
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#120e0b]/90 backdrop-blur-sm border border-amber-600/40 text-[10px] font-cinzel font-bold text-amber-300">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{shop.rating || 4.9}</span>
                <span className="text-[#a39485]">({shop.ratingCount || 120})</span>
              </span>
            </div>
            <span className="px-2.5 py-1 bg-[#120e0b]/90 backdrop-blur-sm rounded text-[10px] font-retro-mono text-amber-200 border border-[#3d2e24]">
              #{String(shop.id).padStart(3, '0')}
            </span>
          </div>

          {/* Bottom Title over banner */}
          <div className="absolute bottom-4 left-6 right-6 z-10">
            <h1 className="text-2xl sm:text-4xl font-serif-vintage font-bold text-[#fef3c7] tracking-tight">
              {shop.name}
            </h1>
            {shop.tagline && (
              <p className="text-xs sm:text-sm text-amber-200/90 italic mt-1 font-serif-vintage">
                "{shop.tagline}"
              </p>
            )}
          </div>
        </div>

        {/* Details & Location Row */}
        <div className="p-6 sm:p-8 bg-[#191410] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-5 text-xs text-[#dcd0c0]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="max-w-md">{shop.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hours: <strong className="text-[#fef3c7] font-retro-mono">{shop.openTime?.slice(0, 5)}</strong> to <strong className="text-[#fef3c7] font-retro-mono">{shop.closeTime?.slice(0, 5)}</strong></span>
              </div>
            </div>

            {shop.googleMapsUrl && (
              <div>
                <a
                  href={shop.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241a13] hover:bg-[#34241a] text-amber-300 border border-amber-600/40 text-xs font-cinzel tracking-wider transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-4 bg-[#14100d] border border-[#4a3828] rounded-2xl text-center min-w-[130px]">
              <p className="text-[11px] font-cinzel text-[#a39485] uppercase tracking-wider">Bespoke Services</p>
              <p className="text-2xl font-serif-vintage font-bold text-amber-400 mt-0.5">{services.length}</p>
            </div>
            <div className="p-4 bg-[#14100d] border border-[#4a3828] rounded-2xl text-center min-w-[130px]">
              <p className="text-[11px] font-cinzel text-[#a39485] uppercase tracking-wider">Proprietor</p>
              <p className="text-xs font-semibold text-[#fef3c7] mt-2 line-clamp-1">{shop.owner?.name || 'Guild Master'}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-950/60 border border-red-800/80 rounded-xl p-4 flex items-center gap-3 text-red-200 text-xs shadow-inner">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Booking Grid: Left (Services & Slots) / Right (Summary Ticket & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Services Selection */}
          <div className="retro-card rounded-2xl p-6 shadow-xl border border-[#4a3828]">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#3d2e24]">
              <div className="w-7 h-7 rounded bg-[#2a1e16] border border-amber-600/40 text-amber-400 flex items-center justify-center font-cinzel font-bold text-xs">
                I
              </div>
              <h2 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">Select Bespoke Service</h2>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-[#a39485]">No services currently listed for this parlour.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`rounded-xl border cursor-pointer transition overflow-hidden flex flex-col justify-between ${
                      selectedService?.id === svc.id
                        ? 'bg-[#2b1f16] border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500'
                        : 'bg-[#14100d] border-[#382b20] hover:border-[#574132]'
                    }`}
                  >
                    {/* Service Photo Thumbnail if available */}
                    {svc.imageUrl && (
                      <div className="h-32 w-full overflow-hidden bg-[#16120e] relative">
                        <img
                          src={svc.imageUrl}
                          alt={svc.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14100d] via-transparent to-black/20"></div>
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-0.5 bg-[#120e0b]/90 backdrop-blur-sm rounded text-[11px] font-bold font-retro-mono text-amber-300 border border-amber-600/40">
                            ₹{svc.price}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-[#fef3c7] leading-snug">{svc.name}</p>
                        {!svc.imageUrl && (
                          <span className="text-sm font-bold font-retro-mono text-amber-400">₹{svc.price}</span>
                        )}
                      </div>

                      {svc.description && (
                        <p className="text-[11px] text-[#a39485] line-clamp-2 leading-relaxed">
                          {svc.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#2e221a] flex items-center justify-between text-xs text-[#a39485]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                          <span className="font-retro-mono">{svc.duration} mins session</span>
                        </span>
                        {selectedService?.id === svc.id && (
                          <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                            SELECTED ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Date & Time Slot Selection */}
          <div className="retro-card rounded-2xl p-6 shadow-xl border border-[#4a3828]">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#3d2e24]">
              <div className="w-7 h-7 rounded bg-[#2a1e16] border border-amber-600/40 text-amber-400 flex items-center justify-center font-cinzel font-bold text-xs">
                II
              </div>
              <h2 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">Choose Appointment Date & Slot</h2>
            </div>

            {/* Date Picker Buttons */}
            <div className="mb-6">
              <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-2.5">
                Select Date
              </label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4].map((offset) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offset);
                  const dateStr = d.toISOString().split('T')[0];
                  const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-cinzel tracking-wider uppercase border transition cursor-pointer ${
                        selectedDate === dateStr
                          ? 'retro-btn-brass font-bold'
                          : 'bg-[#14100d] text-[#b8a898] border-[#3d2e24] hover:border-[#574132]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Grid */}
            <div>
              <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-2.5">
                Available Slots for {selectedDate}
              </label>

              {slotLoading ? (
                <div className="py-8 text-center text-xs font-retro-mono text-[#a39485] animate-pulse">Checking available time slots...</div>
              ) : slots.length === 0 ? (
                <div className="p-6 bg-[#14100d] border border-[#3d2e24] rounded-xl text-center space-y-2">
                  <Clock className="w-8 h-8 text-amber-500/40 mx-auto" />
                  <p className="text-xs font-serif-vintage text-[#fef3c7] font-bold">No Open Slots Available</p>
                  <p className="text-[11px] text-[#a39485]">
                    All appointment passes for this date have either elapsed or been booked. Please choose tomorrow or an upcoming date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isPast = isSlotPast(selectedDate, slot.startTime);
                    const isBooked = slot.isBooked;
                    const isDisabled = isPast || isBooked;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedSlot(slot);
                            setError('');
                          }
                        }}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          isDisabled
                            ? 'bg-[#100c09] border-[#221a14] text-[#55473d] opacity-55 cursor-not-allowed'
                            : isSelected
                            ? 'retro-btn-brass font-bold shadow-md'
                            : 'bg-[#14100d] text-[#dcd0c0] border-[#382b20] hover:border-amber-500/50 hover:bg-[#201813] cursor-pointer'
                        }`}
                      >
                        <span className={`text-xs font-retro-mono ${isPast ? 'line-through' : ''}`}>
                          {slot.startTime?.slice(0, 5)} - {slot.endTime?.slice(0, 5)}
                        </span>
                        {isPast ? (
                          <span className="text-[9px] font-cinzel tracking-wider text-red-400/80 uppercase font-bold">
                            Time Passed
                          </span>
                        ) : isBooked ? (
                          <span className="text-[9px] font-cinzel tracking-wider text-amber-500/80 uppercase font-bold">
                            Reserved
                          </span>
                        ) : (
                          <span className="text-[9px] font-cinzel tracking-wider text-emerald-400 uppercase font-semibold">
                            Available
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Vintage Appointment Voucher Card */}
        <div className="space-y-6">
          <div className="retro-card retro-corner-flourish rounded-2xl p-6 shadow-2xl sticky top-24 border-2 border-[#574132]">
            
            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#574132] space-y-1">
              <span className="text-[10px] font-cinzel text-amber-400 font-bold uppercase tracking-widest block">
                Instant Confirmation
              </span>
              <h3 className="text-xl font-serif-vintage font-bold text-[#fef3c7]">
                Appointment Summary
              </h3>
            </div>

            <div className="space-y-3.5 text-xs py-5 border-b border-dashed border-[#574132]">
              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Salon</span>
                <span className="font-semibold text-[#fef3c7]">{shop.name}</span>
              </div>

              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Service</span>
                <span className="font-semibold text-[#fef3c7]">{selectedService ? selectedService.name : '—'}</span>
              </div>

              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Duration</span>
                <span className="font-retro-mono text-[#dcd0c0]">{selectedService ? `${selectedService.duration} mins` : '—'}</span>
              </div>

              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Date</span>
                <span className="font-retro-mono text-[#dcd0c0]">{selectedDate}</span>
              </div>

              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Slot</span>
                <span className="font-retro-mono text-amber-400 font-bold">
                  {selectedSlot ? `${selectedSlot.startTime?.slice(0, 5)} - ${selectedSlot.endTime?.slice(0, 5)}` : 'Select a slot'}
                </span>
              </div>
            </div>

            {/* Price Total */}
            <div className="py-4 border-b border-[#3d2e24] flex justify-between items-center">
              <span className="text-xs font-cinzel font-semibold text-[#b8a898] uppercase">Total Fee</span>
              <span className="text-2xl font-serif-vintage font-bold text-amber-400">
                ₹{selectedService ? selectedService.price : '0'}
              </span>
            </div>

            {/* Book & Pay Button */}
            <button
              type="button"
              disabled={!selectedService || !selectedSlot || bookingLoading}
              onClick={handleStartBooking}
              className="mt-6 w-full py-3.5 px-4 retro-btn-brass rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs font-cinzel tracking-wider uppercase cursor-pointer"
            >
              {bookingLoading ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-stone-900" />
                  <span className="font-bold">Reserve & Authorize (₹{selectedService?.price || 0})</span>
                </>
              )}
            </button>

            <p className="text-[10px] font-retro-mono text-[#7d6c5d] text-center mt-4">
              ❖ Verified Test Checkout • Encrypted ❖
            </p>
          </div>
        </div>

      </div>

      {/* Razorpay Simulation Modal */}
      {paymentModalOpen && paymentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#191410] border-2 border-[#574132] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#3d2e24]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#271c15] border border-amber-600/40 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif-vintage font-bold text-[#fef3c7]">Razorpay Checkout Gateway</h4>
                  <p className="text-[10px] font-retro-mono text-[#a39485]">Simulated Test Authorization</p>
                </div>
              </div>
              <span className="text-[10px] font-retro-mono px-2 py-0.5 bg-[#2a1f18] text-amber-300 rounded border border-amber-600/40">
                TEST MODE
              </span>
            </div>

            {/* Order Details Box */}
            <div className="p-4 bg-[#120e0b] border border-[#3d2e24] rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Order Identifier:</span>
                <span className="text-[#dcd0c0] font-retro-mono">{paymentOrder.orderId}</span>
              </div>
              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Selected Service:</span>
                <span className="text-[#fef3c7] font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-[#a39485]">
                <span className="font-cinzel text-[11px]">Parlour:</span>
                <span className="text-[#fef3c7] font-medium">{shop.name}</span>
              </div>
              <div className="flex justify-between text-[#a39485] pt-2 border-t border-[#2e221a]">
                <span className="font-cinzel text-xs font-bold text-[#fef3c7]">Total Payable:</span>
                <span className="text-base font-bold font-retro-mono text-amber-400">₹{paymentOrder.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={paymentProcessing}
                onClick={handleSimulatePaymentSuccess}
                className="w-full py-3 retro-btn-brass rounded-xl text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paymentProcessing ? (
                  <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Authorize Test Payment (Complete)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={paymentProcessing}
                onClick={() => setPaymentModalOpen(false)}
                className="w-full py-2.5 bg-[#14100d] hover:bg-[#201813] text-[#a39485] text-xs font-cinzel rounded-xl transition border border-[#3d2e24] cursor-pointer"
              >
                Cancel Transaction
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ShopDetail;

