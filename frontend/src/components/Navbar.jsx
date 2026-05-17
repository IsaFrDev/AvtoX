import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Sun, Moon, LayoutDashboard, Shield, Menu, X, BarChart3, HelpCircle, Settings, Compass } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSite } from '../context/SiteContext';

const Navbar = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { username } = useParams();
    const siteInfo = useSite(); 
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const p = (path) => `/${username}${path === '/' ? '' : path}`;
    const isActive = (path) => location.pathname === p(path) || (path === '/' && location.pathname === `/${username}`);

    const logo = siteInfo?.logo_url || siteInfo?.store_files?.logo || siteInfo?.logo;

    return (
        <>
            <nav style={{
                position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)',
                width: 'calc(100% - 2rem)', maxWidth: '1200px', height: '4rem',
                backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1rem', zIndex: 1000, boxShadow: 'var(--shadow-lg)'
            }}>
                <Link to={p('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            {logo ? (
                                <img src={logo} alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '10px', background: 'white', padding: '2px' }} />
                            ) : (
                                <div className="logo-icon" style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--primary), #818cf8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Compass size={22} />
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid var(--surface)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                {siteInfo?.name || 'AvtoX'}
                            </span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
                                Online Platform
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <NavItem to={p('/')} icon={<LayoutDashboard size={18} />} label={t('common.dashboard')} active={isActive('/')} />
                    <NavItem to={p('/stats')} icon={<BarChart3 size={18} />} label={t('common.statistics')} active={isActive('/stats')} />
                    <NavItem to={p('/profile')} icon={<User size={18} />} label={t('common.profile')} active={isActive('/profile')} />
                    <NavItem to={p('/settings')} icon={<Settings size={18} />} label={t('common.settings')} active={isActive('/settings')} />
                    <NavItem to={p('/faq')} icon={<HelpCircle size={18} />} label={t('common.help')} active={isActive('/faq')} />
                    <NavItem to={p('/admin')} icon={<Shield size={18} />} label={t('common.admin')} active={isActive('/admin')} special />
                </div>

                <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={toggleTheme} className="theme-btn" style={{ width: '38px', height: '38px', borderRadius: '50%', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button onClick={logout} className="logout-btn hide-mobile" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--error)', background: 'transparent', color: 'var(--error)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={16} /> <span>{t('common.logout')}</span>
                    </button>
                    <button onClick={() => setMobileMenuOpen(true)} className="mobile-menu-trigger show-mobile-only" style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Menu size={22} />
                    </button>
                </div>
            </nav>
            
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, bottom: 0,
                            width: 'min(300px, 80%)', background: 'var(--surface)',
                            zIndex: 2000, boxShadow: 'var(--shadow-2xl)',
                            display: 'flex', flexDirection: 'column', padding: '1.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '10px', 
                                    overflow: 'hidden', background: 'white', 
                                    border: '1px solid var(--border-primary)', padding: '2px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {logo ? (
                                        <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Compass size={20} color="var(--primary)" />
                                    )}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    {siteInfo?.name || 'AvtoX'}
                                </span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <MobileNavItem to={p('/')} icon={<LayoutDashboard size={20} />} label={t('common.dashboard')} onClick={() => setMobileMenuOpen(false)} active={isActive('/')} />
                            <MobileNavItem to={p('/stats')} icon={<BarChart3 size={20} />} label={t('common.statistics')} onClick={() => setMobileMenuOpen(false)} active={isActive('/stats')} />
                            <MobileNavItem to={p('/profile')} icon={<User size={20} />} label={t('common.profile')} onClick={() => setMobileMenuOpen(false)} active={isActive('/profile')} />
                            <MobileNavItem to={p('/settings')} icon={<Settings size={20} />} label={t('common.settings')} onClick={() => setMobileMenuOpen(false)} active={isActive('/settings')} />
                            <MobileNavItem to={p('/faq')} icon={<HelpCircle size={20} />} label={t('common.help')} onClick={() => setMobileMenuOpen(false)} active={isActive('/faq')} />
                            <MobileNavItem to={p('/admin')} icon={<Shield size={20} />} label={t('common.admin')} onClick={() => setMobileMenuOpen(false)} active={isActive('/admin')} special />
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                {theme === 'dark' ? <><Sun size={20} /> Kunduzgi mavzu</> : <><Moon size={20} /> Tungi mavzu</>}
                            </button>
                            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--error)', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontWeight: 600 }}>
                                <LogOut size={20} /> {t('common.logout')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1999 }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

const NavItem = ({ to, icon, label, active, special }) => (
    <Link to={to} style={{ position: 'relative', textDecoration: 'none' }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)',
            background: active ? (special ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)') : 'transparent',
            color: active ? (special ? 'var(--primary)' : 'var(--text-primary)') : 'var(--text-secondary)',
            fontWeight: active ? 700 : 500, fontSize: '0.85rem', transition: 'all 0.2s'
        }}>
            {icon} <span>{label}</span>
        </motion.div>
    </Link>
);

const MobileNavItem = ({ to, icon, label, onClick, active, special }) => (
    <Link to={to} onClick={onClick} style={{ textDecoration: 'none' }}>
        <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)',
            background: active ? (special ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)') : 'transparent',
            color: active ? (special ? 'var(--primary)' : 'var(--text-primary)') : 'var(--text-secondary)',
            fontWeight: active ? 700 : 500, fontSize: '1rem'
        }}>
            {icon} <span>{label}</span>
        </div>
    </Link>
);

export default Navbar;
