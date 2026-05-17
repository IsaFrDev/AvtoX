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
                width: 'calc(100% - 2rem)', maxWidth: '1200px', height: '4.5rem',
                backgroundColor: 'var(--surface-solid)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-primary)', borderRadius: '1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.25rem', zIndex: 1000, boxShadow: 'var(--shadow-md)'
            }}>
                <Link to={p('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            {logo ? (
                                <img src={logo} alt="Logo" style={{ width: '46px', height: '46px', objectFit: 'contain', borderRadius: '12px', background: 'white', padding: '2px' }} />
                            ) : (
                                <div className="logo-icon" style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--primary), #818cf8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Compass size={24} />
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '14px', height: '14px', background: '#10b981', borderRadius: '50%', border: '2px solid var(--surface-solid)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                {siteInfo?.name || 'Nmadur'}
                            </span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                                ONLINE PLATFORM
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <NavItem to={p('/')} icon={<LayoutDashboard size={18} />} label="Dashboard" active={isActive('/')} />
                    <NavItem to={p('/stats')} icon={<BarChart3 size={18} />} label="Statistika" active={isActive('/stats')} />
                    <NavItem to={p('/profile')} icon={<User size={18} />} label="Profil" active={isActive('/profile')} />
                    <NavItem to={p('/settings')} icon={<Settings size={18} />} label="Sozlamalar" active={isActive('/settings')} />
                    <NavItem to={p('/faq')} icon={<HelpCircle size={18} />} label="Yordam" active={isActive('/faq')} />
                    <NavItem to={p('/admin')} icon={<Shield size={18} />} label="Boshqaruv" active={isActive('/admin')} special />
                </div>

                <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={toggleTheme} className="theme-btn" style={{ width: '42px', height: '42px', borderRadius: '50%', border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={logout} className="logout-btn hide-mobile" style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '1.5px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={18} /> <span>Chiqish</span>
                    </button>
                    <button onClick={() => setMobileMenuOpen(true)} className="mobile-menu-trigger show-mobile-only" style={{ width: '42px', height: '42px', borderRadius: '12px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Menu size={24} />
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
                            width: 'min(320px, 85%)', background: 'var(--bg-secondary)',
                            zIndex: 2000, boxShadow: '-10px 0 25px rgba(0,0,0,0.1)',
                            display: 'flex', flexDirection: 'column', padding: '1.5rem',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ 
                                    width: '44px', height: '44px', borderRadius: '12px', 
                                    overflow: 'hidden', background: 'white', 
                                    border: '1px solid var(--border-primary)', padding: '2px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {logo ? (
                                        <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Compass size={24} color="var(--primary)" />
                                    )}
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                    {siteInfo?.name || 'AvtoX'}
                                </span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'var(--surface-solid)', width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <MobileNavItem to={p('/')} icon={<LayoutDashboard size={20} />} label="Asosiy" onClick={() => setMobileMenuOpen(false)} color="#8b5cf6" />
                            <MobileNavItem to={p('/stats')} icon={<BarChart3 size={20} />} label="Ballar" onClick={() => setMobileMenuOpen(false)} color="#f59e0b" />
                            <MobileNavItem to={p('/profile')} icon={<User size={20} />} label="Profil" onClick={() => setMobileMenuOpen(false)} color="#3b82f6" />
                            <MobileNavItem to={p('/settings')} icon={<Settings size={20} />} label="Sozlamalar" onClick={() => setMobileMenuOpen(false)} color="#10b981" />
                            <MobileNavItem to={p('/faq')} icon={<HelpCircle size={20} />} label="Yordam" onClick={() => setMobileMenuOpen(false)} color="#64748b" />
                            <MobileNavItem to={p('/admin')} icon={<Shield size={20} />} label="Boshqaruv" onClick={() => setMobileMenuOpen(false)} color="#6366f1" />
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', borderRadius: '16px', border: 'none', background: 'var(--surface-solid)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(100, 116, 139, 0.1)', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                </div>
                                {theme === 'dark' ? "Kunduzgi mavzu" : "Tungi mavzu"}
                            </button>
                            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', borderRadius: '16px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LogOut size={20} />
                                </div>
                                Chiqish
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

const NavItem = ({ to, icon, label, active, special }) => {
    let bg = 'transparent';
    let color = 'var(--text-secondary)';
    let fontWeight = 600;
    
    if (special) {
        bg = 'rgba(99, 102, 241, 0.1)';
        color = '#6366f1';
        fontWeight = 700;
    } else if (active) {
        bg = 'var(--bg-tertiary)';
        color = 'var(--text-primary)';
        fontWeight = 700;
    }

    return (
        <Link to={to} style={{ position: 'relative', textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderRadius: '0.75rem',
                background: bg, color: color, fontWeight: fontWeight, fontSize: '0.9rem', transition: 'all 0.2s'
            }}>
                <span style={{ opacity: 0.7 }}>{icon}</span> <span>{label}</span>
            </motion.div>
        </Link>
    );
};

const MobileNavItem = ({ to, icon, label, onClick, color }) => (
    <Link to={to} onClick={onClick} style={{ textDecoration: 'none' }}>
        <motion.div whileTap={{ scale: 0.98 }} style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '1rem',
            background: 'var(--surface-solid)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem'
        }}>
            <div style={{
                width: '42px', height: '42px', borderRadius: '12px', background: `${color}20`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <span>{label}</span>
        </motion.div>
    </Link>
);

export default Navbar;
