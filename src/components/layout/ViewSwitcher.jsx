import { VIEWS } from '../../utils/constants';
import ProjectSettings from '../settings/ProjectSettings';
import ChatWindow from '../simulator/ChatWindow';
import TestLabView from '../testlab/TestLabView';
import ClientManager from '../admin/ClientManager';
import FeedbackDashboard from '../admin/FeedbackDashboard';

export default function ViewSwitcher({ activeView }) {
  switch (activeView) {
    case VIEWS.SETTINGS:
      return <ProjectSettings />;
    case VIEWS.SIMULATOR:
      return <ChatWindow />;
    case VIEWS.TESTLAB:
      return <TestLabView />;
    case VIEWS.CLIENTS:
      return <ClientManager />;
    case VIEWS.DASHBOARD:
      return <FeedbackDashboard />;
    default:
      return <ProjectSettings />;
  }
}
