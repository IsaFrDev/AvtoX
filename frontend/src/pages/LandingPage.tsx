import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tours } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Calendar, Users, LogIn, User, Settings, ChevronRight, Globe } from 'lucide-react';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tourList, setTourList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [minPrice] = useState('');
  const [maxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 12;

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tours.list({
        page, page_size: PAGE_SIZE,
        ...(search && { search }),
        ...(city && { city }),
        ...(minPrice && { min_price: Number(minPrice) }),
        ...(maxPrice && { max_price: Number(maxPrice) }),
      });
      setTourList(res.items || res.data || []);
      setTotal(res.total || 0);
    } catch { setTourList([]); }
    setLoading(false);
  };

  useEffect(() => { fetchTours(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchTours(); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-white tracking-tight">
            Savdo<span className="text-blue-500">gar</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-slate-400 text-sm hidden sm:block">{user.full_name || user.email}</span>
                {(user.role === 'company_admin' || user.role === 'superadmin') && (
                  <button onClick={() => navigate(user.role === 'superadmin' ? '/superadmin' : '/admin')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                    <Settings size={16} /> Panel
                  </button>
                )}
                <button onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                  <User size={16} /> Buyurtmalarim
                </button>
                <button onClick={logout} className="text-slate-400 hover:text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-slate-800 transition-all">
                  Chiqish
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                <LogIn size={16} /> Kirish
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm font-bold mb-6">
            <Globe size={16} /> Eng yaxshi sayohat agentliklari
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Orzuyingizdagi<br /><span className="text-blue-500">sayohatlari</span> toping
          </h1>
          <p className="text-slate-400 text-xl mb-10">O'zbekistonning yetakchi sayohat platformasi</p>

          <form onSubmit={handleSearch} className="bg-slate-900 rounded-[2rem] p-4 border border-slate-800 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 bg-slate-950 rounded-xl px-4 py-3 border border-slate-800">
                <Search size={18} className="text-slate-500 shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tur nomini qidiring..."
                  className="bg-transparent outline-none w-full text-white placeholder-slate-500" />
              </div>
              <div className="flex items-center gap-3 bg-slate-950 rounded-xl px-4 py-3 border border-slate-800 md:w-40">
                <MapPin size={18} className="text-slate-500 shrink-0" />
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="Shahar"
                  className="bg-transparent outline-none w-full text-white placeholder-slate-500" />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 shrink-0">
                Qidirish
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tours grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white">
            {search || city ? 'Qidiruv natijalari' : 'Barcha turlar'}
            {total > 0 && <span className="text-slate-500 font-normal text-lg ml-2">({total} ta)</span>}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 animate-pulse h-80" />
            ))}
          </div>
        ) : tourList.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <Globe size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold">Turlar topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tourList.map(tour => <TourCard key={tour.id} tour={tour} />)}
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex justify-center gap-2 mt-12">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-bold transition-all">←</button>
            <span className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 font-bold">
              {page} / {Math.ceil(total / PAGE_SIZE)}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-bold transition-all">→</button>
          </div>
        )}
      </div>

      {!user && (
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-white mb-2">Sayohat agentligimizsiz?</h3>
              <p className="text-slate-400">Platformaga qo'shiling va turlaringizni ming'lab mijozlarga taqdim eting</p>
            </div>
            <Link to="/login?tab=company"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black text-white whitespace-nowrap transition-all shadow-lg shadow-blue-600/20">
              Ro'yxatdan o'tish <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function TourCard({ tour }: { tour: any }) {
  return (
    <Link to={`/tours/${tour.id}`} className="group bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-600 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-44 bg-slate-800 overflow-hidden">
        {tour.image_url ? (
          <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Globe size={40} className="text-slate-700" /></div>
        )}
        <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
          {tour.duration_days} kun
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-black text-white text-lg leading-tight mb-2 line-clamp-2">{tour.title}</h3>
        <div className="flex items-center gap-1 text-slate-400 text-sm mb-1">
          <MapPin size={13} /> <span>{tour.city}, {tour.country}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
          <Calendar size={13} /> <span>{new Date(tour.start_date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}</span>
          {tour.available_slots > 0 && (
            <span className="ml-auto flex items-center gap-1 text-green-400"><Users size={13} /> {tour.available_slots} joy</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-400 font-black text-xl">{new Intl.NumberFormat('uz-UZ').format(tour.price)}</p>
            <p className="text-slate-500 text-xs">so'm / kishi</p>
          </div>
          <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-sm font-bold">Batafsil →</span>
        </div>
      </div>
    </Link>
  );
}
