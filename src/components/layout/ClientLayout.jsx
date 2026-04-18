import { useState, useContext } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectContext } from '../../contexts/ProjectContext';
import { VIEWS } from '../../utils/constants';
import ViewSwitcher from './ViewSwitcher';

const CLIENT_VIEWS = [
  { view: VIEWS.SIMULATOR, label: 'Simulator' },
  { view: VIEWS.TESTLAB, label: 'Test Lab' },
];

export default function ClientLayout() {
  const { profile, signOut } = useAuth();
  const { activeProject } = useContext(ProjectContext);
  const [activeView, setActiveView] = useState(VIEWS.SIMULATOR);

  return (
    <div className="flex flex-col h-screen bg-surface-900">
      {/* Top bar */}
      <header className="bg-surface-800 border-b border-surface-400/50 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="font-mono text-xs font-bold text-surface-50 tracking-wider">BOTLAB</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-surface-400/50" />

          {/* Project name */}
          {activeProject && (
            <span className="text-sm text-surface-100">{activeProject.name}</span>
          )}

          {/* View tabs */}
          <div className="flex gap-1 bg-surface-700 rounded-lg p-0.5 ml-4">
            {CLIENT_VIEWS.map(({ view, label }) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all
                  ${activeView === view
                    ? 'bg-accent/15 text-accent'
                    : 'text-surface-300 hover:text-surface-50'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-surface-300">{profile?.name}</span>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <ViewSwitcher activeView={activeView} />
      </main>
    </div>
  );
}
