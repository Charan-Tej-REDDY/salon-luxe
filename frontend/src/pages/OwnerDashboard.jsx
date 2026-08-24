import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Store, Plus, Edit2, Trash2, Calendar, Clock, CheckCircle, 
  XCircle, CheckSquare, Sparkles, RefreshCw, Scissors, IndianRupee, Layers, ShieldCheck, Award 
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();

  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form states
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [shopForm, setShopForm] = useState({ name: '', address: '', openTime: '09:00', closeTime: '21:00' });

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ id: null, name: '', price: '', duration: 45 });

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    slotDurationMinutes: 45,
  });

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'services'

  useEffect(() => {
    fetchMyShops();
  }, []);

  useEffect(() => {
    if (selectedShop) {
      fetchShopServices(selectedShop.id);
      fetchShopBookings(selectedShop.id);
    }
  }, [selectedShop]);

  const fetchMyShops = async () => {
    try {
      setLoading(true);
      const res = await api.get('/owner/shops');
      setShops(res.data);
      if (res.data.length > 0 && !selectedShop) {
        setSelectedShop(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopServices = async (shopId) => {
    try {
      const res = await api.get(`/owner/shops/${shopId}/services`);
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShopBookings = async (shopId) => {
    try {
      const res = await api.get(`/owner/shops/${shopId}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Shop Actions ---
  const handleOpenCreateShop = () => {
    setIsEditingShop(false);
    setShopForm({ name: '', address: '', openTime: '09:00', closeTime: '21:00' });
    setShopModalOpen(true);
  };

  const handleOpenEditShop = () => {
    if (!selectedShop) return;
    setIsEditingShop(true);
    setShopForm({
      name: selectedShop.name,
      address: selectedShop.address,
      openTime: selectedShop.openTime.slice(0, 5),
      closeTime: selectedShop.closeTime.slice(0, 5),
    });
    setShopModalOpen(true);
  };

  const handleSaveShop = async (e) => {
    e.preventDefault();
    try {
      if (isEditingShop) {
        const res = await api.put(`/owner/shops/${selectedShop.id}`, shopForm);
        setSelectedShop(res.data);
      } else {
        const res = await api.post('/owner/shops', shopForm);
        setSelectedShop(res.data);
      }
      setShopModalOpen(false);
      fetchMyShops();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save parlour details.');
    }
  };

  // --- Service Actions ---
  const handleOpenCreateService = () => {
    setIsEditingService(false);
    setServiceForm({ id: null, name: '', price: '', duration: 45 });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setIsEditingService(true);
    setServiceForm({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;
    try {
      if (isEditingService) {
        await api.put(`/owner/services/${serviceForm.id}`, {
          name: serviceForm.name,
          price: parseFloat(serviceForm.price),
          duration: parseInt(serviceForm.duration),
        });
      } else {
        await api.post(`/owner/shops/${selectedShop.id}/services`, {
          name: serviceForm.name,
          price: parseFloat(serviceForm.price),
          duration: parseInt(serviceForm.duration),
        });
      }
      setServiceModalOpen(false);
      fetchShopServices(selectedShop.id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save service.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/owner/services/${serviceId}`);
      fetchShopServices(selectedShop.id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete service.');
    }
  };

  // --- Slot Actions ---
  const handleGenerateBatchSlots = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;
    try {
      await api.post(`/owner/shops/${selectedShop.id}/slots/batch`, slotForm);
      setSlotModalOpen(false);
      alert('Batch time slots recorded in ledger for ' + slotForm.date);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate slots.');
    }
  };

  // --- Booking Status Actions ---
  const handleUpdateBookingStatus = async (bookingId, action) => {
    try {
      if (action === 'confirm') {
        await api.put(`/owner/bookings/${bookingId}/confirm`);
      } else if (action === 'complete') {
        await api.put(`/owner/bookings/${bookingId}/complete`);
      } else if (action === 'cancel') {
        await api.post(`/owner/bookings/${bookingId}/cancel`);
      }
      if (selectedShop) {
        fetchShopBookings(selectedShop.id);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${action} booking.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#3d2e24] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold bg-[#281d16] text-amber-300 border border-amber-600/50 uppercase tracking-wider">
              Proprietor Ledger Desk
            </span>
          </div>
          <h1 className="text-3xl font-serif-vintage font-bold text-[#fef3c7] tracking-tight mt-1">
            Parlour Management Desk
          </h1>
        </div>

        <button
          onClick={handleOpenCreateShop}
          className="retro-btn-brass inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel tracking-wider uppercase shadow-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Parlour</span>
        </button>
      </div>

      {/* Select Salon Bar */}
      <div className="retro-card rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#4a3828]">
        <div className="flex items-center gap-3">
          <Store className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider">Active Parlour:</span>
          {shops.length === 0 ? (
            <span className="text-xs text-[#a39485]">No parlours registered. Click 'Register New Parlour'.</span>
          ) : (
            <select
              value={selectedShop?.id || ''}
              onChange={(e) => {
                const s = shops.find((x) => x.id === parseInt(e.target.value));
                setSelectedShop(s);
              }}
              className="bg-[#14100d] border border-[#574132] text-[#fdf6e2] text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 font-serif-vintage"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#14100d] text-[#fdf6e2]">
                  {s.name} ({s.address})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedShop && (
          <div className="flex gap-2">
            <button
              onClick={handleOpenEditShop}
              className="px-3 py-1.5 bg-[#1c1612] hover:bg-[#281f19] text-[#dcd0c0] rounded-xl text-xs font-cinzel border border-[#4a3828] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => setSlotModalOpen(true)}
              className="retro-btn-brass px-3 py-1.5 rounded-xl text-xs font-cinzel tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-stone-900" />
              <span>Generate Slots</span>
            </button>
          </div>
        )}
      </div>

      {selectedShop && (
        <div>
          {/* Dashboard Tabs */}
          <div className="flex gap-2 border-b border-[#3d2e24] pb-3 mb-6">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-cinzel tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'retro-btn-brass font-bold'
                  : 'bg-[#18130f] text-[#a39485] hover:text-[#fef3c7] border border-[#3d2e24]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointment Ledger ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-cinzel tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'services'
                  ? 'retro-btn-brass font-bold'
                  : 'bg-[#18130f] text-[#a39485] hover:text-[#fef3c7] border border-[#3d2e24]'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Service Tariff Menu ({services.length})</span>
            </button>
          </div>

          {/* TAB 1: CUSTOMER BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">Appointments for {selectedShop.name}</h3>
                <button
                  onClick={() => fetchShopBookings(selectedShop.id)}
                  className="text-xs font-cinzel text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Ledger
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="p-12 text-center bg-[#18130f] border-2 border-dashed border-[#4a3828] rounded-2xl">
                  <Calendar className="w-10 h-10 text-amber-500/40 mx-auto mb-2" />
                  <p className="text-sm font-serif-vintage font-bold text-[#fef3c7]">No customer passes in ledger</p>
                  <p className="text-xs text-[#a39485] mt-1">Incoming bookings from patrons will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto retro-card rounded-2xl border border-[#4a3828] shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#14100d] text-amber-300 font-cinzel uppercase tracking-wider border-b border-[#3d2e24]">
                      <tr>
                        <th className="p-4">Pass ID</th>
                        <th className="p-4">Patron</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Date & Slot</th>
                        <th className="p-4">Fee & Status</th>
                        <th className="p-4">Pass Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2019] text-[#dcd0c0]">
                      {bookings.map(({ booking, transaction }) => (
                        <tr key={booking.id} className="hover:bg-[#201813] transition">
                          <td className="p-4 font-retro-mono font-bold text-[#fef3c7]">#BK-{booking.id}</td>
                          <td className="p-4 font-medium text-[#fef3c7]">
                            {booking.customer?.name}
                            <span className="block text-[11px] text-[#a39485] font-retro-mono">{booking.customer?.email}</span>
                          </td>
                          <td className="p-4 font-serif-vintage text-amber-300 font-bold">{booking.service?.name}</td>
                          <td className="p-4">
                            <div className="font-retro-mono text-[#fef3c7]">{booking.slot?.date}</div>
                            <div className="text-[11px] font-retro-mono text-[#a39485]">
                              {booking.slot?.startTime?.slice(0, 5)} - {booking.slot?.endTime?.slice(0, 5)}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-serif-vintage font-bold text-[#fef3c7]">₹{booking.service?.price}</span>
                            <span className="block text-[11px] font-retro-mono text-emerald-400">
                              {transaction?.paymentStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-cinzel font-bold tracking-wider ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/50'
                                : booking.status === 'COMPLETED'
                                ? 'bg-[#281e16] text-amber-300 border border-amber-600/50'
                                : booking.status === 'CANCELLED'
                                ? 'bg-red-950/70 text-red-300 border border-red-800/50'
                                : 'bg-amber-950/70 text-amber-300 border border-amber-600/50'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {booking.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirm')}
                                className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded text-[11px] font-cinzel border border-emerald-600/50 transition cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'complete')}
                                className="px-2.5 py-1 retro-btn-brass rounded text-[11px] font-cinzel tracking-wider uppercase transition cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancel')}
                                className="px-2.5 py-1 bg-red-950/40 hover:bg-red-950/80 text-red-300 rounded text-[11px] font-cinzel border border-red-800/50 transition cursor-pointer"
                              >
                                Void
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAGE SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">Services Menu for {selectedShop.name}</h3>
                <button
                  onClick={handleOpenCreateService}
                  className="retro-btn-brass inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-cinzel tracking-wider uppercase shadow transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Bespoke Service
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-5 retro-card rounded-2xl border border-[#4a3828] shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-serif-vintage font-bold text-[#fef3c7]">{svc.name}</h4>
                        <span className="text-base font-serif-vintage font-bold text-amber-400">₹{svc.price}</span>
                      </div>
                      <p className="text-xs text-[#a39485] mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500/60" />
                        <span className="font-retro-mono">Duration: {svc.duration} mins</span>
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#2e221a] flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditService(svc)}
                        className="p-2 bg-[#14100d] hover:bg-[#221a14] text-[#dcd0c0] rounded-lg text-xs border border-[#3d2e24] transition cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="p-2 bg-red-950/40 hover:bg-red-950/80 text-red-300 rounded-lg text-xs border border-red-800/50 transition cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: CREATE / EDIT SHOP */}
      {shopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191410] border-2 border-[#574132] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">
              {isEditingShop ? 'Edit Parlour Ledger' : 'Register New Parlour'}
            </h3>

            <form onSubmit={handleSaveShop} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Parlour Name</label>
                <input
                  type="text"
                  required
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  placeholder="e.g. Shelby Grooming Saloon"
                  className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Address & Locality</label>
                <textarea
                  required
                  rows={2}
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder="e.g. 42 Water Street, Garrison Lane"
                  className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Opening Time</label>
                  <input
                    type="time"
                    required
                    value={shopForm.openTime}
                    onChange={(e) => setShopForm({ ...shopForm, openTime: e.target.value })}
                    className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Closing Time</label>
                  <input
                    type="time"
                    required
                    value={shopForm.closeTime}
                    onChange={(e) => setShopForm({ ...shopForm, closeTime: e.target.value })}
                    className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShopModalOpen(false)}
                  className="px-4 py-2 bg-[#14100d] hover:bg-[#201813] text-[#a39485] font-cinzel rounded-xl border border-[#3d2e24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 retro-btn-brass font-cinzel tracking-wider uppercase rounded-xl shadow cursor-pointer font-bold"
                >
                  Save Parlour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT SERVICE */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191410] border-2 border-[#574132] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">
              {isEditingService ? 'Edit Service Tariff' : 'Add New Service Tariff'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. Classic Beard Sculpting & Hot Towel"
                  className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Tariff Fee (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="450.00"
                    className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 bg-[#14100d] hover:bg-[#201813] text-[#a39485] font-cinzel rounded-xl border border-[#3d2e24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 retro-btn-brass font-cinzel tracking-wider uppercase rounded-xl shadow cursor-pointer font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BATCH SLOTS GENERATOR */}
      {slotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191410] border-2 border-[#574132] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">Generate Ledger Time Slots</h3>
            <p className="text-xs text-[#a39485]">
              Generates consecutive appointment slots for {selectedShop?.name}.
            </p>

            <form onSubmit={handleGenerateBatchSlots} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Schedule Date</label>
                <input
                  type="date"
                  required
                  value={slotForm.date}
                  onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                  className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Start Time</label>
                  <input
                    type="time"
                    required
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">End Time</label>
                  <input
                    type="time"
                    required
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-1.5">Interval Duration (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  required
                  value={slotForm.slotDurationMinutes}
                  onChange={(e) => setSlotForm({ ...slotForm, slotDurationMinutes: parseInt(e.target.value) })}
                  className="w-full p-2.5 bg-[#120e0b] border border-[#4a3828] rounded-xl text-[#fdf6e2] focus:outline-none focus:border-amber-500 font-retro-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSlotModalOpen(false)}
                  className="px-4 py-2 bg-[#14100d] hover:bg-[#201813] text-[#a39485] font-cinzel rounded-xl border border-[#3d2e24] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 retro-btn-brass font-cinzel tracking-wider uppercase rounded-xl shadow cursor-pointer font-bold"
                >
                  Record Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboard;
