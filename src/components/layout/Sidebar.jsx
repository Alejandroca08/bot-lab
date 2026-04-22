import { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { VIEWS } from '../../utils/constants';

const NAV_ITEMS = [
  { view: VIEWS.SETTINGS, labelKey: 'nav.projects', icon: SettingsIcon },
  { view: VIEWS.SIMULATOR, labelKey: 'nav.simulator', icon: ChatIcon },
  { view: VIEWS.TESTLAB, labelKey: 'nav.testlab', icon: TestLabIcon },
];

const ADMIN_NAV_ITEMS = [
  { view: VIEWS.CLIENTS, labelKey: 'nav.clients', icon: ClientsIcon },
  { view: VIEWS.DASHBOARD, labelKey: 'nav.dashboard', icon: DashboardIcon },
];

export default function Sidebar({ activeView, onViewChange }) {
  const { projects, activeProject, setActiveProjectId } = useContext(ProjectContext);
  const { signOut, profile } = useAuth();
  const { t, toggleLang } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to new annotations for badge count
  useEffect(() => {
    const channel = supabase
      .channel('sidebar-annotations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'annotations' },
        () => {
          if (activeView !== VIEWS.DASHBOARD) {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeView]);

  // Clear badge when navigating to dashboard
  useEffect(() => {
    if (activeView === VIEWS.DASHBOARD) {
      setUnreadCount(0);
    }
  }, [activeView]);

  return (
    <aside className="w-64 bg-surface-800 border-r border-surface-400/50 flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-400/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold text-surface-50 tracking-wider">BOTLAB</h1>
            <p className="text-[10px] text-surface-300 font-mono tracking-wider">{t('nav.adminPanel')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ view, labelKey, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${activeView === view
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-surface-200 hover:text-surface-50 hover:bg-surface-700 border border-transparent'
              }`}
          >
            <Icon active={activeView === view} />
            <span className="font-mono text-xs uppercase tracking-wider">{t(labelKey)}</span>
          </button>
        ))}

        {/* Admin-only nav items */}
        <div className="pt-3 mt-3 border-t border-surface-400/30">
          <p className="font-mono text-[10px] uppercase tracking-widest text-surface-300 px-3 mb-2">Admin</p>
          {ADMIN_NAV_ITEMS.map(({ view, labelKey, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${activeView === view
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-surface-200 hover:text-surface-50 hover:bg-surface-700 border border-transparent'
                }`}
            >
              <Icon active={activeView === view} />
              <span className="font-mono text-xs uppercase tracking-wider">{t(labelKey)}</span>
              {view === VIEWS.DASHBOARD && unreadCount > 0 && (
                <span className="ml-auto bg-severity-critical text-white text-[9px] font-mono font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Project selector */}
      <div className="px-3 mt-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-surface-300 px-1 mb-2">{t('nav.activeProject')}</p>
        {projects.length === 0 ? (
          <p className="text-xs text-surface-300 px-1">{t('nav.noProjects')}</p>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProjectId(project.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 group
                  ${project.id === activeProject?.id
                    ? 'bg-surface-600 text-surface-50 border border-surface-400'
                    : 'text-surface-200 hover:bg-surface-700 border border-transparent'
                  }`}
              >
                <span className="block font-medium truncate">{project.name}</span>
                <span className="block text-[10px] text-surface-300 font-mono mt-0.5 truncate">{project.clientName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with sign out */}
      <div className="mt-auto px-3 py-3 border-t border-surface-400/50 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-accent">
              {(profile?.name || 'A').charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-surface-200 truncate">{profile?.name || 'Admin'}</span>
          <button
            onClick={toggleLang}
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-700 text-surface-200 hover:text-surface-50 hover:bg-surface-600 border border-surface-400/50 transition-all"
          >
            {t('lang.toggle')}
          </button>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t('nav.signOut')}
        </button>
      </div>
    </aside>
  );
}

function SettingsIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#25D366' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChatIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#25D366' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TestLabIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#25D366' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ClientsIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#25D366' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DashboardIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? '#25D366' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
