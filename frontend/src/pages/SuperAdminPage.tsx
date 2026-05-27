import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superadmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, CheckCircle, XCircle, Building2, Users,
  TrendingUp, MapPin, Phone, Mail, Globe, Package,
  Clock, DollarSign, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

type Section = 'pending' | 'companies' | 'stats';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Faol',        cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  pending:  { label: 'Kutilmoqda',  cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  rejected: { label: 'Rad etilgan', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  inactive: { label: 'Nofaol',      cls: 'bg-slate-700/50 text-slate-400 border-slate-600' },
};

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <span className="text-xl font-black text-white">SuperAdmin Panel</span>
              <span className="ml-3 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                {user?.email}
              </span>
            </div>
          </div>
          <button onClick={logout}
            className="text-slate-400 hover:text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all">
            Chiqish
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {([
            ['pending',   'Kutilayotganlar', CheckCircle],
            ['companies', 'Barcha kompaniyalar', Building2],
            ['stats',     'Statistika', TrendingUp],
          ] as [Section, string, any][]).map(([s, label, Icon]) => (
            <button key={s} onClick={() => setSection(s)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                section === s
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {section === 'pending'   && <PendingSection />}
        {section === 'companies' && <CompaniesSection />}
        {section === 'stats'     && <StatsSection />}
      </div>
    </div>
  );
}

/* ─── Pending Companies ─────────────────────────────────────────────────── */
function PendingSection() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await superadmin.pendingCompanies();
      setList(Array.isArray(r) ? r : r?.items || []);
    } catch { setList([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setActing(id);
    try { await superadmin.approve(id); load(); }
    catch (err: any) { alert(err.message); }
    setActing(null);
  };

  const doReject = async () => {
    if (!rejectId || !reason.trim()) return;
    setActing(rejectId);
    try { await superadmin.reject(rejectId, reason); setRejectId(null); setReason(''); load(); }
    catch (err: any) { alert(err.message); }
    setActing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white">
          Tasdiqlash kutayotganlar
          {list.length > 0 && (
            <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-sm px-2 py-0.5 rounded-full">{list.length}</span>
          )}
        </h2>
        <button onClick={load} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-slate-400 hover:text-white">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
          <CheckCircle size={48} className="mx-auto mb-4 text-green-400 opacity-50" />
          <p className="text-white font-black text-lg mb-1">Hammasi tartibda</p>
          <p className="text-slate-500">Tasdiqlash kutayotgan kompaniya yo'q</p>
        </div>
      ) : (
        list.map(c => (
          <div key={c.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Company name & type */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center font-black text-blue-400 text-lg shrink-0">
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl">{c.name}</h3>
                    {c.business_type && (
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{c.business_type}</span>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Mail size={14} className="text-slate-500 shrink-0" /> {c.email}
                  </span>
                  {c.phone && (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Phone size={14} className="text-slate-500 shrink-0" /> {c.phone}
                    </span>
                  )}
                  {c.address && (
                    <span className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} className="text-slate-500 shrink-0" /> {c.address}
                    </span>
                  )}
                </div>

                {/* Admin info */}
                {c.admin && (
                  <div className="bg-slate-950 rounded-xl px-4 py-3 border border-slate-800 text-sm">
                    <p className="text-slate-500 text-xs font-bold mb-1">ADMIN</p>
                    <p className="text-white font-bold">{c.admin.full_name}</p>
                    <p className="text-slate-400">{c.admin.email} • {c.admin.phone}</p>
                  </div>
                )}

                {c.created_at && (
                  <p className="text-slate-600 text-xs">
                    Ro'yxat: {new Date(c.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button onClick={() => approve(c.id)} disabled={acting === c.id}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-600/20">
                  <CheckCircle size={16} /> {acting === c.id ? '...' : 'Tasdiqlash'}
                </button>
                <button onClick={() => setRejectId(c.id)}
                  className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                  <XCircle size={16} /> Rad etish
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 w-full max-w-md">
            <h3 className="text-xl font-black text-white mb-2">Rad etish sababi</h3>
            <p className="text-slate-400 text-sm mb-4">Bu sabab kompaniya adminiga yuboriladi</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Masalan: Hujjatlar to'liq emas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 resize-none mb-4 placeholder-slate-600" />
            <div className="flex gap-3">
              <button onClick={() => setRejectId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all">Bekor</button>
              <button onClick={doReject} disabled={!reason.trim() || acting !== null}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded-xl font-bold transition-all">
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── All Companies ─────────────────────────────────────────────────────── */
function CompaniesSection() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await superadmin.allCompanies(statusFilter || undefined);
      setList(Array.isArray(r) ? r : r?.items || []);
    } catch { setList([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-white">
          Barcha kompaniyalar
          <span className="text-slate-500 font-normal text-base ml-2">({list.length} ta)</span>
        </h2>
        <div className="flex gap-2 flex-wrap">
          {[['', 'Barchasi'], ['active', 'Faol'], ['pending', 'Kutilmoqda'], ['rejected', 'Rad etilgan']].map(([v, label]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border ${
                statusFilter === v
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold">Kompaniyalar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(c => {
            const s = STATUS_MAP[c.status] || { label: c.status, cls: 'bg-slate-800 text-slate-400 border-slate-700' };
            const isOpen = expanded === c.id;
            return (
              <div key={c.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
                {/* Header row */}
                <div className="p-5 flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : c.id)}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-blue-400 text-lg shrink-0">
                      {(c.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-black truncate">{c.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                        {c.business_type && (
                          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{c.business_type}</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm truncate">{c.email} {c.phone && `• ${c.phone}`}</p>
                    </div>
                  </div>

                  {/* Stats chips */}
                  <div className="hidden md:flex items-center gap-3 shrink-0">
                    {c.tours_count !== undefined && (
                      <div className="text-center">
                        <p className="text-white font-black">{c.tours_count}</p>
                        <p className="text-slate-500 text-xs">tur</p>
                      </div>
                    )}
                    {c.bookings_count !== undefined && (
                      <div className="text-center">
                        <p className="text-white font-black">{c.bookings_count}</p>
                        <p className="text-slate-500 text-xs">buyurtma</p>
                      </div>
                    )}
                    {c.total_revenue !== undefined && (
                      <div className="text-center">
                        <p className="text-green-400 font-black">{new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(c.total_revenue)}</p>
                        <p className="text-slate-500 text-xs">so'm</p>
                      </div>
                    )}
                  </div>

                  <div className="text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t border-slate-800 p-5 bg-slate-950/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Contact */}
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Aloqa</p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail size={14} className="text-slate-500" /> {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Phone size={14} className="text-slate-500" /> {c.phone}
                          </div>
                        )}
                        {c.address && (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <MapPin size={14} className="text-slate-500" /> {c.address}
                          </div>
                        )}
                        {c.website && (
                          <div className="flex items-center gap-2 text-sm text-blue-400">
                            <Globe size={14} /> {c.website}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Statistika</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-800">
                            <p className="text-2xl font-black text-blue-400">{c.tours_count ?? 0}</p>
                            <p className="text-slate-500 text-xs">Turlar</p>
                          </div>
                          <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-800">
                            <p className="text-2xl font-black text-purple-400">{c.bookings_count ?? 0}</p>
                            <p className="text-slate-500 text-xs">Buyurtmalar</p>
                          </div>
                          <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-800">
                            <p className="text-2xl font-black text-yellow-400">{c.users_count ?? 0}</p>
                            <p className="text-slate-500 text-xs">Foydalanuvchilar</p>
                          </div>
                          <div className="bg-slate-900 rounded-xl p-3 text-center border border-slate-800">
                            <p className="text-xl font-black text-green-400">
                              {c.total_revenue ? new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(c.total_revenue) : '0'}
                            </p>
                            <p className="text-slate-500 text-xs">Daromad</p>
                          </div>
                        </div>
                      </div>

                      {/* Admin & dates */}
                      <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Admin & Sana</p>
                        {c.admin && (
                          <div className="bg-slate-900 rounded-xl px-4 py-3 border border-slate-800">
                            <p className="text-slate-500 text-xs mb-1">Admin</p>
                            <p className="text-white font-bold text-sm">{c.admin.full_name || c.admin.email}</p>
                            <p className="text-slate-400 text-xs">{c.admin.email}</p>
                          </div>
                        )}
                        {c.created_at && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock size={14} className="text-slate-500" />
                            Ro'yxat: {new Date(c.created_at).toLocaleDateString('uz-UZ')}
                          </div>
                        )}
                        {c.approved_at && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle size={14} />
                            Tasdiqlangan: {new Date(c.approved_at).toLocaleDateString('uz-UZ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Platform Stats ────────────────────────────────────────────────────── */
function StatsSection() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadmin.stats()
      .then(s => { setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}
    </div>
  );

  if (!stats) return (
    <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
      <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
      <p className="font-bold">Ma'lumot yuklanmadi</p>
      <p className="text-sm">API ga ulanishni tekshiring</p>
    </div>
  );

  const cards = [
    { label: 'Jami kompaniyalar', value: stats.total_companies ?? stats.companies_count ?? '—', icon: Building2, color: 'text-blue-400', bg: 'from-blue-500/10' },
    { label: 'Faol kompaniyalar', value: stats.active_companies ?? stats.approved_companies ?? '—', icon: CheckCircle, color: 'text-green-400', bg: 'from-green-500/10' },
    { label: 'Kutilayotganlar',   value: stats.pending_companies ?? '—', icon: Clock, color: 'text-yellow-400', bg: 'from-yellow-500/10' },
    { label: 'Jami foydalanuvchilar', value: stats.total_users ?? stats.users_count ?? '—', icon: Users, color: 'text-purple-400', bg: 'from-purple-500/10' },
    { label: 'Jami turlar',       value: stats.total_tours ?? stats.tours_count ?? '—', icon: Package, color: 'text-cyan-400', bg: 'from-cyan-500/10' },
    { label: 'Jami buyurtmalar',  value: stats.total_bookings ?? stats.bookings_count ?? '—', icon: Clock, color: 'text-orange-400', bg: 'from-orange-500/10' },
    { label: 'Jami daromad',
      value: stats.total_revenue ? new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(stats.total_revenue) + ' so\'m' : '—',
      icon: DollarSign, color: 'text-green-400', bg: 'from-green-500/10' },
    { label: 'Tasdiqlangan buyurtmalar', value: stats.confirmed_bookings ?? '—', icon: CheckCircle, color: 'text-teal-400', bg: 'from-teal-500/10' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-white">Platforma statistikasi</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.bg} to-transparent bg-slate-900 rounded-2xl border border-slate-800 p-5`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm font-bold leading-tight">{s.label}</p>
              <div className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
