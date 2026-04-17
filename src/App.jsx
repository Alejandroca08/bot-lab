import { ProjectProvider } from './contexts/ProjectContext';
import { ConversationProvider } from './contexts/ConversationContext';
import MainLayout from './components/layout/MainLayout';

export default function App() {
  return (
    <ProjectProvider>
      <ConversationProvider>
        <MainLayout />
      </ConversationProvider>
    </ProjectProvider>
  );
}
