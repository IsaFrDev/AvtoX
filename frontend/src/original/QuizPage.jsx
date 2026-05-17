import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Timer, BookOpen, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useSite } from '../context/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Confetti, { SuccessCheck, WrongX, ShakeWrapper } from '../components/Confetti';
import LevelBadge from '../components/LevelBadge';

const getTrans = (val, lang) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    const l = lang?.split('-')[0] || 'uz';
    return val[l] || val['uz'] || Object.values(val)[0] || '';
};

const getChoices = (choices, lang) => {
    if (!choices) return [];
    if (Array.isArray(choices)) return choices;
    const l = lang?.split('-')[0] || 'uz';
    return choices[l] || choices['uz'] || Object.values(choices)[0] || [];
};

const QuizPage = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const site = useSite();
    const { addCorrectAnswer, addWrongAnswer } = useProgress();

    const query = new URLSearchParams(location.search);
    const categoryId = query.get('topicId');
    const mode = query.get('mode');

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [shake, setShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showSuccessCheck, setShowSuccessCheck] = useState(false);
    const [showWrongX, setShowWrongX] = useState(false);

    useEffect(() => {
        setQuestionStartTime(Date.now());
    }, [currentIdx]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!site?.id) return;
            setLoading(true);
            try {
                let query = supabase.from('questions').select('*').eq('store_id', site.id);
                
                if (mode !== 'exam' && categoryId) {
                    query = query.eq('category_id', categoryId);
                }

                const { data, error: fetchError } = await query;
                if (fetchError) throw fetchError;

                let finalQuestions = data || [];
                if (mode === 'exam') {
                    // Random 20 questions for exam
                    finalQuestions = finalQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);
                    setTimeLeft(finalQuestions.length * 90);
                } else if (categoryId) {
                    // Show all questions for topic practice
                } else {
                    // Random 20 for general practice
                    finalQuestions = finalQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);
                }

                if (finalQuestions.length === 0) {
                    setError(t('quiz.not_found'));
                } else {
                    setQuestions(finalQuestions);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(t('quiz.error_fetch'));
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [categoryId, mode, site]);

    useEffect(() => {
        if (timeLeft === 0) { setShowResults(true); return; }
        if (timeLeft === null) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleAnswer = (choiceIdx) => {
        if (showResults || answered) return;

        setSelectedAnswer(choiceIdx);
        setUserAnswers({ ...userAnswers, [currentIdx]: choiceIdx });
        setAnswered(true);

        const currentQuestion = questions[currentIdx];
        const isCorrect = choiceIdx === currentQuestion.correct_answer_index;
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

        if (isCorrect) {
            addCorrectAnswer(currentQuestion.category_id, timeSpent);
            setShowConfetti(true);
            setShowSuccessCheck(true);
            setTimeout(() => { setShowConfetti(false); setShowSuccessCheck(false); }, 1500);
        } else {
            addWrongAnswer(currentQuestion.category_id, timeSpent);
            setShake(true);
            setShowWrongX(true);
            setTimeout(() => { setShake(false); setShowWrongX(false); }, 800);
        }

        setTimeout(() => {
            if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
                setAnswered(false);
                setSelectedAnswer(null);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    const currentQuestion = questions[currentIdx];
    const score = questions.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correct_answer_index ? 1 : 0), 0);
    const pass = questions.length > 0 ? (score >= (questions.length * 0.9)) : false;

    useEffect(() => {
        const updateProgress = async () => {
            if (!showResults || !pass || !categoryId || !user) return;
            const currentCompleted = user.completed_mavzular || [];
            if (!currentCompleted.includes(categoryId.toString())) {
                try {
                    const newCompleted = [...currentCompleted, categoryId.toString()];
                    const { data } = await supabase.from('profiles').update({ completed_mavzular: newCompleted }).eq('id', user.id).select().single();
                    if (setUser) setUser(data);
                } catch (error) { console.error('Failed to update progress', error); }
            }
        };
        updateProgress();
    }, [showResults, pass, categoryId, user]);

    const getChoiceStyle = (idx) => {
        if (answered) {
            const isCorrect = idx === currentQuestion.correct_answer_index;
            const isUserChoice = selectedAnswer === idx;
            if (isCorrect) return { borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' };
            if (isUserChoice) return { borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.15)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' };
        }
        return { borderColor: selectedAnswer === idx ? 'var(--primary)' : 'var(--border-primary)', background: selectedAnswer === idx ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)' };
    };

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
    if (error || questions.length === 0) return <div className="error-view"><h2>{error || t('quiz.not_found')}</h2><button onClick={() => navigate('/')} className="btn-primary">Orqaga</button></div>;

    if (showResults) {
        return (
            <div className="results-view fade-in">
                <div className="results-card">
                    <div className={`status-icon ${pass ? 'pass' : 'fail'}`}>{pass ? <CheckCircle2 size={56} /> : <XCircle size={56} />}</div>
                    <h1>{pass ? t('quiz.congrats') : t('quiz.failed')}</h1>
                    <div className="stats-grid">
                        <StatCard label="Jami" value={questions.length} />
                        <StatCard label="To'g'ri" value={score} color="var(--success)" />
                        <StatCard label="Xato" value={questions.length - score} color="var(--error)" />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button onClick={() => window.location.reload()} className="btn-primary">Qayta urinish</button>
                        <button onClick={() => navigate('/')} className="btn-secondary">Dashboard</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page fade-in responsive-container">
            <Confetti active={showConfetti} />
            <AnimatePresence>
                {showSuccessCheck && <SuccessCheck show={showSuccessCheck} key="success" />}
                {showWrongX && <WrongX show={showWrongX} key="wrong" />}
            </AnimatePresence>

            <div className="quiz-header">
                <button onClick={() => navigate('/')} className="icon-btn"><ChevronLeft size={20} /></button>
                <div className="quiz-info">
                    <h2>{mode === 'exam' ? 'Imtihon' : 'Mashq'}</h2>
                    <span>{currentIdx + 1} / {questions.length}</span>
                </div>
                {mode === 'exam' && <div className="quiz-timer"><Timer size={20} /> <span>{Math.floor(timeLeft/60)}:{timeLeft%60 < 10 ? '0' : ''}{timeLeft%60}</span></div>}
            </div>

            <div className="progress-bar-container">
                <motion.div initial={{ width: 0 }} animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} className="progress-bar-fill" />
            </div>

            <div className="quiz-content-grid">
                <ShakeWrapper shake={shake}>
                    <motion.div key={currentIdx} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="question-card">
                        {currentQuestion.image_url && <img src={currentQuestion.image_url} alt="Question" className="question-image" />}
                        <h3 className="question-text">{getTrans(currentQuestion.text, i18n.language)}</h3>
                        <div className="choices-grid">
                            {getChoices(currentQuestion.choices, i18n.language).map((choice, idx) => (
                                <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered} style={getChoiceStyle(idx)} className="choice-button">
                                    <span className="choice-label">{String.fromCharCode(65 + idx)}</span>
                                    <span className="choice-text">{choice}</span>
                                    {answered && idx === currentQuestion.correct_answer_index && <CheckCircle2 size={20} color="var(--success)" />}
                                    {answered && selectedAnswer === idx && idx !== currentQuestion.correct_answer_index && <XCircle size={20} color="var(--error)" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </ShakeWrapper>

                <div className="quiz-sidebar">
                    <LevelBadge showDetails={true} size="small" />
                    <button onClick={() => setShowResults(true)} className="btn-primary finish-btn">Testni yakunlash</button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <div className="stat-card" style={{ color }}>
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
    </div>
);

export default QuizPage;
