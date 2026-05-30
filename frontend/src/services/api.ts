// @ts-ignore
import { supabase } from '../supabase';

// Quiz API functions using Supabase Bridge
export const quizApi = {
    getTopics: async () => {
        const { data, error } = await supabase.from('topics').select('*, questions(id)').order('id');
        if (error) throw error;
        return data.map((t: any) => ({ ...t, title: t.title || t.name, questions_count: t.questions?.length || 0 }));
    },
    getTopic: async (topicId: any) => {
        const { data, error } = await supabase.from('topics').select('*, questions(*)').eq('id', topicId).single();
        if (error) throw error;
        return { ...data, title: data.title || data.name, questions_count: data.questions?.length || 0 };
    },
    getTopicQuestions: async (topicId: any) => {
        const { data, error } = await supabase.from('questions').select('*').eq('topic_id', topicId);
        if (error) throw error;
        return data;
    },
    getTopicQuiz: async (topicId: any) => {
        const { data, error } = await supabase.from('questions').select('*').eq('topic_id', topicId);
        if (error) throw error;
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        return { questions: shuffled.slice(0, 20).map((q: any) => ({ ...q, question_text: q.text.uz || q.text })) };
    },
    getQuestions: async () => {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        return data.map((q: any) => ({ ...q, question_text: q.text.uz || q.text }));
    },
    getExamQuestions: async () => {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        return { questions: shuffled.slice(0, 20).map((q: any) => ({ ...q, question_text: q.text.uz || q.text })) };
    },
    createQuestion: async (data: any) => {
        const { data: res, error } = await supabase.from('questions').insert(data);
        if (error) throw error;
        return res;
    },
    deleteQuestion: async (id: any) => {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
    }
};

// SaaS Functions
export const registerSite = (data: any) => supabase.from('stores').insert([data]);
export const getSite = async (username: any) => {
    const { data, error } = await supabase.from('stores').select('*').eq('slug', username).single();
    if (error) throw error;
    return { data };
};
export const getQuestions = async (username: any) => {
    // First get the site id
    const { data: site, error: siteError } = await supabase.from('stores').select('id').eq('slug', username).single();
    if (siteError) throw siteError;
    
    const { data, error } = await supabase.from('questions').select('*').eq('store_id', site.id);
    if (error) throw error;
    return { data };
};
export const createQuestion = async (data: any) => {
    const { data: res, error } = await supabase.from('questions').insert([data]);
    if (error) throw error;
    return res;
};
export const deleteQuestion = async (id: any) => {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
};

const api = { get: () => {}, post: () => {} };
export default api;