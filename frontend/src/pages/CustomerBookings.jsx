import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Calendar, Clock, MapPin, CheckCircle, AlertTriangle, 
  XCircle, Clock3, CreditCard, Scissors, Sparkles, RefreshCw, AlertCircle, Award 
} from 'lucide-react';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const confirmAndCancelBooking = async () => {
    if (!selectedBookingToCancel) return;

    setCancellingId(selectedBookingToCancel.id);
    try {
      await api.post(`/customer/bookings/${selectedBookingToCancel.id}/cancel`);
      setNotification(`Appointment pass #BK-${selectedBookingToCancel.id} has been voided / cancelled.`);
      setSelectedBookingToCancel(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((item) => {
    if (filter === 'ALL') return true;
    return item.booking.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 tracking-wider">
            <CheckCircle className="w-3 h-3" />
            CONFIRMED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold bg-amber-950/70 text-amber-300 border border-amber-600/50 tracking-wider">
            <Clock3 className="w-3 h-3" />
            PENDING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold bg-[#261e17] text-amber-300 border border-amber-500/40 tracking-wider">
            <Award className="w-3 h-3" />
            HONORED & COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold bg-red-950/70 text-red-300 border border-red-800/50 tracking-wider">
            <XCircle className="w-3 h-3" />
            VOIDED
          </span>
        );
      default:
        return <span className="text-xs font-retro-mono text-[#a39485]">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="text-[11px] font-retro-mono text-emerald-400 font-semibold">Authorized • Razorpay</span>;
      case 'REFUNDED':
        return <span className="text-[11px] font-retro-mono text-amber-400 font-semibold">Refund Credited</span>;
      case 'PENDING':
        return <span className="text-[11px] font-retro-mono text-amber-400 font-semibold">Pending Authorization</span>;
      default:
        return <span className="text-[11px] font-retro-mono text-[#a39485]">{status || 'N/A'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#3d2e24] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-serif-vintage font-bold text-[#fef3c7] tracking-tight">
              My Appointment Passes
            </h1>
            <span className="text-amber-500/70 text-sm">❖</span>
          </div>
          <p className="text-xs text-[#a39485] mt-1">Review, track, and manage your scheduled parlour appointments</p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1c1612] hover:bg-[#281f19] text-[#dcd0c0] rounded-xl text-xs font-cinzel tracking-wider border border-[#4a3828] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {notification && (
        <div className="mb-6 p-4 bg-[#142316] border border-emerald-600/50 text-emerald-300 text-xs rounded-xl flex items-center justify-between shadow-md">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="text-[#a39485] hover:text-[#fef3c7] cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-center justify-between shadow-md">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-[#a39485] hover:text-[#fef3c7] cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-cinzel tracking-wider uppercase transition shrink-0 cursor-pointer ${
              filter === tab
                ? 'retro-btn-brass font-bold'
                : 'bg-[#18130f] text-[#a39485] hover:text-[#fef3c7] border border-[#3d2e24] hover:border-[#574132]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#18130f] rounded-2xl animate-pulse border border-[#3d2e24]"></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-[#18130f] border-2 border-dashed border-[#4a3828] rounded-2xl p-8">
          <Scissors className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
          <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">No Appointment Passes Recorded</h3>
          <p className="text-xs text-[#a39485] mt-1">You have no active or archived vouchers under this category.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 retro-btn-brass text-xs font-cinzel tracking-wider uppercase rounded-xl shadow-md"
          >
            Explore Salons & Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(({ booking, transaction }) => (
            <div
              key={booking.id}
              className="retro-card retro-corner-flourish rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition border border-[#4a3828] hover:border-amber-600/50"
            >
              {/* Left Details */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-serif-vintage font-bold text-[#fef3c7]">
                    {booking.service?.name}
                  </span>
                  {getStatusBadge(booking.status)}
                  <span className="text-xs text-[#a39485] font-retro-mono px-2 py-0.5 bg-[#120e0b] rounded border border-[#3d2e24]">
                    #BK-{booking.id}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-[#dcd0c0]">
                  <div className="flex items-center gap-1.5 text-[#fef3c7] font-medium">
                    <Scissors className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{booking.shop?.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#a89887]">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-retro-mono">{booking.slot?.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#a89887]">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-retro-mono">{booking.slot?.startTime?.slice(0, 5)} - {booking.slot?.endTime?.slice(0, 5)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#8c7c6d]">
                  <MapPin className="w-4 h-4 text-amber-500/70 shrink-0" />
                  <span>{booking.shop?.address}</span>
                </div>
              </div>

              {/* Right Details: Price, Payment Status & Cancellation Button */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-[#3d2e24]">
                <div className="text-left md:text-right">
                  <span className="text-xl font-serif-vintage font-bold text-amber-400 block">
                    ₹{booking.service?.price}
                  </span>
                  <div>{getPaymentBadge(transaction?.paymentStatus)}</div>
                </div>

                {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => setSelectedBookingToCancel(booking)}
                    className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 text-red-300 rounded-xl text-xs font-cinzel tracking-wider uppercase transition cursor-pointer"
                  >
                    Void Pass
                  </button>
                ) : (
                  <span className="text-xs font-retro-mono text-[#7d6c5d] italic">
                    {booking.status === 'CANCELLED' ? '[Voided]' : '[Archived]'}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedBookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191410] border-2 border-[#574132] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-950/60 rounded-xl border border-red-800/50">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-serif-vintage font-bold text-[#fef3c7]">Void Appointment Pass?</h3>
                <p className="text-xs text-[#a39485]">This action will release your reserved slot in the parlour ledger.</p>
              </div>
            </div>

            <div className="p-4 bg-[#120e0b] border border-[#3d2e24] rounded-xl space-y-1.5 text-xs text-[#dcd0c0]">
              <p><strong className="text-amber-400 font-cinzel">Parlour:</strong> {selectedBookingToCancel.shop?.name}</p>
              <p><strong className="text-amber-400 font-cinzel">Service:</strong> {selectedBookingToCancel.service?.name}</p>
              <p><strong className="text-amber-400 font-cinzel">Slot:</strong> {selectedBookingToCancel.slot?.date} at {selectedBookingToCancel.slot?.startTime?.slice(0, 5)}</p>
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={cancellingId !== null}
                onClick={() => setSelectedBookingToCancel(null)}
                className="px-4 py-2 bg-[#14100d] hover:bg-[#201813] text-[#a39485] text-xs font-cinzel rounded-xl border border-[#3d2e24] transition cursor-pointer"
              >
                Retain Pass
              </button>
              <button
                type="button"
                disabled={cancellingId !== null}
                onClick={confirmAndCancelBooking}
                className="px-4 py-2 retro-btn-carmine text-xs font-cinzel tracking-wider uppercase rounded-xl shadow-lg transition cursor-pointer"
              >
                {cancellingId ? 'Voiding...' : 'Yes, Void Pass'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerBookings;

