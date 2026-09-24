import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { SkipLink } from '../common/SkipLink';
import { FloatingHealthWiseAI } from '../chat/FloatingHealthWiseAI';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  // Chat page might use a custom full-height viewport layout without footer
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Keyboard accessible skip-to-content */}
      <SkipLink targetId="main-content" label="Skip to main content" />

      {/* Top medical disclaimer bar */}
      <DisclaimerBanner variant="banner" dismissible={false} />

      {/* Main Header */}
      <Header />

      {/* Main Body with accessibility landmark */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      {/* Footer (omitted on chat page for app-like chat height) */}
      {!isChatPage && <Footer />}

      {/* Global Floating HealthWise AI Assistant */}
      <FloatingHealthWiseAI />

      {/* Bottom bar for mobile phones */}
      <MobileNav />
    </div>
  );
};

