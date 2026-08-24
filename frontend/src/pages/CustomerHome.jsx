import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Scissors, MapPin, Clock, Star, ArrowRight, 
  Sparkles, Search, Award, ShieldCheck, CheckCircle2,
  ExternalLink, Calendar, Heart, ThumbsUp, MessageSquare
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Salons' },
  { id: 'top_rated', label: '★ Top Rated (4.8+)' },
  { id: 'indiranagar', label: 'Indiranagar & Lavelle Rd' },
  { id: 'koramangala', label: 'Koramangala & Jayanagar' },
  { id: 'barber', label: 'Barber & Shaves' },
  { id: 'spa', label: 'Spa & Wellness' },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rohan Mehta',
    role: 'Verified Customer',
    salon: 'Truefitt & Hill • Lavelle Road',
    avatar: 'RM',
    rating: 5,
    comment: 'Booked my Saturday hot towel shave in under 30 seconds. Arrived at the salon and walked straight to the chair—zero waiting line. Premium experience from start to finish.',
  },
  {
    id: 2,
    name: 'Ananya Sharma',
    role: 'Verified Customer',
    salon: 'Bounce Salon & Spa • Vittal Mallya Rd',
    avatar: 'AS',
    rating: 5,
    comment: 'The photo gallery and service prices were completely accurate. Got the Moroccanoil hair spa and the stylist was expecting me right at 2:00 PM. Highly recommended!',
  },
  {
    id: 3,
    name: 'Vikramaditya Roy',
    role: 'Verified Customer',
    salon: 'Toni & Guy • Indiranagar',
    avatar: 'VR',
    rating: 5,
    comment: 'Loved how easy it was to pick a precise time slot and pay seamlessly with Razorpay. Will definitely use this for all my regular grooming appointments.',
  },
];

