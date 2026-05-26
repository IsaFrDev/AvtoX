// @ts-nocheck
import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ProgressProvider } from '../context/ProgressContext';
import { SiteProvider } from '../context/SiteContext'; // Import
import Layout from '../components/Layout';
import Dashboard from '../original/Dashboard';
import QuizPage from '../original/QuizPage';
import ProfilePage from '../original/ProfilePage';
import AdminPanel from '../pages/AdminPanel';
import StatsPage from '../original/StatsPage';
import SettingsPage from '../original/SettingsPage';
import FAQPage from '../original/FAQPage';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import InstallPWA from '../components/InstallPWA';

const TenantContainer = () => {
  const { username } = useParams();

  return (
    <I18nextProvider i18n={i18n}>
      <SiteProvider>
        <AuthProvider>
          <SettingsProvider>
            <ProgressProvider>
              <ThemeProvider>
                <InstallPWA />
                <Routes>
                  <Route path="/" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/quiz" element={<Layout><QuizPage /></Layout>} />
                  <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
                  <Route path="/stats" element={<Layout><StatsPage /></Layout>} />
                  <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
                  <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
                  <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
                  <Route path="*" element={<Navigate to={`/${username}`} replace />} />
                </Routes>
              </ThemeProvider>
            </ProgressProvider>
          </SettingsProvider>
        </AuthProvider>
      </SiteProvider>
    </I18nextProvider>
  );
};

export default TenantContainer;
