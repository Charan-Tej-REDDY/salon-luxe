import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, Store, Shield, LogOut, User, Scissors, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-cinzel px-2 py-0.5 rounded font-bold tracking-wider">
            ADMINISTRATOR
          </span>
        );
      case 'OWNER':
        return (
          <span className="bg-amber-600/25 text-amber-200 border border-amber-600/50 text-[10px] font-cinzel px-2 py-0.5 rounded font-bold tracking-wider">
            PROPRIETOR
          </span>
        );
      default:
        return (
          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 text-[10px] font-cinzel px-2 py-0.5 rounded font-bold tracking-wider">
            PATRON
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Barber Pole Top Accent Stripe */}
      <div className="h-1 w-full barber-pole-stripes"></div>

      <nav className="bg-[#15110e]/95 backdrop-blur-md border-b border-[#3d2e24] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3.5 group">
              <div className="w-11 h-11 rounded-xl bg-[#241b15] border border-amber-600/50 flex items-center justify-center shadow-lg group-hover:border-amber-400 group-hover:scale-105 transition-all duration-200">
                <Scissors className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-serif-vintage font-bold tracking-wide text-[#fef3c7]">
                    Salon Luxe
                  </span>
                  <span className="text-amber-500/80 text-xs">❖</span>
                </div>
                <span className="text-[10px] font-cinzel text-amber-400/90 tracking-widest uppercase font-semibold">
                  Heritage Barber & Spa
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/"
                className="text-[#dcd0c0] hover:text-[#fef3c7] px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold hover:bg-[#261e17] transition flex items-center gap-1.5 tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Salons</span>
              </Link>

              {user && user.role === 'CUSTOMER' && (
                <Link
                  to="/my-bookings"
                  className="text-[#dcd0c0] hover:text-[#fef3c7] px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold hover:bg-[#261e17] transition flex items-center gap-1.5 tracking-wider"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Passes</span>
                </Link>
              )}

              {user && (user.role === 'OWNER' || user.role === 'ADMIN') && (
                <Link
                  to="/owner/dashboard"
                  className="text-[#dcd0c0] hover:text-[#fef3c7] px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold hover:bg-[#261e17] transition flex items-center gap-1.5 tracking-wider"
                >
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Proprietor Desk</span>
                </Link>
              )}

              {user && user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="text-[#dcd0c0] hover:text-[#fef3c7] px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold hover:bg-[#261e17] transition flex items-center gap-1.5 tracking-wider"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Guild</span>
                </Link>
              )}

              {/* Auth Actions */}
              {user ? (
                <div className="flex items-center pl-3 space-x-3 border-l border-[#3d2e24]">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#fef3c7]">{user.name}</span>
                      {getRoleBadge(user.role)}
                    </div>
                    <span className="text-[11px] font-retro-mono text-[#a39485]">{user.email}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-lg text-[#a39485] hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer border border-transparent hover:border-red-900/40"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-2">
                  <Link
                    to="/login"
                    className="text-[#dcd0c0] hover:text-[#fef3c7] px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold hover:bg-[#261e17] transition tracking-wider"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="retro-btn-brass px-3.5 py-1.5 rounded-lg text-xs font-cinzel tracking-wider uppercase"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

