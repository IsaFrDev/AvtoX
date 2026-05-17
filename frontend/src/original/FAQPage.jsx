import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, BookOpen, Trophy, Settings, Users, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../context/SiteContext';

const FAQPage = () => {
    const { t } = useTranslation();
    const site = useSite(); // Get site info
    const [openIndex, setOpenIndex] = useState(null);
    const commonCategories = t('faq.categories', { returnObjects: true }) || {};
    const allItems = t('faq.items', { returnObjects: true }) || {};

    const faqCategories = [
        { title: commonCategories.basic || 'Asosiy', icon: HelpCircle, color: '#6366f1', items: allItems.basic || [] },
        { title: commonCategories.points || 'Ballar', icon: Trophy, color: '#f59e0b', items: allItems.points || [] },
        { title: commonCategories.settings || 'Sozlamalar', icon: Settings, color: '#10b981', items: allItems.settings || [] },
        { title: commonCategories.exam_prep || 'Imtihon', icon: BookOpen, color: '#a855f7', items: allItems.exam_prep || [] }
    ];

    // Dynamic Telegram Link
    const tgLink = site?.tg_username 
        ? `https://t.me/${site.tg_username.replace('@', '')}` 
        : 'https://t.me/Qobiljona';

    return (
        <div className="faq-page fade-in responsive-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header ... same as before ... */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <HelpCircle size={48} color="var(--primary)" />
                </div>
                <h1 className="text-responsive-h1" style={{ marginBottom: '0.75rem', fontWeight: 900, fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('faq.title')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    {t('faq.subtitle')}
                </p>
            </motion.div>

            {/* FAQ Items ... same as before ... */}
            {faqCategories.map((category, catIdx) => (
                <motion.div key={category.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: catIdx * 0.1 }} style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-3xl)', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xl)', background: `linear-gradient(135deg, ${category.color}40, ${category.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${category.color}30` }}>
                            <category.icon size={24} style={{ color: category.color }} />
                        </div>
                        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{category.title}</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {category.items.map((item, itemIdx) => {
                            const globalIndex = `${catIdx}-${itemIdx}`;
                            const isOpen = openIndex === globalIndex;
                            return (
                                <motion.div key={itemIdx} style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)', overflow: 'hidden', background: isOpen ? 'rgba(99, 102, 241, 0.05)' : 'transparent', transition: 'all 0.3s' }}>
                                    <button onClick={() => setOpenIndex(isOpen ? null : globalIndex)} style={{ width: '100%', padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isOpen ? 'var(--primary)' : 'var(--text-primary)' }}>{item.q}</span>
                                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={20} style={{ color: isOpen ? 'var(--primary)' : 'var(--text-tertiary)' }} /></motion.div>
                                    </button>
                                    <AnimatePresence>{isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}><div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}><div style={{ height: '1px', background: 'var(--border-primary)', marginBottom: '1rem' }}></div>{item.a}</div></motion.div>)}</AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}

            {/* Contact - FIXED TELEGRAM LINK */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: 'var(--radius-3xl)',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    color: 'white',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)'
                }}
            >
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <MessageCircle size={32} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t('faq.contact_title')}</h3>
                <p style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>{t('faq.contact_text')}</p>
                <a
                    href={tgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', borderRadius: 'var(--radius-xl)',
                        background: 'white', color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <MessageCircle size={20} />
                    {t('faq.contact_btn')}
                </a>
            </motion.div>
        </div>
    );
};

export default FAQPage;
