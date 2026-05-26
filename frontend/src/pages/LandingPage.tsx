import React, { useState, useEffect } from 'react';
// @ts-ignore
import { supabase } from '../supabase';
import { Shield, ExternalLink, AlertCircle, Check, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ name: '', username: '', tg_username: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [registered, setRegistered] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const changeLang = (lang: string) => i18n.changeLanguage(lang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    
    try {
      // 1. Check if slug already exists
      const { data: existing } = await supabase
        .from('stores')
        .select('slug')
        .eq('slug', formData.username)
        .maybeSingle();

      if (existing) {
        setErrorMsg("Bu username allaqachon band. Iltimos boshqasini tanlang.");
        setLoading(false);
        return;
      }
      
      if (!logoFile) {
        setErrorMsg("Iltimos, maktab logotipini yuklang.");
        setLoading(false);
        return;
      }

      // 1.5 Upload logo (with Base64 fallback if storage bucket doesn't exist)
      let publicUrl = '';
      try {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${formData.username}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('store_logos').upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl: url } } = supabase.storage.from('store_logos').getPublicUrl(fileName);
        publicUrl = url;
      } catch (uploadErr) {
        console.warn("Storage upload failed, falling back to Base64:", uploadErr);
        // Convert logo to Base64 Data URL as fallback
        publicUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(logoFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = err => reject(err);
        });
      }


      // 2. Insert into 'stores' table
      const { data, error } = await supabase
        .from('stores')
        .insert([{
          name: formData.name,
          slug: formData.username,
          status: 'active',
          business_type: 'driving_school',
          store_files: { ...(formData.tg_username ? { telegram: formData.tg_username } : {}), logo: publicUrl }
        }])
        .select()
        .single();

      if (error) throw error;
      
      setRegistered(data);
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMsg(err.message || "Xatolik yuz berdi. Iltimos qaytadan urunib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-bg-glow"></div>
      
      <div className="lang-switcher">
        <button className="switcher-btn" onClick={() => changeLang('uz')}>UZ</button>
        <button className="switcher-btn" onClick={() => changeLang('ru')}>RU</button>
      </div>
      
      <div className="theme-switcher">
        <button className="switcher-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="landing-card">
        <div className="landing-header">
          <div className="landing-icon">
             <img src="/full-logo.jpg" alt="AvtoX Logo" style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '24px', background: 'transparent' }} />
          </div>
          <h1 className="landing-title">{t('landing.title')}</h1>
          <p className="landing-subtitle">{t('landing.subtitle')}</p>
        </div>

        {errorMsg && (
          <div className="error-box">
            <AlertCircle size={20} />
            <p>{errorMsg}</p>
          </div>
        )}

        {!registered ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('landing.school_name')}</label>
              <input className="form-input" placeholder={t('landing.placeholder_name')} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('landing.username')}</label>
              <input className="form-input" placeholder={t('landing.placeholder_user')} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')})} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('landing.tg_username')} (@ bilan)</label>
              <input className="form-input" placeholder="@user_name" onChange={e => setFormData({...formData, tg_username: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Maktab logotipi (Majburiy)</label>
              <input type="file" accept="image/*" className="form-input" style={{padding: '0.5rem'}} onChange={e => setLogoFile(e.target.files?.[0] || null)} required />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? t('landing.creating') : t('landing.create_btn')}
            </button>
          </form>
        ) : (
          <div className="success-box">
            <div style={{width: '48px', height: '48px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}><Check color="white" /></div>
            <p style={{fontWeight: 'bold', fontSize: '18px', marginBottom: '8px'}}>{t('landing.success')}</p>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '24px'}}>{t('landing.success_desc')}</p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <a href={`/${registered.slug}`} style={{display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--lp-input-bg)', borderRadius: '16px', textDecoration: 'none', color: 'var(--lp-text)', border: '1px solid var(--lp-input-border)'}}>
                <span style={{fontWeight: 'bold'}}>{t('landing.view_site')}</span>
                <ExternalLink size={18} color="#3b82f6" />
              </a>
              <a href={`/${registered.slug}/admin`} style={{display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--lp-input-bg)', borderRadius: '16px', textDecoration: 'none', color: '#3b82f6', border: '1px solid var(--lp-input-border)'}}>
                <span style={{fontWeight: 'bold'}}>{t('landing.admin_panel')}</span>
                <Shield size={18} />
              </a>
            </div>
            
            <button onClick={() => setRegistered(null)} style={{marginTop: '24px', background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', cursor: 'pointer'}}>{t('landing.create_another')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
