import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Primary Pages
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';

// Lazy Loaded Secondary & Heavy Pages
const DiseasesPage = lazy(() => import('./pages/DiseasesPage').then(m => ({ default: m.DiseasesPage })));
const DiseaseDetailPage = lazy(() => import('./pages/DiseaseDetailPage').then(m => ({ default: m.DiseaseDetailPage })));
const PreventionPage = lazy(() => import('./pages/PreventionPage').then(m => ({ default: m.PreventionPage })));
const VaccinationPage = lazy(() => import('./pages/VaccinationPage').then(m => ({ default: m.VaccinationPage })));
const HealthyHabitsPage = lazy(() => import('./pages/HealthyHabitsPage').then(m => ({ default: m.HealthyHabitsPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const ReportExplainerPage = lazy(() => import('./pages/ReportExplainerPage').then(m => ({ default: m.ReportExplainerPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// User Dashboard Pages (Protected)
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ChatHistoryPage = lazy(() => import('./pages/ChatHistoryPage').then(m => ({ default: m.ChatHistoryPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then(m => ({ default: m.BookmarksPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Admin Portal Pages (Protected Admin Only)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const KnowledgeBasePage = lazy(() => import('./pages/admin/KnowledgeBasePage').then(m => ({ default: m.KnowledgeBasePage })));
const SourcesPage = lazy(() => import('./pages/admin/SourcesPage').then(m => ({ default: m.SourcesPage })));
const ContentReviewPage = lazy(() => import('./pages/admin/ContentReviewPage').then(m => ({ default: m.ContentReviewPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const FeedbackPage = lazy(() => import('./pages/admin/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const SafetyLogsPage = lazy(() => import('./pages/admin/SafetyLogsPage').then(m => ({ default: m.SafetyLogsPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Accessible fallback spinner
const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[40vh]" role="status" aria-label="Loading page">
    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="sr-only">Loading content...</span>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Main Application with Header, Footer, Disclaimer, and Mobile Nav */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:sessionId" element={<ChatPage />} />
          <Route path="diseases" element={<DiseasesPage />} />
          <Route path="diseases/:slug" element={<DiseaseDetailPage />} />
          <Route path="prevention" element={<PreventionPage />} />
          <Route path="vaccination" element={<VaccinationPage />} />
          <Route path="healthy-habits" element={<HealthyHabitsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="report" element={<ReportExplainerPage />} />
          <Route path="about" element={<AboutPage />} />

          {/* User Portal (Protected via Supabase Auth) */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat-history"
            element={
              <ProtectedRoute>
                <ChatHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookmarks"
            element={
              <ProtectedRoute>
                <BookmarksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Authentication & Legal */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dedicated Admin Portal (Protected: Requires Admin Role) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="knowledge" element={<KnowledgeBasePage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="reviews" element={<ContentReviewPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="safety-logs" element={<SafetyLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
