import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export const ProjectContext = createContext(null);

const STORAGE_KEYS = {
  projects: 'botlab_projects',
  activeProject: 'botlab_activeProject',
};

function generateUUID() {
  return crypto.randomUUID();
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() =>
    loadFromStorage(STORAGE_KEYS.projects, [])
  );
  const [activeProjectId, setActiveProjectIdState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.activeProject, null)
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const persistProjects = useCallback((next) => {
    setProjects(next);
    saveToStorage(STORAGE_KEYS.projects, next);
  }, []);

  const addProject = useCallback(
    (project) => {
      const now = new Date().toISOString();
      const newProject = {
        id: generateUUID(),
        name: project.name ?? '',
        clientName: project.clientName ?? '',
        webhookUrl: project.webhookUrl ?? '',
        webhookFormat: project.webhookFormat ?? 'ycloud',
        testPhoneNumbers: project.testPhoneNumbers ?? [],
        agentPhoneNumber: project.agentPhoneNumber ?? '',
        createdAt: now,
        updatedAt: now,
      };
      const next = [...projects, newProject];
      persistProjects(next);
      return newProject;
    },
    [projects, persistProjects]
  );

  const updateProject = useCallback(
    (id, updates) => {
      const next = projects.map((p) =>
        p.id === id
          ? { ...p, ...updates, id, updatedAt: new Date().toISOString() }
          : p
      );
      persistProjects(next);
    },
    [projects, persistProjects]
  );

  const deleteProject = useCallback(
    (id) => {
      const next = projects.filter((p) => p.id !== id);
      persistProjects(next);
      if (activeProjectId === id) {
        setActiveProjectIdState(null);
        saveToStorage(STORAGE_KEYS.activeProject, null);
      }
    },
    [projects, activeProjectId, persistProjects]
  );

  const setActiveProjectId = useCallback((id) => {
    setActiveProjectIdState(id);
    saveToStorage(STORAGE_KEYS.activeProject, id);
  }, []);

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      activeProject,
      addProject,
      updateProject,
      deleteProject,
      setActiveProjectId,
    }),
    [
      projects,
      activeProjectId,
      activeProject,
      addProject,
      updateProject,
      deleteProject,
      setActiveProjectId,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

export default ProjectContext;
