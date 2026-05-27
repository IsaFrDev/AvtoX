import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Calendar, Users, MapPin, Download, Globe } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Kutilmoqda', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  confirmed: { label: 'Tasdiqlangan', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label: 'Bekor qilindi', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed: { label: 'Yakunlandi', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await bookings.list({ page_size: 50, ...(statusFilter && { status: statusFilter }) });
      setList(res.items || res.data || []);
    } catch { setList([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const cancel = async (id: string) => {
    if (!confirm('Buyurtmani bekor qilmoqchimisiz?')) return;
    setCancelling(id);
    try {
      await bookings.updateStatus(id, 'cancelled', 'Mijoz tomonidan bekor qilindi');
      load();
    } catch { }
    setCancelling(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
              <ArrowLeft size={18} /> Bosh sahifa
            </Link>
            <span className="text-xl font-black text-white">Buyurtmalarim</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden sm:block">{user?.full_name || user?.email}</span>
            <button onClick={logout} className="text-slate-400 hover:text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-slate-800 transition-all">Chiqish</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[['', 'Barchasi'], ['pending', 'Kutilmoqda'], ['confirmed', 'Tasdiqlangan'], ['completed', 'Yakunlangan'], ['cancelled', 'Bekor']] .map(([v, label]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${statusFilter === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 h-32 animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-24">
            <Globe size={48} className="mx-auto mb-4 text-slate-700" />
            <p className="text-slate-400 text-xl font-bold mb-2">Buyurtmalar yo'q</p>
            <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold">Turlarni ko'rish →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(b => {
              const s = STATUS_LABELS[b.status] || { label: b.status, cls: 'bg-slate-800 text-slate-400 border-slate-700' };
              return (
                <div key={b.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-white font-black text-lg">{b.tour?.title || 'Tur'}</h3>
                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                        {b.tour?.city && (
                          <span className="flex items-center gap-1"><MapPin size={13} />{b.tour.city}</span>
                        )}
                        {b.tour?.start_date && (
                          <span className="flex items-center gap-1"><Calendar size={13} />
                            {new Date(b.tour.start_date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Users size={13} />{b.guests_count} kishi</span>
                        {b.total_price && (
                          <span className="flex items-center gap-1 text-blue-400 font-bold">
                            {new Intl.NumberFormat('uz-UZ').format(b.total_price)} so'm
                          </span>
                        )}
                      </div>
                      {b.notes && <p className="text-slate-500 text-sm mt-2 italic">"{b.notes}"</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {b.status === 'confirmed' && (
                        <a href={`https://savdogar-api-production.up.railway.app/api/bookings/${b.id}/voucher`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                          <Download size={15} /> Voucher
                        </a>
                      )}
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button onClick={() => cancel(b.id)} disabled={cancelling === b.id}
                          className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                          {cancelling === b.id ? '...' : 'Bekor qilish'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
