import React, { useState, useEffect } from 'react';
import {
    BookOpen, CheckCircle, HelpCircle, Trophy,
    ArrowRight, Clock, Star, TrendingUp, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProgress } from '../context/ProgressContext';
import { useSite } from '../context/SiteContext';
import { supabase } from '../supabase';
import './Dashboard.css';

const getTrans = (val, lang) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    const l = lang?.split('-')[0] || 'uz';
    return val[l] || val['uz'] || Object.values(val)[0] || '';
};

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { stats: userStats, getAverageTimeFormatted } = useProgress();
    const { i18n } = useTranslation();
    const site = useSite();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTopics, setShowTopics] = useState(false);
    const [error, setError] = useState(null);

    const libraryStats = React.useMemo(() => {
        const totalTopics = categories.length;
        const totalQuestions = categories.reduce((acc, t) => acc + (t.questions?.length || 0), 0);
        const completedMavzular = user?.completed_mavzular || [];
        const completedCount = categories.filter(t =>
            completedMavzular.includes(t.id) || completedMavzular.includes(t.id.toString())
        ).length;

        return { totalTopics, totalQuestions, completedCount };
    }, [categories, user]);

    useEffect(() => {
        fetchDashboardData();
    }, [site]);

    const fetchDashboardData = async () => {
        if (!site?.id) return;
        setLoading(true);
        try {
            // Fetch categories and question counts directly from Supabase
            const { data: catData, error: catError } = await supabase
                .from('categories')
                .select('*, questions(id)')
                .eq('store_id', site.id);

            if (catError) throw catError;

            // Sort categories naturally by name
            const sorted = (catData || []).sort((a, b) => {
                const nameA = getTrans(a.name, i18n.language);
                const nameB = getTrans(b.name, i18n.language);
                return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
            });

            setCategories(sorted);
            setError(null);
        } catch (error) {
            console.error("Dashboard error:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="dashboard fade-in">
            <motion.div variants={itemVariants} className="dashboard-header">
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, var(--text-primary), var(--text-tertiary))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem'
                }}>
                    {t('dashboard.welcome', { name: user?.first_name || user?.username })}
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {showTopics ? t('dashboard.select_topic') : t('dashboard.subtitle')}
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {!showTopics ? (
                    <motion.div key="modes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} variants={itemVariants} className="dashboard-modes">
                        <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)' }} whileTap={{ scale: 0.98 }} className="mode-card" onClick={() => setShowTopics(true)}>
                            <div className="mode-icon-wrapper"><BookOpen size={40} /></div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{t('dashboard.start_practice')}</h3>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{t('dashboard.practice_desc')}</p>
                        </motion.div>

                        <Link to="./quiz?mode=exam" style={{ textDecoration: 'none' }}>
                            <motion.div whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.2)' }} whileTap={{ scale: 0.98 }} className="mode-card exam">
                                <div className="mode-icon-wrapper"><Award size={40} /></div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{t('dashboard.start_exam')}</h3>
                                <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.5 }}>{t('dashboard.exam_desc')}</p>
                            </motion.div>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div key="topics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <button onClick={() => setShowTopics(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', padding: '0.5rem 0' }}>
                            ← {t('common.back')}
                        </button>

                        <div className="topics-grid">
                            {categories.map((cat, index) => (
                                <TopicCard key={cat.id} topic={cat} index={index} isCompleted={user?.completed_mavzular?.includes(cat.id.toString())} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius-lg)', color: 'var(--error)', textAlign: 'center' }}>
                    <strong>{t('common.error_occurred')}</strong>
                    <p>{error.message}</p>
                    <button onClick={() => { setError(null); fetchDashboardData(); }} className="btn-primary" style={{ marginTop: '1rem', background: 'var(--error)' }}>{t('common.retry')}</button>
                </div>
            )}

            <motion.div variants={itemVariants} className="dashboard-stats-grid">
                <StatCard icon={<BookOpen size={24} />} label={t('dashboard.stat_topics')} value={libraryStats.totalTopics} color="var(--primary)" bg="rgba(99, 102, 241, 0.1)" />
                <StatCard icon={<HelpCircle size={24} />} label={t('dashboard.stat_questions')} value={libraryStats.totalQuestions} color="var(--secondary)" bg="rgba(168, 85, 247, 0.1)" />
                <StatCard icon={<Award size={24} />} label={t('dashboard.stat_completed')} value={libraryStats.completedCount} color="var(--success)" bg="rgba(16, 185, 129, 0.1)" />
                <StatCard icon={<Clock size={24} />} label={t('dashboard.stat_avg_time')} value={getAverageTimeFormatted()} color="var(--warning)" bg="rgba(245, 158, 11, 0.1)" />
            </motion.div>
        </motion.div >
    );
};

const StatCard = ({ icon, label, value, color, bg }) => (
    <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="dashboard-stat-card">
        <div className="stat-icon-square" style={{ background: bg, color: color }}>{icon}</div>
        <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{label}</div>
        </div>
    </motion.div>
);

const TopicCard = ({ topic, index, isCompleted }) => {
    const { t, i18n } = useTranslation();
    return (
        <div className="topic-card">
            {isCompleted && (
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--success)' }}>
                    <CheckCircle size={24} fill="currentColor" fillOpacity={0.15} />
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="topic-index">{index + 1}</div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>{getTrans(topic.name, i18n.language)}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {t('dashboard.questions_count', { count: topic.questions?.length || 0 })}
                    </span>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <Link to={`/quiz?topicId=${topic.id}`} className={`start-quiz-btn ${isCompleted ? 'completed' : ''}`}>
                    <span>{t('dashboard.start_quiz')}</span>
                    <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
