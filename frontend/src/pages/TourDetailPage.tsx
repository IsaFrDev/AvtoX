import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tours, bookings, reviews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, Users, Clock, ArrowLeft, Star, Send, Globe } from 'lucide-react';

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tour, setTour] = useState<any>(null);
  const [tourReviews, setTourReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [t, r] = await Promise.all([
          tours.get(id),
          reviews.forTour(id).catch(() => []),
        ]);
        setTour(t);
        setTourReviews(Array.isArray(r) ? r : []);
      } catch { }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    setBooking(true); setError('');
    try {
      await bookings.create(id!, guests, notes || undefined);
      setBooked(true);
    } catch (e: any) {
      setError(e.message || 'Buyurtma berishda xato');
    }
    setBooking(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl font-bold">Yuklanmoqda...</div>
  );
  if (!tour) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl font-bold">Tur topilmadi</div>
  );

  const total = tour.price * guests;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
            <ArrowLeft size={18} /> Orqaga
          </Link>
          <span className="text-2xl font-black text-white">Savdo<span className="text-blue-500">gar</span></span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: tour info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative h-72 md:h-96 rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800">
              {tour.image_url ? (
                <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Globe size={64} className="text-slate-700" />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-blue-600 text-white font-black px-4 py-2 rounded-full">
                {tour.duration_days} kun
              </div>
            </div>

            {/* Title & meta */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{tour.title}</h1>
              <div className="flex flex-wrap gap-4 text-slate-400">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-400" />{tour.city}, {tour.country}</span>
                <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-400" />
                  {new Date(tour.start_date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-blue-400" />{tour.duration_days} kun</span>
                <span className="flex items-center gap-2"><Users size={16} className="text-green-400" />{tour.available_slots} joy mavjud</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-xl font-black text-white mb-3">Tur haqida</h2>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line">{tour.description}</p>
            </div>

            {/* Reviews */}
            {tourReviews.length > 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" /> Izohlar ({tourReviews.length})
                </h2>
                <div className="space-y-4">
                  {tourReviews.map((r: any, i: number) => (
                    <div key={i} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array(5).fill(0).map((_, s) => (
                            <Star key={s} size={14} className={s < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                          ))}
                        </div>
                        <span className="text-slate-400 text-sm">{r.user_name || 'Mijoz'}</span>
                      </div>
                      <p className="text-slate-300 text-sm">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-900 rounded-[2rem] border border-slate-800 p-6 shadow-2xl">
              <div className="mb-6">
                <p className="text-4xl font-black text-blue-400">{new Intl.NumberFormat('uz-UZ').format(tour.price)}</p>
                <p className="text-slate-500 text-sm">so'm / kishi</p>
              </div>

              {booked ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={28} className="text-white" />
                  </div>
                  <p className="text-white font-black text-xl mb-2">Buyurtma qabul qilindi!</p>
                  <p className="text-slate-400 text-sm mb-6">Buyurtmalaringizni kuzatib boring</p>
                  <Link to="/dashboard" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-center transition-all">
                    Buyurtmalarimga o'tish
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-slate-400 text-sm font-bold mb-2 block">Mehmonlar soni</label>
                      <div className="flex items-center gap-3 bg-slate-950 rounded-xl border border-slate-800 p-3">
                        <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg transition-all">−</button>
                        <span className="flex-1 text-center font-black text-xl text-white">{guests}</span>
                        <button onClick={() => setGuests(g => Math.min(tour.available_slots, g + 1))}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-lg transition-all">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm font-bold mb-2 block">Izoh (ixtiyoriy)</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Qo'shimcha xohishlar..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none h-20 text-sm" />
                    </div>
                  </div>

                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-4">
                    <div className="flex justify-between text-slate-400 text-sm mb-2">
                      <span>{new Intl.NumberFormat('uz-UZ').format(tour.price)} × {guests} kishi</span>
                    </div>
                    <div className="flex justify-between font-black text-white text-xl">
                      <span>Jami</span>
                      <span className="text-blue-400">{new Intl.NumberFormat('uz-UZ').format(total)}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">so'm</p>
                  </div>

                  {error && <p className="text-red-400 text-sm mb-4 font-bold">{error}</p>}

                  <button onClick={handleBook} disabled={booking || tour.available_slots === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-lg">
                    {booking ? 'Yuklanmoqda...' : tour.available_slots === 0 ? 'Joy yo\'q' : user ? 'Buyurtma berish' : 'Kirish va buyurtma berish'}
                  </button>

                  {!user && (
                    <p className="text-slate-500 text-xs text-center mt-3">Buyurtma berish uchun tizimga kiring</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
