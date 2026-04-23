import { useState } from 'react';
import Sidebar from './Sidebar';
import ViewSwitcher from './ViewSwitcher';
import { VIEWS } from '../../utils/constants';

export default function MainLayout() {
  const [activeView, setActiveView] = useState(VIEWS.SETTINGS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-surface-900">
      {/* Mobile top bar */}
      <div className="md:hidden bg-surface-800 border-b border-surface-400/50 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-mono text-sm font-bold text-surface-50 tracking-wider">BOTLAB</span>
        </div>
      </div>

      <Sidebar
        activeView={activeView}
        onViewChange={(view) => { setActiveView(view); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-hidden">
        <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
      </main>
    </div>
  );
}
