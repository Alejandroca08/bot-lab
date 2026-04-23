import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { restQuery } from '../lib/supabase';
import { AuthContext } from './AuthContext';

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const auth = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectIdState] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = auth?.session?.access_token;

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  // Load projects based on role
  useEffect(() => {
    if (!auth?.profile) {
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      setLoading(true);

      if (auth.isAdmin) {
        const { data, error } = await restQuery(
          '/rest/v1/projects?select=*&order=created_at.desc',
          {},
          token
        );

        if (!error && data) {
          setProjects(data.map(normalizeProject));
          if (data.length > 0 && !activeProjectId) {
            setActiveProjectIdState(data[0].id);
          }
        }
      } else {
        if (auth.profile.project_id) {
          const { data, error } = await restQuery(
            `/rest/v1/projects?id=eq.${auth.profile.project_id}&select=*`,
            { single: true },
            token
          );

          if (!error && data) {
            const normalized = normalizeProject(data);
            setProjects([normalized]);
            setActiveProjectIdState(normalized.id);
          }
        }
      }

      setLoading(false);
    };

    loadProjects();
  }, [auth?.profile, auth?.isAdmin, token]);

  const addProject = useCallback(async (project) => {
    const row = {
      name: project.name,
      client_name: project.clientName,
      webhook_url: project.webhookUrl,
      webhook_format: project.webhookFormat || 'ycloud',
      agent_phone_number: project.agentPhoneNumber || '',
      created_by: auth?.session?.user?.id,
    };

    const { data, error } = await restQuery(
      '/rest/v1/projects?select=*',
      { method: 'POST', body: row, prefer: 'return=representation', single: true },
      token
    );

    if (error) {
      alert('Failed to create project. Please try again.');
      return null;
    }

    const newProject = normalizeProject(data);
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, [auth?.session, token]);

  const updateProject = useCallback(async (id, updates) => {
    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.clientName !== undefined) row.client_name = updates.clientName;
    if (updates.webhookUrl !== undefined) row.webhook_url = updates.webhookUrl;
    if (updates.webhookFormat !== undefined) row.webhook_format = updates.webhookFormat;
    if (updates.agentPhoneNumber !== undefined) row.agent_phone_number = updates.agentPhoneNumber;
    row.updated_at = new Date().toISOString();

    const { error } = await restQuery(
      `/rest/v1/projects?id=eq.${id}`,
      { method: 'PATCH', body: row, prefer: 'return=minimal' },
      token
    );

    if (error) {
      // Failed to update project
      return;
    }

    setProjects((prev) =>
      prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: row.updated_at } : p)
    );
  }, [token]);

  const deleteProject = useCallback(async (id) => {
    const { error } = await restQuery(
      `/rest/v1/projects?id=eq.${id}`,
      { method: 'DELETE' },
      token
    );

    if (error) {
      // Failed to delete project
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectIdState(null);
    }
  }, [activeProjectId, token]);

  const setActiveProjectId = useCallback((id) => {
    setActiveProjectIdState(id);
  }, []);

  const value = useMemo(() => ({
    projects,
    activeProjectId,
    activeProject,
    loading,
    addProject,
    updateProject,
    deleteProject,
    setActiveProjectId,
  }), [projects, activeProjectId, activeProject, loading, addProject, updateProject, deleteProject, setActiveProjectId]);

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

function normalizeProject(row) {
  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    webhookUrl: row.webhook_url,
    webhookFormat: row.webhook_format,
    agentPhoneNumber: row.agent_phone_number || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
