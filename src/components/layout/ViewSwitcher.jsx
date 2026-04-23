import { VIEWS } from '../../utils/constants';
import ProjectSettings from '../settings/ProjectSettings';
import ChatWindow from '../simulator/ChatWindow';
import TestLabView from '../testlab/TestLabView';
import ClientManager from '../admin/ClientManager';
import FeedbackDashboard from '../admin/FeedbackDashboard';

function getView(activeView, onViewChange) {
  switch (activeView) {
    case VIEWS.SETTINGS:
      return <ProjectSettings />;
    case VIEWS.SIMULATOR:
      return <ChatWindow />;
    case VIEWS.TESTLAB:
      return <TestLabView />;
    case VIEWS.CLIENTS:
      return <ClientManager onViewChange={onViewChange} />;
    case VIEWS.DASHBOARD:
      return <FeedbackDashboard />;
    default:
      return <ProjectSettings />;
  }
}

export default function ViewSwitcher({ activeView, onViewChange }) {
  return (
    <div key={activeView} className="h-full animate-view-enter">
      {getView(activeView, onViewChange)}
    </div>
  );
}
