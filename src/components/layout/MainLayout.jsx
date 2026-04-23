import { useState } from 'react';
import Sidebar from './Sidebar';
import ViewSwitcher from './ViewSwitcher';
import { VIEWS } from '../../utils/constants';

export default function MainLayout() {
  const [activeView, setActiveView] = useState(VIEWS.SETTINGS);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-hidden">
        <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
      </main>
    </div>
  );
}
