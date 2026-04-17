import { VIEWS } from '../../utils/constants';
import ProjectSettings from '../settings/ProjectSettings';
import ChatWindow from '../simulator/ChatWindow';
import TestLabView from '../testlab/TestLabView';

export default function ViewSwitcher({ activeView }) {
  switch (activeView) {
    case VIEWS.SETTINGS:
      return <ProjectSettings />;
    case VIEWS.SIMULATOR:
      return <ChatWindow />;
    case VIEWS.TESTLAB:
      return <TestLabView />;
    default:
      return <ProjectSettings />;
  }
}
