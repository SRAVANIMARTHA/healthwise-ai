import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  Globe,
  FileCheck,
  BarChart3,
  MessageSquareHeart,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();

  const adminLinks = [
    { to: '/admin', label: t('admin', 'dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/knowledge', label: t('admin', 'knowledgeBase'), icon: Database },
    { to: '/admin/sources', label: t('admin', 'sources'), icon: Globe },
    { to: '/admin/reviews', label: t('admin', 'contentReview'), icon: FileCheck },
    { to: '/admin/analytics', label: t('admin', 'analytics'), icon: BarChart3 },
    { to: '/admin/feedback', label: t('admin', 'feedback'), icon: MessageSquareHeart },
    { to: '/admin/safety-logs', label: t('admin', 'safetyLogs'), icon: ShieldAlert },
    { to: '/admin/settings', label: t('admin', 'settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 sm:p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">HealthWise</span>
                <span className="text-[10px] text-teal-400 block font-semibold uppercase tracking-wider">{t('admin', 'adminPortal')}</span>
              </div>
            </div>
            <Link to="/" className="text-slate-400 hover:text-white p-1" title={t('admin', 'backToApp')}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500">
          <p>{t('admin', 'superAdminRole')}</p>
          <p className="text-[10px] text-slate-600 mt-1">{t('admin', 'rlsEnforced')}</p>
        </div>
      </aside>

      {/* Main Admin Workspace View */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
