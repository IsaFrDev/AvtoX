import { supabase } from '../supabase';
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api`;

// Quiz API functions using Supabase Bridge
export const quizApi = {
    getTopics: async () => {
        const { data, error } = await supabase.from('topics').select('*, questions(id)').order('id');
        if (error) throw error;
        return data.map(t => ({ ...t, title: t.title || t.name, questions_count: t.questions?.length || 0 }));
    },
    getTopic: async (topicId) => {
        const { data, error } = await supabase.from('topics').select('*, questions(*)').eq('id', topicId).single();
        if (error) throw error;
        return { ...data, title: data.title || data.name, questions_count: data.questions?.length || 0 };
    },
    getTopicQuestions: async (topicId) => {
        const { data, error } = await supabase.from('questions').select('*').eq('topic_id', topicId);
        if (error) throw error;
        return data;
    },
    getTopicQuiz: async (topicId) => {
        const { data, error } = await supabase.from('questions').select('*').eq('topic_id', topicId);
        if (error) throw error;
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        return { questions: shuffled.slice(0, 20).map(q => ({ ...q, question_text: q.text.uz || q.text })) };
    },
    getQuestions: async () => {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        return data.map(q => ({ ...q, question_text: q.text.uz || q.text }));
    },
    getExamQuestions: async () => {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        return { questions: shuffled.slice(0, 20).map(q => ({ ...q, question_text: q.text.uz || q.text })) };
    },
    createQuestion: async (data) => {
        const { data: res, error } = await supabase.from('questions').insert(data);
        if (error) throw error;
        return res;
    },
    deleteQuestion: async (id) => {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
    }
};

// SaaS Functions
export const registerSite = (data) => axios.post(`${API_URL}/register/`, data);
export const getSite = (username) => axios.get(`${API_URL}/sites/${username}/`);

const api = { get: () => {}, post: () => {} };
export default api;