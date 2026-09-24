import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, BookOpen, ShieldAlert, User, Activity } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/diseases', label: 'Diseases', icon: Activity },
    { to: '/chat', label: 'AI Chat', icon: MessageSquare, highlight: true },
    { to: '/resources', label: 'Resources', icon: BookOpen },
    { to: '/dashboard', label: 'Account', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-teal-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              } ${item.highlight ? 'relative -top-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {item.highlight ? (
                  <div className={`p-2.5 rounded-full shadow-md transition-transform ${
                    isActive ? 'bg-teal-700 text-white scale-105' : 'bg-teal-600 text-white'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span className={item.highlight ? 'mt-0.5' : ''}>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
