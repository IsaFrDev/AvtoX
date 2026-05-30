import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { supabase } from '../supabase';
import {
  Shield, Plus, Pencil, Trash2, ExternalLink, Search,
  LogOut, Building2, CheckCircle2, Clock3, XCircle,
  X, Save, Eye, EyeOff, AlertTriangle, ChevronRight,
  Globe, Send, LayoutGrid, List,
} from 'lucide-react';

const SUPER_USER = 'admin';
const SUPER_PASS = 'admin123';

type Store = {
  id: string;
  name: string;
  slug: string;
  status: string;
  business_type: string;
  store_files: { telegram?: string; logo?: string };
  created_at: string;
};

type FormState = {
  name: string;
  slug: string;
  status: string;
  telegram: string;
  logo: string;
};

const emptyForm: FormState = { name: '', slug: '', status: 'active', telegram: '', logo: '' };

const statusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string; dot: string }> = {
  active:   { label: 'Faol',        icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  pending:  { label: 'Kutilmoqda',  icon: <Clock3 className="w-3.5 h-3.5" />,       cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',     dot: 'bg-amber-400'   },
  inactive: { label: 'Nofaol',      icon: <XCircle className="w-3.5 h-3.5" />,      cls: 'bg-slate-700/60 text-slate-400 border-slate-600/30',     dot: 'bg-slate-500'   },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] || statusConfig.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [form, setForm] = useState({ user: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.user === SUPER_USER && form.pass === SUPER_PASS) {
      onLogin();
    } else {
      setError("Login yoki parol noto'g'ri!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-700/40">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Super Admin</h1>
          <p className="text-slate-500 mt-1.5">AvtoX — Platform boshqaruvi</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-7 space-y-4 shadow-2xl">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
              placeholder="Login"
              autoComplete="username"
              value={form.user}
              onChange={e => { setForm({ ...form, user: e.target.value }); setError(''); }}
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 pr-12 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
                placeholder="Parol"
                autoComplete="current-password"
                value={form.pass}
                onChange={e => { setForm({ ...form, pass: e.target.value }); setError(''); }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-4 rounded-2xl text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-blue-700/30 flex items-center justify-center gap-2">
            Kirish <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// ── COMPANY CARD ─────────────────────────────────────────────────────────────
const CompanyCard = ({ store, onEdit, onDelete }: { store: Store; onEdit: () => void; onDelete: () => void }) => (
  <div className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
    {/* Top color strip */}
    <div className={`h-1 w-full ${store.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : store.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-slate-700'}`} />

    <div className="p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {store.store_files?.logo ? (
            <img src={store.store_files.logo} alt={store.name}
              className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-800 border border-slate-700" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-black text-white text-base leading-tight truncate">{store.name}</p>
            <code className="text-slate-500 text-xs font-mono">/{store.slug}</code>
          </div>
        </div>
        <StatusBadge status={store.status} />
      </div>

      {store.store_files?.telegram && (
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
          <Send className="w-3.5 h-3.5" />
          <span>{store.store_files.telegram}</span>
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
        <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all">
          <Globe className="w-3.5 h-3.5" /> Ko'rish
        </a>
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white text-xs font-bold transition-all">
          <Pencil className="w-3.5 h-3.5" /> Tahrirlash
        </button>
        <button onClick={onDelete}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-red-600 text-slate-500 hover:text-white transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

// ── MAIN ─────────────────────────────────────────────────────────────────────
const SuperAdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores').select('*').order('created_at', { ascending: false });
    if (!error) setStores(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isLoggedIn) fetchStores(); }, [isLoggedIn]);

  const openCreate = () => {
    setEditingStore(null); setForm(emptyForm); setLogoFile(null); setFormError(''); setIsModalOpen(true);
  };
  const openEdit = (store: Store) => {
    setEditingStore(store);
    setForm({ name: store.name, slug: store.slug, status: store.status, telegram: store.store_files?.telegram || '', logo: store.store_files?.logo || '' });
    setLogoFile(null); setFormError(''); setIsModalOpen(true);
  };

  const uploadLogo = async (file: File, slug: string): Promise<string> => {
    try {
      const ext = file.name.split('.').pop();
      const { error } = await supabase.storage.from('store_logos').upload(`${slug}-${Date.now()}.${ext}`, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('store_logos').getPublicUrl(`${slug}-${Date.now()}.${ext}`);
        return publicUrl;
      }
    } catch { /* fall through */ }
    return new Promise<string>((res, rej) => {
      const r = new FileReader(); r.readAsDataURL(file);
      r.onload = () => res(r.result as string); r.onerror = rej;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.slug.trim()) { setFormError('Nom va username majburiy!'); return; }
    setSaving(true);
    try {
      let logoUrl = form.logo;
      if (logoFile) logoUrl = await uploadLogo(logoFile, form.slug);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''),
        status: form.status,
        business_type: 'driving_school',
        store_files: { ...(form.telegram ? { telegram: form.telegram } : {}), logo: logoUrl },
      };

      if (editingStore) {
        const { error } = await supabase.from('stores').update(payload).eq('id', editingStore.id);
        if (error) throw error;
      } else {
        const { data: ex } = await supabase.from('stores').select('id').eq('slug', payload.slug).maybeSingle();
        if (ex) { setFormError('Bu username allaqachon band!'); setSaving(false); return; }
        const { error } = await supabase.from('stores').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false); fetchStores();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi!');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('stores').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null); setDeleting(false); fetchStores();
  };

  const filtered = stores.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q))
      && (statusFilter === 'all' || s.status === statusFilter);
  });

  const stats = [
    { label: 'Jami', value: stores.length, gradient: 'from-blue-600 to-blue-400', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Faol', value: stores.filter(s => s.status === 'active').length, gradient: 'from-emerald-600 to-teal-400', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Kutilmoqda', value: stores.filter(s => s.status === 'pending').length, gradient: 'from-amber-600 to-yellow-400', icon: <Clock3 className="w-5 h-5" /> },
    { label: 'Nofaol', value: stores.filter(s => s.status === 'inactive').length, gradient: 'from-slate-600 to-slate-500', icon: <XCircle className="w-5 h-5" /> },
  ];

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* ── HEADER ── */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-700/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-white text-base">Super Admin</span>
              <span className="text-slate-600 mx-2">·</span>
              <span className="text-slate-500 text-sm">AvtoX</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="hidden sm:flex bg-slate-800 rounded-xl p-1 gap-1">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 font-bold text-sm transition-all">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold">{s.label}</p>
                <p className="text-white text-2xl font-black leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 transition-all"
              placeholder="Nom yoki username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Barchasi</option>
            <option value="active">Faol</option>
            <option value="pending">Kutilmoqda</option>
            <option value="inactive">Nofaol</option>
          </select>

          <button onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-700/20 ml-auto">
            <Plus className="w-4 h-4" /> Yangi
          </button>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold text-sm">Yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-bold">Kompaniyalar topilmadi</p>
            <p className="text-slate-600 text-sm mt-1">Qidiruvni o'zgartiring yoki yangi kompaniya qo'shing</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(store => (
              <CompanyCard key={store.id} store={store} onEdit={() => openEdit(store)} onDelete={() => setDeleteTarget(store)} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kompaniya</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Telegram</th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map(store => (
                    <tr key={store.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {store.store_files?.logo ? (
                            <img src={store.store_files.logo} alt={store.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                              <Building2 className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <span className="font-bold text-white">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <code className="bg-slate-800 px-2 py-1 rounded-lg text-xs text-slate-400">{store.slug}</code>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs hidden md:table-cell">
                        {store.store_files?.telegram || <span className="text-slate-700">—</span>}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={store.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <a href={`/${store.slug}`} target="_blank" rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-400 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button onClick={() => openEdit(store)}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(store)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── CREATE / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 z-50">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10 rounded-t-3xl sm:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  {editingStore ? <Pencil className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-blue-400" />}
                </div>
                <h2 className="text-lg font-black text-white">
                  {editingStore ? 'Tahrirlash' : 'Yangi kompaniya'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kompaniya nomi *</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                    placeholder="Najot Avto maktabi"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username *</label>
                  <input
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm font-mono ${editingStore ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="najot-avto"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    required
                    disabled={!!editingStore}
                  />
                  {editingStore && <p className="text-xs text-slate-600 mt-1.5">Username o'zgartirib bo'lmaydi</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">✅ Faol</option>
                    <option value="pending">⏳ Kutilmoqda</option>
                    <option value="inactive">❌ Nofaol</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telegram</label>
                  <div className="relative">
                    <Send className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
                      placeholder="@company_uz"
                      value={form.telegram}
                      onChange={e => setForm({ ...form, telegram: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Logo {editingStore ? "(o'zgartirish uchun)" : ''}
                  </label>
                  {form.logo && !logoFile && (
                    <img src={form.logo} alt="logo" className="w-16 h-16 rounded-xl object-cover mb-3 bg-slate-800 border border-slate-700" />
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                    onChange={e => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all">
                  Bekor
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              <span className="text-white font-bold">"{deleteTarget.name}"</span> kompaniyasi
              va barcha ma'lumotlari o'chadi. Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all">
                Bekor
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all disabled:opacity-60">
                {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
