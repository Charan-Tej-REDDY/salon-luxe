import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Shield, Users, Store, Calendar, CreditCard, IndianRupee, 
  Trash2, RefreshCw, CheckCircle, Clock, XCircle, Sparkles, Filter, Award 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'shops', 'bookings', 'transactions'
  
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatsAndData();
  }, []);

  const fetchStatsAndData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, shopsRes, bookingsRes, transRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/shops'),
        api.get('/admin/bookings'),
        api.get('/admin/transactions'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setShops(shopsRes.data);
      setBookings(bookingsRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      fetchStatsAndData();
    } catch (err) {
      console.error(err);
      alert('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user from the guild?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchStatsAndData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
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
            <span className="px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold bg-[#281d16] text-amber-300 border border-amber-600/50 flex items-center gap-1 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Grand Guild Administration
            </span>
          </div>
          <h1 className="text-3xl font-serif-vintage font-bold text-[#fef3c7] tracking-tight mt-1">
            Platform Master Ledger
          </h1>
        </div>

        <button
          onClick={fetchStatsAndData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1c1612] hover:bg-[#281f19] text-[#dcd0c0] rounded-xl text-xs font-cinzel tracking-wider border border-[#4a3828] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="p-5 retro-card rounded-2xl border border-[#4a3828] shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-cinzel font-bold text-[#a39485] uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 bg-[#271d16] border border-amber-600/40 text-amber-400 rounded-xl">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif-vintage font-bold text-amber-400 mt-2">₹{stats.totalRevenue}</p>
            <p className="text-[10px] font-retro-mono text-[#8c7c6d] mt-1">From authenticated passes</p>
          </div>

          <div className="p-5 retro-card rounded-2xl border border-[#4a3828] shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-cinzel font-bold text-[#a39485] uppercase tracking-wider">Passes Issued</span>
              <div className="p-2 bg-[#271d16] border border-amber-600/40 text-amber-400 rounded-xl">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif-vintage font-bold text-[#fef3c7] mt-2">{stats.totalBookings}</p>
            <p className="text-[10px] font-retro-mono text-[#8c7c6d] mt-1">{stats.totalConfirmedBookings} confirmed / completed</p>
          </div>

          <div className="p-5 retro-card rounded-2xl border border-[#4a3828] shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-cinzel font-bold text-[#a39485] uppercase tracking-wider">Registered Parlours</span>
              <div className="p-2 bg-[#271d16] border border-amber-600/40 text-amber-400 rounded-xl">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif-vintage font-bold text-[#fef3c7] mt-2">{stats.totalShops}</p>
            <p className="text-[10px] font-retro-mono text-[#8c7c6d] mt-1">Managed by {stats.totalOwners} proprietors</p>
          </div>

          <div className="p-5 retro-card rounded-2xl border border-[#4a3828] shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-cinzel font-bold text-[#a39485] uppercase tracking-wider">Guild Members</span>
              <div className="p-2 bg-[#271d16] border border-amber-600/40 text-amber-400 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif-vintage font-bold text-[#fef3c7] mt-2">{stats.totalUsers}</p>
            <p className="text-[10px] font-retro-mono text-[#8c7c6d] mt-1">{stats.totalCustomers} patrons, {stats.totalOwners} owners</p>
          </div>

        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#3d2e24] pb-3 mb-6 overflow-x-auto">
        {[
          { id: 'users', label: `Guild Members (${users.length})`, icon: Users },
          { id: 'shops', label: `Parlours (${shops.length})`, icon: Store },
          { id: 'bookings', label: `Master Passes (${bookings.length})`, icon: Calendar },
          { id: 'transactions', label: `Audit Ledger (${transactions.length})`, icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-cinzel tracking-wider uppercase transition flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'retro-btn-brass font-bold'
                  : 'bg-[#18130f] text-[#a39485] hover:text-[#fef3c7] border border-[#3d2e24]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS TABLE */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto retro-card rounded-2xl border border-[#4a3828] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14100d] text-amber-300 font-cinzel uppercase tracking-wider border-b border-[#3d2e24]">
              <tr>
                <th className="p-4">Member ID</th>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Guild Standing</th>
                <th className="p-4">Assign Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2019] text-[#dcd0c0]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#201813] transition">
                  <td className="p-4 font-retro-mono font-bold text-[#fef3c7]">#{u.id}</td>
                  <td className="p-4">
                    <span className="font-semibold text-[#fef3c7] block">{u.name}</span>
                    <span className="text-[11px] font-retro-mono text-[#a39485]">{u.email}</span>
                  </td>
                  <td className="p-4 font-retro-mono text-[#a39485]">{u.createdAt?.slice(0, 10) || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold tracking-wider ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : u.role === 'OWNER'
                        ? 'bg-amber-600/25 text-amber-200 border border-amber-600/50'
                        : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="bg-[#120e0b] border border-[#4a3828] text-[#fdf6e2] text-xs font-cinzel rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
                    >
                      <option value="CUSTOMER" className="bg-[#14100d]">CUSTOMER</option>
                      <option value="OWNER" className="bg-[#14100d]">OWNER</option>
                      <option value="ADMIN" className="bg-[#14100d]">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-950/80 text-red-300 rounded-lg border border-red-800/50 transition cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SHOPS TABLE */}
      {activeTab === 'shops' && (
        <div className="overflow-x-auto retro-card rounded-2xl border border-[#4a3828] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14100d] text-amber-300 font-cinzel uppercase tracking-wider border-b border-[#3d2e24]">
              <tr>
                <th className="p-4">Parlour ID</th>
                <th className="p-4">Establishment Name</th>
                <th className="p-4">Address</th>
                <th className="p-4">Operating Hours</th>
                <th className="p-4">Proprietor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2019] text-[#dcd0c0]">
              {shops.map((s) => (
                <tr key={s.id} className="hover:bg-[#201813] transition">
                  <td className="p-4 font-retro-mono font-bold text-[#fef3c7]">#{s.id}</td>
                  <td className="p-4 font-serif-vintage font-bold text-[#fef3c7]">{s.name}</td>
                  <td className="p-4 text-[#a39485]">{s.address}</td>
                  <td className="p-4 font-retro-mono text-[#fef3c7]">
                    {s.openTime?.slice(0, 5)} - {s.closeTime?.slice(0, 5)}
                  </td>
                  <td className="p-4">
                    <span className="text-[#fef3c7] font-medium block">{s.owner?.name}</span>
                    <span className="text-[11px] font-retro-mono text-[#a39485]">{s.owner?.email}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BOOKINGS TABLE */}
      {activeTab === 'bookings' && (
        <div className="overflow-x-auto retro-card rounded-2xl border border-[#4a3828] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14100d] text-amber-300 font-cinzel uppercase tracking-wider border-b border-[#3d2e24]">
              <tr>
                <th className="p-4">Pass ID</th>
                <th className="p-4">Patron</th>
                <th className="p-4">Parlour</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date & Slot</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2019] text-[#dcd0c0]">
              {bookings.map(({ booking, transaction }) => (
                <tr key={booking.id} className="hover:bg-[#201813] transition">
                  <td className="p-4 font-retro-mono font-bold text-[#fef3c7]">#BK-{booking.id}</td>
                  <td className="p-4">
                    <span className="font-semibold text-[#fef3c7] block">{booking.customer?.name}</span>
                    <span className="text-[11px] font-retro-mono text-[#a39485]">{booking.customer?.email}</span>
                  </td>
                  <td className="p-4 text-[#fef3c7] font-medium">{booking.shop?.name}</td>
                  <td className="p-4 font-serif-vintage text-amber-300 font-bold">{booking.service?.name} (₹{booking.service?.price})</td>
                  <td className="p-4">
                    <div className="font-retro-mono text-[#fef3c7]">{booking.slot?.date}</div>
                    <div className="text-[11px] font-retro-mono text-[#a39485]">
                      {booking.slot?.startTime?.slice(0, 5)} - {booking.slot?.endTime?.slice(0, 5)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold tracking-wider ${
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: TRANSACTIONS TABLE */}
      {activeTab === 'transactions' && (
        <div className="overflow-x-auto retro-card rounded-2xl border border-[#4a3828] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#14100d] text-amber-300 font-cinzel uppercase tracking-wider border-b border-[#3d2e24]">
              <tr>
                <th className="p-4">Audit TX</th>
                <th className="p-4">Pass Ref</th>
                <th className="p-4">Patron</th>
                <th className="p-4">Parlour</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2019] text-[#dcd0c0]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#201813] transition">
                  <td className="p-4 font-retro-mono font-bold text-[#fef3c7]">#TX-{t.id}</td>
                  <td className="p-4 font-retro-mono text-amber-400">#BK-{t.booking?.id}</td>
                  <td className="p-4">
                    <span className="font-semibold text-[#fef3c7] block">{t.booking?.customer?.name || 'Patron'}</span>
                    <span className="text-[11px] font-retro-mono text-[#a39485]">{t.booking?.customer?.email}</span>
                  </td>
                  <td className="p-4 font-medium text-[#fef3c7]">{t.booking?.shop?.name || 'Parlour'}</td>
                  <td className="p-4 font-serif-vintage font-bold text-amber-400">₹{t.amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-cinzel font-bold tracking-wider ${
                      t.paymentStatus === 'SUCCESS'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-600/50'
                        : t.paymentStatus === 'REFUNDED'
                        ? 'bg-amber-950/70 text-amber-300 border border-amber-600/50'
                        : 'bg-[#1c1612] text-[#a39485] border border-[#3d2e24]'
                    }`}>
                      {t.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 font-retro-mono text-[#a39485] text-[11px]">{t.razorpayOrderId || '—'}</td>
                  <td className="p-4 font-retro-mono text-[#a39485] text-[11px]">{t.razorpayPaymentId || '—'}</td>
                  <td className="p-4 font-retro-mono text-[#a39485]">{t.createdAt?.slice(0, 19).replace('T', ' ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

