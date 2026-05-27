import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { tours, bookings, crm, reports } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit3, BarChart2, Users, Package, Globe, Image, TrendingUp, Clock, CheckCircle } from 'lucide-react';

type Section = 'dashboard' | 'tours' | 'bookings' | 'crm';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Kutilmoqda', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  confirmed: { label: 'Tasdiqlangan', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label: 'Bekor', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed: { label: 'Yakunlandi', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="text-2xl font-black text-white">Savdo<span className="text-blue-500">gar</span></Link>
          <p className="text-slate-500 text-xs mt-1 font-bold">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {([
            ['dashboard', 'Dashboard', BarChart2],
            ['tours', 'Turlar', Package],
            ['bookings', 'Buyurtmalar', Clock],
            ['crm', 'Mijozlar', Users],
          ] as [Section, string, any][]).map(([s, label, Icon]) => (
            <button key={s} onClick={() => setSection(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${section === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-slate-400 text-sm mb-2 font-bold truncate">{user?.email}</p>
          <button onClick={logout} className="w-full text-slate-400 hover:text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all text-left">
            Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex md:hidden">
        {([
          ['dashboard', 'Dashboard', BarChart2],
          ['tours', 'Turlar', Package],
          ['bookings', 'Buyurtmalar', Clock],
          ['crm', 'Mijozlar', Users],
        ] as [Section, string, any][]).map(([s, label, Icon]) => (
          <button key={s} onClick={() => setSection(s)}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-bold transition-all ${section === s ? 'text-blue-400' : 'text-slate-500'}`}>
            <Icon size={20} /> {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-6">
          {section === 'dashboard' && <DashboardSection />}
          {section === 'tours' && <ToursSection />}
          {section === 'bookings' && <BookingsSection />}
          {section === 'crm' && <CRMSection />}
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function DashboardSection() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    reports.dashboard().then(setStats).catch(() => {});
    reports.recentBookings().then(r => setRecent(Array.isArray(r) ? r.slice(0, 5) : [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">Dashboard</h1>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Jami savdo', value: stats.total_revenue ? new Intl.NumberFormat('uz-UZ').format(stats.total_revenue) + " so'm" : '—', icon: TrendingUp, color: 'text-green-400' },
            { label: 'Buyurtmalar', value: stats.total_bookings ?? '—', icon: Clock, color: 'text-blue-400' },
            { label: 'Tasdiqlangan', value: stats.confirmed_bookings ?? '—', icon: CheckCircle, color: 'text-green-400' },
            { label: 'Faol turlar', value: stats.active_tours ?? '—', icon: Package, color: 'text-purple-400' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-sm font-bold">{s.label}</p>
                <s.icon size={20} className={s.color} />
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
      {recent.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-black text-white mb-4">So'nggi buyurtmalar</h2>
          <div className="space-y-3">
            {recent.map((b: any) => {
              const s = STATUS_LABELS[b.status] || { label: b.status, cls: 'bg-slate-800 text-slate-400 border-slate-700' };
              return (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-white font-bold text-sm">{b.tour?.title || 'Tur'}</p>
                    <p className="text-slate-400 text-xs">{b.user?.full_name || 'Mijoz'} • {b.guests_count} kishi</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tours ───────────────────────────────────────────────────────────────────
function ToursSection() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', description: '', city: '', country: '', price: '', duration_days: '', start_date: '', end_date: '', available_slots: '' });
  const [saving, setSaving] = useState(false);
  const [imgId, setImgId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await tours.myTours(); setList(r.items || r.data || []); } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', city: '', country: '', price: '', duration_days: '', start_date: '', end_date: '', available_slots: '' }); setModal(true); };
  const openEdit = (t: any) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description || '', city: t.city, country: t.country, price: String(t.price), duration_days: String(t.duration_days), start_date: t.start_date?.slice(0, 10), end_date: t.end_date?.slice(0, 10), available_slots: String(t.available_slots) });
    setModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), duration_days: Number(form.duration_days), available_slots: Number(form.available_slots) };
      const saved = editing ? await tours.update(editing.id, payload) : await tours.create(payload as any);
      setImgId(saved.id);
      load(); setModal(false);
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm('Turni o\'chirmoqchimisiz?')) return;
    try { await tours.delete(id); load(); } catch (err: any) { alert(err.message); }
  };

  const uploadImg = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await tours.uploadImage(id, file); load(); } catch (err: any) { alert(err.message); }
  };

  const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Turlar</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
          <Plus size={18} /> Yangi tur
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-40 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><Package size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">Hali tur yo'q</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(t => (
            <div key={t.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
              <div className="relative h-36 bg-slate-800">
                {t.image_url ? <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Globe size={32} className="text-slate-700" /></div>}
                <button onClick={() => { setImgId(t.id); fileRef.current?.click(); }}
                  className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-all">
                  <Image size={14} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-black text-white mb-1">{t.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{t.city}, {t.country} • {t.duration_days} kun • {new Intl.NumberFormat('uz-UZ').format(t.price)} so'm</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-sm font-bold transition-all"><Edit3 size={14} /> Tahrirlash</button>
                  <button onClick={() => del(t.id)} className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-sm font-bold transition-all"><Trash2 size={14} /> O'chirish</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => imgId && uploadImg(e, imgId)} />

      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-white mb-6">{editing ? 'Turni tahrirlash' : 'Yangi tur'}</h2>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-slate-400 text-xs font-bold mb-1 block">Nomi</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className={inputCls} /></div>
                <div><label className="text-slate-400 text-xs font-bold mb-1 block">Shahar</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required className={inputCls} /></div>
                <div><label className="text-slate-400 text-xs font-bold mb-1 block">Mamlakat</label><input value={form.country} onChange={e => setForm({...form, country: e.target.value})} required className={inputCls} /></div>
                <div><label className="text-slate-400 text-xs font-bold mb-1 block">Narx (so'm)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className={inputCls} /></div>
                <div><label className="text-slate-400 text-xs font-bold mb-1 block">Davomiyligi (kun)</label><input type="number" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} required className={inputCls} /></div>
                <div><label className="text-slate-400 text-xs font-bold mb-1 block">Boshlanish</label><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required className={inputCls} /></div>
                <div><label className="text-slate-400 text-xs font-bold mb-1 block">Tugash</label><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required className={inputCls} /></div>
                <div className="col-span-2"><label className="text-slate-400 text-xs font-bold mb-1 block">Mavjud joylar</label><input type="number" value={form.available_slots} onChange={e => setForm({...form, available_slots: e.target.value})} required className={inputCls} /></div>
                <div className="col-span-2"><label className="text-slate-400 text-xs font-bold mb-1 block">Tavsif</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inputCls + ' resize-none'} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all">Bekor</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-bold transition-all">
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bookings ────────────────────────────────────────────────────────────────
function BookingsSection() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await bookings.list({ page_size: 100, ...(statusFilter && { status: statusFilter }) });
      setList(r.items || r.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try { await bookings.updateStatus(id, status); load(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">Buyurtmalar</h1>
      <div className="flex flex-wrap gap-2">
        {[['', 'Barchasi'], ['pending', 'Kutilmoqda'], ['confirmed', 'Tasdiqlangan'], ['completed', 'Yakunlangan'], ['cancelled', 'Bekor']] .map(([v, label]) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${statusFilter === v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>
      {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}</div>
        : list.length === 0 ? <div className="text-center py-20 text-slate-500"><Clock size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">Buyurtmalar yo'q</p></div>
        : (
          <div className="space-y-3">
            {list.map(b => {
              const s = STATUS_LABELS[b.status] || { label: b.status, cls: 'bg-slate-800 text-slate-400 border-slate-700' };
              return (
                <div key={b.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-white font-bold">{b.tour?.title || 'Tur'}</p>
                      <span className={`text-xs font-black px-2 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{b.user?.full_name || 'Mijoz'} • {b.guests_count} kishi
                      {b.total_price && ` • ${new Intl.NumberFormat('uz-UZ').format(b.total_price)} so'm`}
                    </p>
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => updateStatus(b.id, 'confirmed')} className="bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-bold transition-all">Tasdiqlash</button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} className="bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold transition-all">Rad etish</button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')} className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0">Yakunlash</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

// ─── CRM ─────────────────────────────────────────────────────────────────────
function CRMSection() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    crm.customers().then(r => { setCustomers(Array.isArray(r) ? r : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const saveNote = async () => {
    if (!selected || !note.trim()) return;
    setSaving(true);
    try { await crm.addNote(selected.id, note); setSelected({ ...selected, note }); } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">Mijozlar (CRM)</h1>
      {loading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />)}</div>
        : customers.length === 0 ? <div className="text-center py-20 text-slate-500"><Users size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">Mijozlar yo'q</p></div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              {customers.map(c => (
                <div key={c.id} onClick={() => { setSelected(c); setNote(c.note || ''); }}
                  className={`bg-slate-900 rounded-2xl border p-4 cursor-pointer transition-all hover:border-slate-600 ${selected?.id === c.id ? 'border-blue-500' : 'border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center font-black text-blue-400">
                      {(c.full_name || c.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold">{c.full_name || '—'}</p>
                      <p className="text-slate-400 text-sm">{c.email} • {c.bookings_count || 0} buyurtma</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selected && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 h-fit">
                <h3 className="font-black text-white mb-4">{selected.full_name || selected.email}</h3>
                <div className="space-y-2 text-sm text-slate-400 mb-4">
                  <p><span className="text-slate-500">Email:</span> {selected.email}</p>
                  <p><span className="text-slate-500">Telefon:</span> {selected.phone || '—'}</p>
                  <p><span className="text-slate-500">Buyurtmalar:</span> {selected.bookings_count || 0}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold mb-2 block">Izoh</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500 resize-none" />
                  <button onClick={saveNote} disabled={saving}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-xl text-sm font-bold transition-all">
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
