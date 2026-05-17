import React, { useState, useEffect, useMemo } from 'react';
import {
    Users, HelpCircle, Shield, Plus, Edit2, Trash2,
    Search, X, Check, Save, Calendar, BookOpen, Clock, AlertTriangle, ChevronRight, Filter,
    CheckCircle2, XCircle, MoreVertical, UserPlus, FileQuestion, RefreshCw, BarChart3, TrendingUp, Upload,
    FileSpreadsheet, FileDown, FileJson, FileText, FolderTree, Compass
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabase';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const getTrans = (val, lang) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    const l = lang?.split('-')[0] || 'uz';
    return val[l] || val['uz'] || Object.values(val)[0] || '';
};

const AdminPanel = () => {
    const { t, i18n } = useTranslation();
    const site = useSite(); // This is our 'store' from SiteContext
    
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ users: [], questions: [], categories: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [successNotification, setSuccessNotification] = useState(null);

    // Form States
    const [userForm, setUserForm] = useState({
        username: '', first_name: '', last_name: '', password: '',
        limit_date: '', is_admin: false, is_active: true
    });

    const [questionForm, setQuestionForm] = useState({
        text: '', choices: ['', '', '', ''], correct_answer_index: 0,
        category_id: '', image_url: ''
    });

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', slug: '' });

    const normalizeTrans = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val.uz || val.ru || val.en || Object.values(val)[0] || '';
    };

    const normalizeChoices = (choices) => {
        if (!choices) return ['', '', '', ''];
        if (Array.isArray(choices)) return choices;
        const found = choices.uz || choices.ru || choices.en || Object.values(choices)[0];
        if (Array.isArray(found)) return found;
        return ['', '', '', ''];
    };

    useEffect(() => {
        fetchData();
    }, [site]);

    const fetchData = async () => {
        if (!site?.id) return;
        setLoading(true);
        try {
            // Fetch only data belonging to THIS store (site)
            const { data: users, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .eq('store_id', site.id);

            const { data: categories, error: catsError } = await supabase
                .from('categories')
                .select('*')
                .eq('store_id', site.id);

            const { data: questions, error: questionsError } = await supabase
                .from('questions')
                .select('*, categories(name)')
                .eq('store_id', site.id);

            if (usersError) console.error("Users fetch error:", usersError);
            if (catsError) console.error("Categories fetch error:", catsError);
            if (questionsError) console.error("Questions fetch error:", questionsError);

            setData({
                users: users || [],
                questions: questions?.map(q => ({
                    ...q,
                    category_name: q.categories?.name
                })) || [],
                categories: categories || []
            });
        } catch (error) {
            console.error('Failed to fetch admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!site?.id) return;
        
        try {
            if (activeTab === 'users' || activeTab === 'admins') {
                const payload = { ...userForm, store_id: site.id };
                if (editingItem) {
                    await supabase.from('profiles').update(payload).eq('id', editingItem.id);
                } else {
                    // Manual ID for profiles not using Supabase Auth
                    const { error } = await supabase.from('profiles').insert([{ ...payload, id: crypto.randomUUID() }]);
                    if (error) throw error;
                    setSuccessNotification(payload);
                }
            } else if (activeTab === 'questions') {
                const cleanChoices = questionForm.choices.filter(c => c && c.trim() !== '');
                const payload = {
                    text: { uz: questionForm.text },
                    choices: { uz: cleanChoices },
                    correct_answer_index: questionForm.correct_answer_index,
                    category_id: questionForm.category_id || data.categories[0]?.id,
                    image_url: questionForm.image_url,
                    store_id: site.id
                };
                if (editingItem) await supabase.from('questions').update(payload).eq('id', editingItem.id);
                else await supabase.from('questions').insert([payload]);
            } else if (activeTab === 'topics') {
                const payload = { 
                    name: { uz: categoryForm.name }, 
                    slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/ /g, '-'),
                    store_id: site.id 
                };
                if (editingItem) await supabase.from('categories').update(payload).eq('id', editingItem.id);
                else await supabase.from('categories').insert([payload]);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Xatolik: ' + error.message);
        }
    };

    const confirmDelete = async (type, id) => {
        if (!window.confirm(t('admin.delete.msg'))) return;
        try {
            const table = type === 'topics' ? 'categories' : (type === 'users' ? 'profiles' : type);
            await supabase.from(table).delete().eq('id', id);
            fetchData();
        } catch (error) {
            alert('Xatolik: ' + error.message);
        }
    };

    const filteredData = () => {
        const term = searchTerm.toLowerCase();
        if (activeTab === 'users') return data.users.filter(u => !u.is_admin && (u.username?.toLowerCase().includes(term) || (u.first_name + ' ' + u.last_name).toLowerCase().includes(term)));
        if (activeTab === 'questions') return data.questions.filter(q => normalizeTrans(q.text).toLowerCase().includes(term));
        if (activeTab === 'topics') return data.categories.filter(c => normalizeTrans(c.name).toLowerCase().includes(term));
        return [];
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            if (activeTab === 'users') {
                setUserForm({ ...item, limit_date: item.limit_date?.split('T')[0] });
            } else if (activeTab === 'questions') {
                setQuestionForm({
                    text: normalizeTrans(item.text),
                    choices: normalizeChoices(item.choices),
                    correct_answer_index: item.correct_answer_index,
                    category_id: item.category_id,
                    image_url: item.image_url
                });
            } else if (activeTab === 'topics') {
                setCategoryForm({ name: normalizeTrans(item.name), slug: item.slug });
            }
        } else {
            // Reset forms
            setUserForm({ username: '', first_name: '', last_name: '', password: '', limit_date: '', is_admin: false });
            setQuestionForm({ text: '', choices: ['', '', '', ''], correct_answer_index: 0, category_id: data.categories[0]?.id || '', image_url: '' });
            setCategoryForm({ name: '', description: '', slug: '' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="admin-panel responsive-container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>{t('admin.title')}</h1>
                <button onClick={() => openModal()} className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> {t(`admin.add_${activeTab === 'topics' ? 'topic' : activeTab.slice(0,-1)}`)}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                {['users', 'questions', 'topics', 'statistics'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                        background: activeTab === tab ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer', fontWeight: 700
                    }}>
                        {t(`admin.tabs.${tab}`)}
                    </button>
                ))}
            </div>

            {activeTab === 'statistics' ? (
                <StatisticsView data={data} getTrans={getTrans} />
            ) : (
                <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>{t('admin.table.profile')}</th>
                                <th style={{ padding: '1rem' }}>{activeTab === 'questions' ? t('admin.table.question_text') : t('admin.table.login')}</th>
                                <th style={{ padding: '1rem' }}>{t('admin.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData().map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <td style={{ padding: '1rem' }}>{item.first_name} {item.last_name}</td>
                                    <td style={{ padding: '1rem' }}>{activeTab === 'questions' ? getTrans(item.text, i18n.language) : item.username}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openModal(item)} className="icon-btn"><Edit2 size={16} /></button>
                                            <button onClick={() => confirmDelete(activeTab, item.id)} className="icon-btn" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Logic remains similar but uses new states and fields */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '24px', width: '90%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>{editingItem ? 'Tahrirlash' : 'Qo\'shish'}</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {activeTab === 'users' && (
                                    <>
                                        <input type="text" placeholder="Ism" value={userForm.first_name} onChange={e => setUserForm({...userForm, first_name: e.target.value})} required className="admin-input" />
                                        <input type="text" placeholder="Familiya" value={userForm.last_name} onChange={e => setUserForm({...userForm, last_name: e.target.value})} required className="admin-input" />
                                        <input type="text" placeholder="Login" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required className="admin-input" />
                                        <input type="password" placeholder="Parol" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required className="admin-input" />
                                        <input type="date" value={userForm.limit_date} onChange={e => setUserForm({...userForm, limit_date: e.target.value})} className="admin-input" />
                                    </>
                                )}
                                {activeTab === 'questions' && (
                                    <>
                                        <textarea placeholder="Savol matni" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} required className="admin-input" />
                                        {questionForm.choices.map((c, i) => (
                                            <input key={i} placeholder={`Variant ${i+1}`} value={c} onChange={e => {
                                                const nc = [...questionForm.choices]; nc[i] = e.target.value; setQuestionForm({...questionForm, choices: nc});
                                            }} className="admin-input" />
                                        ))}
                                        <select value={questionForm.category_id} onChange={e => setQuestionForm({...questionForm, category_id: e.target.value})} className="admin-input">
                                            {data.categories.map(c => <option key={c.id} value={c.id}>{getTrans(c.name)}</option>)}
                                        </select>
                                    </>
                                )}
                                {activeTab === 'topics' && (
                                    <>
                                        <input type="text" placeholder="Mavzu nomi" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required className="admin-input" />
                                    </>
                                )}
                                <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '12px' }}>Saqlash</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .admin-input { width: 100%; padding: 0.75rem; border-radius: 12px; border: 1px solid var(--border-primary); background: var(--bg-secondary); color: var(--text-primary); outline: none; }
                .icon-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); }
            `}</style>
        </div>
    );
};

const StatisticsView = ({ data, getTrans }) => {
    const { t, i18n } = useTranslation();
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={statBoxStyle}><Users size={24} /> <h3>{data.users.length}</h3> <p>O'quvchilar</p></div>
            <div style={statBoxStyle}><FileText size={24} /> <h3>{data.questions.length}</h3> <p>Savollar</p></div>
            <div style={statBoxStyle}><FolderTree size={24} /> <h3>{data.categories.length}</h3> <p>Mavzular</p></div>
        </div>
    );
};

const statBoxStyle = { background: 'var(--surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-primary)', textAlign: 'center' };

export default AdminPanel;
