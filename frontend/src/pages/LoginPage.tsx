import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Eye, EyeOff, Building2, User } from 'lucide-react';

type Tab = 'login' | 'user' | 'company';

export default function LoginPage() {
  const { user, login, registerUser, registerCompany } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'company' ? 'company' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // User register state
  const [uEmail, setUEmail] = useState('');
  const [uPass, setUPass] = useState('');
  const [uName, setUName] = useState('');
  const [uPhone, setUPhone] = useState('');

  // Company register state
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aPass, setAPass] = useState('');
  const [aName, setAName] = useState('');
  const [aPhone, setAPhone] = useState('');

  useEffect(() => { if (user) navigate('/'); }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await registerUser({ email: uEmail, password: uPass, full_name: uName, phone: uPhone });
      await login(uEmail, uPass);
      navigate('/');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await registerCompany({
        company_name: cName, company_email: cEmail, company_phone: cPhone, company_address: cAddress,
        admin_email: aEmail, admin_password: aPass, admin_full_name: aName, admin_phone: aPhone,
      });
      navigate('/admin');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const inputCls = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder-slate-600";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold mb-8 transition-colors">
          <ArrowLeft size={18} /> Bosh sahifaga
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">Savdo<span className="text-blue-500">gar</span></h1>
          <p className="text-slate-400 mt-2">Sayohat platformasi</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800 mb-6">
          {([['login', 'Kirish'], ['user', 'Ro\'yxat'], ['company', 'Kompaniya']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${tab === t ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm font-bold">
              {error}
            </div>
          )}

          {/* Login */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm font-bold mb-2 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="email@example.com" className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 text-sm font-bold mb-2 block">Parol</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••" className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 mt-2">
                {loading ? 'Yuklanmoqda...' : 'Kirish'}
              </button>
            </form>
          )}

          {/* User Register */}
          {tab === 'user' && (
            <form onSubmit={handleUserRegister} className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <User size={18} className="text-blue-400" />
                <span className="font-bold">Shaxsiy hisob</span>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-bold mb-2 block">Ism familiya</label>
                <input value={uName} onChange={e => setUName(e.target.value)} required placeholder="Ism Familiya" className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 text-sm font-bold mb-2 block">Email</label>
                <input type="email" value={uEmail} onChange={e => setUEmail(e.target.value)} required placeholder="email@example.com" className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 text-sm font-bold mb-2 block">Telefon</label>
                <input value={uPhone} onChange={e => setUPhone(e.target.value)} required placeholder="+998901234567" className={inputCls} />
              </div>
              <div>
                <label className="text-slate-400 text-sm font-bold mb-2 block">Parol</label>
                <input type="password" value={uPass} onChange={e => setUPass(e.target.value)} required placeholder="••••••••" className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                {loading ? 'Yuklanmoqda...' : 'Ro\'yxatdan o\'tish'}
              </button>
            </form>
          )}

          {/* Company Register */}
          {tab === 'company' && (
            <form onSubmit={handleCompanyRegister} className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Building2 size={18} className="text-blue-400" />
                <span className="font-bold">Kompaniya ma'lumotlari</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-bold mb-1 block">Kompaniya nomi</label>
                  <input value={cName} onChange={e => setCName(e.target.value)} required placeholder="ABC Travel" className={inputCls} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold mb-1 block">Kompaniya email</label>
                  <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} required placeholder="info@company.uz" className={inputCls} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold mb-1 block">Telefon</label>
                  <input value={cPhone} onChange={e => setCPhone(e.target.value)} required placeholder="+998901234567" className={inputCls} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold mb-1 block">Manzil</label>
                  <input value={cAddress} onChange={e => setCAddress(e.target.value)} required placeholder="Toshkent, Chilonzor" className={inputCls} />
                </div>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-slate-400 text-xs font-bold mb-3 flex items-center gap-2"><User size={14} /> Admin hisob</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs font-bold mb-1 block">Ism familiya</label>
                    <input value={aName} onChange={e => setAName(e.target.value)} required placeholder="Ism Familiya" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-bold mb-1 block">Admin email</label>
                    <input type="email" value={aEmail} onChange={e => setAEmail(e.target.value)} required placeholder="admin@company.uz" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-bold mb-1 block">Admin telefon</label>
                    <input value={aPhone} onChange={e => setAPhone(e.target.value)} required placeholder="+998901234567" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-bold mb-1 block">Parol</label>
                    <input type="password" value={aPass} onChange={e => setAPass(e.target.value)} required placeholder="••••••••" className={inputCls} />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                {loading ? 'Yuklanmoqda...' : 'Kompaniyani ro\'yxatdan o\'tkazish'}
              </button>
              <p className="text-slate-500 text-xs text-center">Ro'yxatdan so'ng admin tasdiqlashi kerak bo'lishi mumkin</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
