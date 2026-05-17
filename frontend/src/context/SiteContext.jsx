import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
    const { username } = useParams();
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            if (!username) {
                setLoading(false);
                return;
            }

            try {
                // Fetch store from 'stores' table where slug matches username
                const { data, error } = await supabase
                    .from('stores')
                    .select('*')
                    .eq('slug', username)
                    .maybeSingle();

                if (error) throw error;
                
                if (data) {
                    setSiteData(data);
                    // DYNAMIC TITLE UPDATE
                    if (data.name) {
                        document.title = data.name;
                    }
                    // DYNAMIC FAVICON UPDATE (uses logo_url if present, or fallback from theme_config)
                    const logo = data.logo_url || data.store_files?.logo;
                    if (logo) {
                        let link = document.querySelector("link[rel~='icon']");
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'icon';
                            document.getElementsByTagName('head')[0].appendChild(link);
                        }
                        link.href = logo;
                    }
                }
            } catch (err) {
                console.error("Store fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, [username]);

    return (
        <SiteContext.Provider value={siteData}>
            {!loading && children}
        </SiteContext.Provider>
    );
};

export const useSite = () => useContext(SiteContext);
