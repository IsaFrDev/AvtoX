import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { supabase } from '../supabase';
import {
  Shield, Plus, Pencil, Trash2, ExternalLink, Search,
  LogOut, Building2, Users, BookOpen, CheckCircle, Clock,
  X, Save, Eye, EyeOff, AlertTriangle,
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

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-black">{value}</p>
    </div>
  </div>
);

const SuperAdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === SUPER_USER && loginForm.pass === SUPER_PASS) {
      setIsLoggedIn(true);
    } else {
      setLoginError("Login yoki parol noto'g'ri!");
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setStores(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchStores();
  }, [isLoggedIn]);

  const openCreate = () => {
    setEditingStore(null);
    setForm(emptyForm);
    setLogoFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (store: Store) => {
    setEditingStore(store);
    setForm({
      name: store.name,
      slug: store.slug,
      status: store.status,
      telegram: store.store_files?.telegram || '',
      logo: store.store_files?.logo || '',
    });
    setLogoFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.slug.trim()) {
      setFormError('Nom va username majburiy!');
      return;
    }

    setSaving(true);
    try {
      let logoUrl = form.logo;

      if (logoFile) {
        try {
          const ext = logoFile.name.split('.').pop();
          const fileName = `${form.slug}-${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from('store_logos')
            .upload(fileName, logoFile);
          if (!upErr) {
            const { data: { publicUrl } } = supabase.storage
              .from('store_logos')
              .getPublicUrl(fileName);
            logoUrl = publicUrl;
          } else {
            // fallback to base64
            logoUrl = await new Promise<string>((res, rej) => {
              const r = new FileReader();
              r.readAsDataURL(logoFile);
              r.onload = () => res(r.result as string);
              r.onerror = rej;
            });
          }
        } catch {
          logoUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.readAsDataURL(logoFile!);
            r.onload = () => res(r.result as string);
            r.onerror = rej;
          });
        }
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''),
        status: form.status,
        business_type: 'driving_school',
        store_files: {
          ...(form.telegram ? { telegram: form.telegram } : {}),
          logo: logoUrl,
        },
      };

      if (editingStore) {
        const { error } = await supabase
          .from('stores')
          .update(payload)
          .eq('id', editingStore.id);
        if (error) throw error;
      } else {
        const { data: existing } = await supabase
          .from('stores')
          .select('id')
          .eq('slug', payload.slug)
          .maybeSingle();
        if (existing) {
          setFormError('Bu username allaqachon band!');
          setSaving(false);
          return;
        }
        const { error } = await supabase.from('stores').insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchStores();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from('stores').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    setDeleting(false);
    fetchStores();
  };

  const filtered = stores.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: stores.length,
    active: stores.filter(s => s.status === 'active').length,
    pending: stores.filter(s => s.status === 'pending').length,
  };

  // ── LOGIN ──
  if (!isLoggedIn) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Super Admin</h1>
          <p className="text-slate-500 text-sm mt-1">AvtoX Platform boshqaruvi</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-4 shadow-2xl">
          {loginError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {loginError}
            </div>
          )}
          <input
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm"
            placeholder="Login"
            value={loginForm.user}
            onChange={e => setLoginForm({ ...loginForm, user: e.target.value })}
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 pr-11 text-white outline-none focus:border-blue-500 text-sm"
              placeholder="Parol"
              value={loginForm.pass}
              onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl text-white font-black transition-all shadow-lg shadow-blue-600/20"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">Super Admin</h1>
              <p className="text-slate-500 text-xs hidden sm:block">AvtoX Platform</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 font-bold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={<Building2 className="w-5 h-5 text-blue-400" />}
            label="Jami kompaniyalar"
            value={stats.total}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-400" />}
            label="Faol"
            value={stats.active}
            color="bg-green-500/10"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-yellow-400" />}
            label="Kutilmoqda"
            value={stats.pending}
            color="bg-yellow-500/10"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 w-48 sm:w-64"
                placeholder="Qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Barchasi</option>
              <option value="active">Faol</option>
              <option value="pending">Kutilmoqda</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Yangi kompaniya
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-500 font-bold">Yuklanmoqda...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Kompaniyalar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 sm:px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Kompaniya</th>
                    <th className="px-4 sm:px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Username</th>
                    <th className="px-4 sm:px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Telegram</th>
                    <th className="px-4 sm:px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-4 text-slate-500 font-bold text-xs uppercase tracking-wider text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map(store => (
                    <tr key={store.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {store.store_files?.logo ? (
                            <img
                              src={store.store_files.logo}
                              alt={store.name}
                              className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-800"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <span className="font-bold text-white">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-400 hidden sm:table-cell">
                        <code className="bg-slate-800 px-2 py-0.5 rounded-lg text-xs">{store.slug}</code>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-400 hidden md:table-cell text-xs">
                        {store.store_files?.telegram || '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          store.status === 'active'
                            ? 'bg-green-500/10 text-green-400'
                            : store.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {store.status === 'active' ? 'Faol' : store.status === 'pending' ? 'Kutilmoqda' : 'Nofaol'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <a
                            href={`/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                            title="Saytni ko'rish"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openEdit(store)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(store)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 z-50">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white">
                {editingStore ? 'Kompaniyani tahrirlash' : 'Yangi kompaniya'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Kompaniya nomi *
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm"
                  placeholder="Masalan: Najot Avto maktabi"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Username (URL slug) *
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm font-mono"
                  placeholder="najot-avto"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                  required
                  disabled={!!editingStore}
                />
                {editingStore && <p className="text-xs text-slate-600 mt-1">Username o'zgartirib bo'lmaydi</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Telegram username
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm"
                  placeholder="@company_uz"
                  value={form.telegram}
                  onChange={e => setForm({ ...form, telegram: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Status
                </label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 text-sm"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Faol</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Logo {editingStore ? '(o\'zgartirish uchun tanlang)' : ''}
                </label>
                {form.logo && !logoFile && (
                  <img src={form.logo} alt="logo" className="w-16 h-16 rounded-xl object-cover mb-2 bg-slate-800" />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  onChange={e => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 space-y-5 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-white mb-1">O'chirishni tasdiqlang</h3>
              <p className="text-slate-400 text-sm">
                <span className="font-bold text-white">{deleteTarget.name}</span> kompaniyasi va unga tegishli barcha ma'lumotlar o'chib ketadi. Bu amal qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
              >
                Bekor
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all disabled:opacity-60"
              >
                {deleting ? 'O\'chirilmoqda...' : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
