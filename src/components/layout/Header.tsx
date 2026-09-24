import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  MessageSquare,
  Globe,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  Bookmark,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { language, t, setLanguage, languages } = useTranslation();

  // Refs for dropdown containers and trigger buttons (outside-click & focus restoration)
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);

  // Close all dropdowns and reset search input
  const closeAllDropdowns = useCallback(() => {
    setLangMenuOpen(false);
    setUserMenuOpen(false);
    setLangSearch('');
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    closeAllDropdowns();
    setMobileMenuOpen(false);
  }, [location.pathname, location.search, closeAllDropdowns]);

  // Outside-click handler — uses pointerdown so it covers both mouse and touch
  useEffect(() => {
    if (!langMenuOpen && !userMenuOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (langMenuOpen && langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false);
        setLangSearch('');
      }
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, [langMenuOpen, userMenuOpen]);

  // Escape key handler — close open dropdown or mobile drawer and restore focus to the trigger button
  useEffect(() => {
    if (!langMenuOpen && !userMenuOpen && !mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (langMenuOpen) {
        setLangMenuOpen(false);
        setLangSearch('');
        langBtnRef.current?.focus();
      } else if (userMenuOpen) {
        setUserMenuOpen(false);
        userBtnRef.current?.focus();
      } else if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [langMenuOpen, userMenuOpen, mobileMenuOpen]);

  // Mutual-exclusivity openers — opening one dropdown always closes the other and mobile menu
  const openLangMenu = useCallback(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setLangMenuOpen(prev => !prev);
    setLangSearch('');
  }, []);

  const openUserMenu = useCallback(() => {
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
    setLangSearch('');
    setUserMenuOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setLangMenuOpen(false);
    setUserMenuOpen(false);
    setLangSearch('');
    setMobileMenuOpen(prev => !prev);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const filteredLanguages = languages.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );
  const verifiedLanguages = filteredLanguages.filter((l) => l.isReviewed);
  const aiLanguages = filteredLanguages.filter((l) => !l.isReviewed);

  const navLinks = [
    { name: t('nav', 'home'), path: '/' },
    { name: t('nav', 'chat'), path: '/chat', highlight: true },
    { name: t('nav', 'diseases'), path: '/diseases' },
    { name: t('nav', 'prevention'), path: '/prevention' },
    { name: t('nav', 'vaccination'), path: '/vaccination' },
    { name: t('nav', 'healthyHabits'), path: '/healthy-habits' },
    { name: t('nav', 'explainReport'), path: '/report' },
    { name: t('nav', 'resources'), path: '/resources' },
    { name: t('nav', 'about'), path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:bg-teal-700 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">HealthWise</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal hidden sm:block">Public Health Awareness</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-teal-700 bg-teal-50/80 font-semibold'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                  } ${link.highlight ? 'text-teal-600 font-semibold' : ''}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions (Language + User Profile / Login) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Picker */}
            <div className="relative" ref={langMenuRef}>
              <button
                ref={langBtnRef}
                onClick={openLangMenu}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                aria-label={t('nav', 'selectLanguage')}
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLang.nativeName}</span>
                {currentLang.isReviewed ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified"></span>
                ) : (
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded font-semibold">AI</span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 pb-2 border-b border-slate-100">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        placeholder="Search 22 languages..."
                        className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {/* Verified & Reviewed section */}
                    {verifiedLanguages.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified & Reviewed ({verifiedLanguages.length})</span>
                        </div>
                        {verifiedLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                              language === lang.code
                                ? 'bg-teal-50 text-teal-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{lang.nativeName}</span>
                              <span className="text-[11px] text-slate-400">({lang.name})</span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                              Verified
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI-Supported section */}
                    {aiLanguages.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>AI-Supported ({aiLanguages.length})</span>
                        </div>
                        {aiLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                              language === lang.code
                                ? 'bg-teal-50 text-teal-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{lang.nativeName}</span>
                              <span className="text-[11px] text-slate-400">({lang.name})</span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              AI
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredLanguages.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No languages matching "{langSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Menu or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  ref={userBtnRef}
                  onClick={openUserMenu}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800"
                  aria-label="User account menu"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{user.fullName || user.email.split('@')[0]}</span>
                  {isAdmin && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 text-xs" role="menu">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.fullName || 'User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('nav', 'dashboard')}</span>
                    </Link>

                    <Link
                      to="/bookmarks"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      role="menuitem"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('nav', 'bookmarks')}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-purple-700 hover:bg-purple-50 font-semibold transition-colors"
                        role="menuitem"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{t('nav', 'admin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                      role="menuitem"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('nav', 'profile')}</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav', 'signOut')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-medium text-slate-600 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t('nav', 'signIn')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              size="sm"
              variant="outline"
              className="px-2.5 sm:hidden"
              onClick={() => navigate('/chat')}
              aria-label="Quick Chat"
            >
              <MessageSquare className="w-4 h-4 text-teal-600" />
            </Button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          {isAuthenticated && user && (
            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">{user.fullName || 'User'}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
              </div>
              {isAdmin && (
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t('nav', 'dashboard')}
                </Link>
                <Link
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t('nav', 'bookmarks')}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50"
                  >
                    {t('nav', 'admin')}
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="px-1 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> {t('nav', 'selectLanguage')}
                </span>
                <span className="text-[11px] text-slate-400">22 Languages</span>
              </div>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <optgroup label="Verified & Reviewed">
                  {languages.filter(l => l.isReviewed).map(l => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name}) — Verified
                    </option>
                  ))}
                </optgroup>
                <optgroup label="AI-Supported World Languages">
                  {languages.filter(l => !l.isReviewed).map(l => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name}) — AI-Supported
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="pt-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  {t('nav', 'signOut')}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    {t('nav', 'signIn')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/chat');
                    }}
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                  >
                    {t('chat', 'title')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
