import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superadmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Building2, Users, TrendingUp } from 'lucide-react';

type Section = 'pending' | 'companies' | 'stats';

export default function SuperAdminPage() {
  const { logout } = useAuth();
  const [section, setSection] = useState<Section>('pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors"><ArrowLeft size={18} /></Link>
            <span className="text-xl font-black text-white">SuperAdmin</span>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm font-bold px-3 py-2 rounded-xl hover:bg-slate-800">Chiqish</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {([['pending', 'Kutilayotganlar', CheckCircle], ['companies', 'Kompaniyalar', Building2], ['stats', 'Statistika', TrendingUp]] as [Section, string, any][]).map(([s, label, Icon]) => (
            <button key={s} onClick={() => setSection(s)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${section === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {section === 'pending' && <PendingSection />}
        {section === 'companies' && <CompaniesSection />}
        {section === 'stats' && <StatsSection />}
      </div>
    </div>
  );
}

function PendingSection() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await superadmin.pendingCompanies(); setList(Array.isArray(r) ? r : []); } catch { setList([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    try { await superadmin.approve(id); load(); } catch (err: any) { alert(err.message); }
  };

  const reject = async () => {
    if (!rejectId || !reason.trim()) return;
    try { await superadmin.reject(rejectId, reason); setRejectId(null); setReason(''); load(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white">Tasdiqlash kutayotgan kompaniyalar ({list.length})</h2>
      {loading ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}</div>
        : list.length === 0 ? <div className="text-center py-16 text-slate-500"><CheckCircle size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">Barcha kompaniyalar tasdiqlangan</p></div>
        : list.map(c => (
          <div key={c.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-white font-black text-lg">{c.name}</p>
              <p className="text-slate-400 text-sm">{c.email} • {c.phone}</p>
              {c.address && <p className="text-slate-500 text-sm">{c.address}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => approve(c.id)} className="flex items-center gap-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                <CheckCircle size={15} /> Tasdiqlash
              </button>
              <button onClick={() => setRejectId(c.id)} className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold text-sm transition-all">
                <XCircle size={15} /> Rad etish
              </button>
            </div>
          </div>
        ))
      }
      {rejectId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 w-full max-w-md">
            <h3 className="text-xl font-black text-white mb-4">Rad etish sababi</h3>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Sabab kiriting..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRejectId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all">Bekor</button>
              <button onClick={reject} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold transition-all">Rad etish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompaniesSection() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadmin.allCompanies().then(r => { setList(Array.isArray(r) ? r : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-white">Barcha kompaniyalar ({list.length})</h2>
      {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}</div>
        : list.map(c => (
          <div key={c.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">{c.name}</p>
              <p className="text-slate-400 text-sm">{c.email}</p>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${
              c.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              c.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>{c.status}</span>
          </div>
        ))
      }
    </div>
  );
}

function StatsSection() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    superadmin.stats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-slate-500 text-center py-16 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-white">Platforma statistikasi</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami kompaniyalar', value: stats.total_companies ?? '—', icon: Building2, color: 'text-blue-400' },
          { label: 'Faol kompaniyalar', value: stats.active_companies ?? '—', icon: CheckCircle, color: 'text-green-400' },
          { label: 'Jami foydalanuvchilar', value: stats.total_users ?? '—', icon: Users, color: 'text-purple-400' },
          { label: 'Jami buyurtmalar', value: stats.total_bookings ?? '—', icon: TrendingUp, color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-sm font-bold">{s.label}</p>
              <s.icon size={20} className={s.color} />
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
