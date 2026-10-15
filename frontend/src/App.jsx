import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AiAssistant from './components/AiAssistant';

import CustomerHome from './pages/CustomerHome';
import ShopDetail from './pages/ShopDetail';
import CustomerBookings from './pages/CustomerBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#12100e] text-[#fdf6e2] flex flex-col selection:bg-amber-500 selection:text-stone-950">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<CustomerHome />} />
              <Route path="/shops/:id" element={<ShopDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
                <Route path="/my-bookings" element={<CustomerBookings />} />
              </Route>

              {/* Owner Routes */}
              <Route element={<ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} />}>
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Retro Footer */}
          <footer className="border-t border-[#3d2e24] bg-[#0c0a09] py-8 text-center text-xs text-[#a89887]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif-vintage font-bold text-amber-300 text-sm">Salon Luxe</span>
                <span className="text-amber-500/60">❖</span>
                <span className="font-cinzel text-[11px] uppercase tracking-wider">Traditional Barbering & Modern Parlour Appointments</span>
              </div>
              <p className="font-retro-mono text-[11px] text-[#7d6c5d]">
                ESTD • APPOINTMENT GUILD • ALL RIGHTS RESERVED
              </p>
            </div>
          </footer>

          {/* AI Appointment Assistant — floating chat widget */}
          <AiAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

