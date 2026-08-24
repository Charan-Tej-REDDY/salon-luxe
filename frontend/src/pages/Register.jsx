import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Lock, Mail, User, ArrowRight, AlertCircle, Store, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await register(name, email, password, role);
      if (newUser.role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10 retro-card retro-corner-flourish p-8 sm:p-10 rounded-2xl border-2 border-[#574132] shadow-2xl">
        
        {/* Barber Pole Ribbon Accent */}
        <div className="h-1.5 w-full barber-pole-stripes rounded-full mb-6"></div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-full bg-[#2a1f18] border border-amber-600/40 text-amber-400 shadow-inner">
            <Scissors className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-cinzel text-amber-500/90 tracking-widest uppercase block font-semibold">
              Heritage Parlour & Guild
            </span>
            <h2 className="text-3xl font-serif-vintage text-[#fdf6e2] font-bold tracking-tight">
              Join Our Guild
            </h2>
            <p className="text-xs text-[#b8a898]">
              Create an account as a Patron or Parlour Proprietor
            </p>
          </div>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#14100d] border border-[#4a3828] rounded-xl my-6">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2 px-3 rounded-lg text-xs font-cinzel font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              role === 'CUSTOMER'
                ? 'retro-btn-brass'
                : 'text-[#a39485] hover:text-[#fdf6e2]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patron (Client)</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('OWNER')}
            className={`py-2 px-3 rounded-lg text-xs font-cinzel font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              role === 'OWNER'
                ? 'retro-btn-brass'
                : 'text-[#a39485] hover:text-[#fdf6e2]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Shop Owner</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-red-950/60 border border-red-800/80 rounded-xl p-3.5 flex items-start gap-3 text-red-200 text-xs shadow-inner">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500/60">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arthur Shelby"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14100d] border border-[#4a3828] rounded-xl text-[#fdf6e2] placeholder-[#7d6c5d] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500/60">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arthur@parlour.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14100d] border border-[#4a3828] rounded-xl text-[#fdf6e2] placeholder-[#7d6c5d] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-cinzel font-semibold text-amber-300 uppercase tracking-wider mb-2">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14100d] border border-[#4a3828] rounded-xl text-[#fdf6e2] placeholder-[#7d6c5d] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 retro-btn-brass rounded-xl flex items-center justify-center gap-2 group transition duration-200 disabled:opacity-50 text-sm cursor-pointer mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="font-cinzel tracking-wider uppercase">Complete Registration</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-stone-900" />
              </>
            )}
          </button>

          <div className="pt-4 text-center border-t border-[#3d2e24] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a39485]">
            <span>Already registered?</span>
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-500/50">
              Sign In Here
            </Link>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#2a2019] flex items-center justify-center gap-2 text-[11px] text-[#7d6c5d]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500/60" />
          <span>Handcrafted with High Grooming Standards</span>
        </div>

      </div>
    </div>
  );
};

export default Register;