const CustomerHome = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/shops');
      setShops(res.data);
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const query = (search || '').trim().toLowerCase();
    const name = (shop.name || '').toLowerCase();
    const address = (shop.address || '').toLowerCase();
    const tagline = (shop.tagline || '').toLowerCase();
    const ownerName = (shop.owner?.name || '').toLowerCase();

    const matchesSearch = !query || 
      name.includes(query) || 
      address.includes(query) || 
      tagline.includes(query) || 
      ownerName.includes(query);

    if (!matchesSearch) return false;

    if (activeCategory === 'top_rated') {
      return (shop.rating || 0) >= 4.8;
    }
    if (activeCategory === 'indiranagar') {
      return address.includes('indiranagar') || address.includes('lavelle') || address.includes('shanthala');
    }
    if (activeCategory === 'koramangala') {
      return address.includes('koramangala') || address.includes('jayanagar') || address.includes('nagar');
    }
    if (activeCategory === 'barber') {
      return name.includes('barber') || name.includes('men') || tagline.includes('shave') || tagline.includes('beard');
    }
    if (activeCategory === 'spa') {
      return name.includes('spa') || tagline.includes('spa') || tagline.includes('wellness') || tagline.includes('organic');
    }

    return true;
  });

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-14 pb-16 px-4 sm:px-6 lg:px-8 text-center border-b border-[#3d2e24] bg-[#14100d]">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#241a13] border border-amber-600/40 text-amber-300 text-xs font-cinzel tracking-widest uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Premium Salon & Barbershop Booking • Bengaluru & Mumbai</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif-vintage font-bold text-[#fef3c7] tracking-tight leading-tight">
            Book Appointments at <br />
            <span className="text-amber-500 italic">Top-Rated Salons & Spas</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#a39485] font-light leading-relaxed">
            Skip the waiting room. Choose your preferred stylist, view real service prices and photos, and reserve verified time slots with instant confirmation.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative flex items-center bg-[#191410] border-2 border-[#4a3828] rounded-2xl shadow-2xl px-4 py-2 focus-within:border-amber-500 transition">
              <Search className="w-5 h-5 text-amber-500/80 shrink-0" />
              <input
                type="text"
                placeholder="Search salons by name, area (e.g. Indiranagar), or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 px-3.5 py-2 text-[#fdf6e2] placeholder-[#7d6c5d] focus:outline-none text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-xs font-cinzel font-bold text-amber-400/90 hover:text-amber-200 px-3 py-1.5 bg-[#251c16] rounded-lg border border-amber-600/40 cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition cursor-pointer font-medium ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                      : 'bg-[#1a1410] text-[#c7b9a9] border-[#382b20] hover:border-amber-500/50 hover:text-[#fef3c7]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Core Value Props */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-3.5 p-4 bg-[#1a1410] border border-[#3d2e24] rounded-xl shadow-md">
              <div className="p-2.5 rounded-lg bg-[#271d17] border border-amber-600/30 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-cinzel font-bold text-[#fef3c7] uppercase tracking-wider">Zero Wait Time</p>
                <p className="text-[11px] text-[#a39485]">Direct confirmed slots reserved for you</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-[#1a1410] border border-[#3d2e24] rounded-xl shadow-md">
              <div className="p-2.5 rounded-lg bg-[#271d17] border border-amber-600/30 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-cinzel font-bold text-[#fef3c7] uppercase tracking-wider">Verified Salons</p>
                <p className="text-[11px] text-[#a39485]">Real Google Maps locations & ratings</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-[#1a1410] border border-[#3d2e24] rounded-xl shadow-md">
              <div className="p-2.5 rounded-lg bg-[#271d17] border border-amber-600/30 text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-cinzel font-bold text-[#fef3c7] uppercase tracking-wider">Secure Razorpay</p>
                <p className="text-[11px] text-[#a39485]">Instant refund on timely cancellation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Salons List Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[#3d2e24] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-serif-vintage font-bold text-[#fef3c7] tracking-tight">
                Explore Available Salons
              </h2>
            </div>
            <p className="text-xs text-[#a39485] mt-1">Browse verified salons, inspect real photography, check pricing, and select time slots</p>
          </div>
          <span className="text-xs font-retro-mono px-3.5 py-1.5 bg-[#1a1410] text-amber-300 rounded-lg border border-amber-700/50">
            {filteredShops.length} {filteredShops.length === 1 ? 'SALON' : 'SALONS'} FOUND
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-[#191410] rounded-2xl animate-pulse border border-[#3d2e24]"></div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-16 bg-[#18130f] border-2 border-dashed border-[#4a3828] rounded-2xl p-8 max-w-lg mx-auto">
            <Scissors className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
            <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">No Salons Match Your Search</h3>
            <p className="text-xs text-[#a39485] mt-1">Try clearing your filters or searching for a different area or salon brand.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="group relative retro-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl border border-[#4a3828] hover:border-amber-600/70"
              >
                {/* Salon Photo with Badge Overlay */}
                <div className="relative h-48 w-full overflow-hidden bg-[#16120e]">
                  <img
                    src={shop.imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'}
                    alt={shop.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14100d] via-transparent to-black/40"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-black/75 backdrop-blur-sm rounded-full text-[10px] font-retro-mono text-amber-300 border border-amber-600/50">
                      ID #{String(shop.id).padStart(3, '0')}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-stone-950 rounded-full text-xs font-bold shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{shop.rating || 4.8}</span>
                      <span className="text-[10px] opacity-80 font-normal">({shop.ratingCount || 120})</span>
                    </div>
                  </div>

                  {/* Google Maps link chip */}
                  {shop.googleMapsUrl && (
                    <a
                      href={shop.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1c1510]/90 backdrop-blur-md rounded-lg text-[10px] text-amber-300 hover:text-amber-200 border border-amber-600/40 hover:bg-[#281e17] transition shadow-md"
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                    </a>
                  )}
                </div>

                {/* Salon Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7] group-hover:text-amber-400 transition-colors leading-snug">
                      {shop.name}
                    </h3>
                    
                    {shop.tagline && (
                      <p className="text-xs text-amber-300/80 font-medium italic line-clamp-1">
                        {shop.tagline}
                      </p>
                    )}

                    <div className="flex items-start gap-2 text-xs text-[#a39485] pt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500/70 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{shop.address}</span>
                    </div>
                  </div>

                  {/* Operating Hours & Action */}
                  <div className="pt-3 border-t border-[#3d2e24] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#a39485] font-retro-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                      <span>{shop.openTime?.slice(0, 5)} - {shop.closeTime?.slice(0, 5)}</span>
                    </div>

                    <Link
                      to={`/shops/${shop.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md group-hover:shadow-amber-500/20"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#191410] border border-[#3d2e24] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-cinzel text-amber-400 font-bold uppercase tracking-widest">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage font-bold text-[#fef3c7]">
              How Salon Luxe Works
            </h2>
            <p className="text-xs sm:text-sm text-[#a39485]">
              Seamless salon booking designed to respect your schedule with confirmed appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#130f0c] border border-[#382b20] rounded-2xl space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-serif-vintage font-bold text-[#fef3c7] text-base">Select Your Salon & Service</h3>
              <p className="text-xs text-[#a39485] leading-relaxed">
                Browse authentic photos, ratings, and clear service pricing across our verified network.
              </p>
            </div>

            <div className="p-6 bg-[#130f0c] border border-[#382b20] rounded-2xl space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-serif-vintage font-bold text-[#fef3c7] text-base">Choose an Available Slot</h3>
              <p className="text-xs text-[#a39485] leading-relaxed">
                Pick an open time slot that fits your schedule with live real-time availability checks.
              </p>
            </div>

            <div className="p-6 bg-[#130f0c] border border-[#382b20] rounded-2xl space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-serif-vintage font-bold text-[#fef3c7] text-base">Walk In & Enjoy VIP Service</h3>
              <p className="text-xs text-[#a39485] leading-relaxed">
                Zero waiting in queue. Your stylist will be expecting you with your confirmed appointment pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-cinzel text-amber-400 font-bold uppercase tracking-widest">
            Verified Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-vintage font-bold text-[#fef3c7]">
            Loved by Discerning Patrons
          </h2>
          <p className="text-xs sm:text-sm text-[#a39485]">
            Real feedback from customers who book their haircuts, beard styling, and spa sessions through Salon Luxe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-6 bg-[#17120e] border border-[#3d2e24] rounded-2xl flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#dcd0c0] leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#33261c] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#fef3c7]">{t.name}</h4>
                  <p className="text-[10px] text-[#a39485]">{t.salon}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-gradient-to-r from-[#201712] via-[#281d16] to-[#201712] border border-amber-600/30 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-lg font-serif-vintage font-bold text-[#fef3c7]">
              Are You a Salon Owner or Independent Stylist?
            </h3>
            <p className="text-xs text-[#a39485]">
              Partner with Salon Luxe to manage appointment schedules, eliminate no-shows, and accept secure online payments.
            </p>
          </div>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition whitespace-nowrap"
          >
            Register Your Salon
          </Link>
        </div>
      </section>

    </div>
  );
};

export default CustomerHome;
