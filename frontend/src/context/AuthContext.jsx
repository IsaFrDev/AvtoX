import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check for Local Session
        const localAdmin = localStorage.getItem('local_admin_session');
        if (localAdmin) {
            setUser(JSON.parse(localAdmin));
            setLoading(false);
            return;
        }

        // 2. Check Real Supabase Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                fetchProfile(session.user);
            } else {
                if (!localStorage.getItem('local_admin_session')) {
                    setUser(null);
                }
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            if (!data) {
                console.warn("User profile not found. Attempting fallback...");
                // Note: The handle_new_user trigger in Supabase should ideally create the profile.
                // But we provide a fallback for safety.
                const updates = {
                    id: authUser.id,
                    username: authUser.user_metadata?.username || authUser.email?.split('@')[0],
                    first_name: authUser.user_metadata?.first_name || '',
                    last_name: authUser.user_metadata?.last_name || '',
                    limit_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    is_admin: authUser.user_metadata?.is_admin || false,
                };
                
                // We don't force-create here to avoid 400 if store_id is required but missing.
                // Instead, we set the auth user as a temporary state.
                setUser({ id: authUser.id, ...updates });
                return;
            }

            if (error) throw error;
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setUser({ id: authUser.id, email: authUser.email, ...authUser.user_metadata });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        // Custom Login (for users created by school admins)
        try {
            const loginInput = email.includes('@') ? email.split('@')[0] : email;

            const { data: userProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', loginInput)
                .eq('password', password)
                .maybeSingle();

            if (profileError) throw profileError;

            if (userProfile) {
                if (userProfile.limit_date && new Date() > new Date(userProfile.limit_date)) {
                    return { success: false, message: `Hisobingiz muddati tugagan. Admin bilan bog'laning.` };
                }
                localStorage.setItem('local_admin_session', JSON.stringify(userProfile));
                setUser(userProfile);
                return { success: true, user: userProfile };
            }

            // If not custom user, try Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.includes('@') ? email : `${email}@savdoon.local`,
                password,
            });

            if (error) return { success: false, message: "Login yoki parol noto'g'ri" };
            return { success: true, user: data.user };

        } catch (err) {
            return { success: false, message: "Xatolik: " + err.message };
        }
    };

    const logout = async () => {
        localStorage.removeItem('local_admin_session');
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
