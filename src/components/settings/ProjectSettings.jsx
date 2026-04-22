import { useState, useContext } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

export default function ProjectSettings() {
  const { projects, activeProject, addProject, updateProject, deleteProject, setActiveProjectId } = useContext(ProjectContext);
  const { isAdmin } = useAuth();
  const { t } = useTranslation();
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (projectData) => {
    if (editingProject) {
      await updateProject(editingProject.id, projectData);
    } else {
      const newProject = await addProject(projectData);
      if (newProject) setActiveProjectId(newProject.id);
    }
    setShowForm(false);
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deleteProject(id);
    if (editingProject?.id === id) {
      setEditingProject(null);
      setShowForm(false);
    }
  };

  const handleNew = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  // Client role: read-only view of their assigned project
  if (!isAdmin) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="font-mono text-lg font-bold text-surface-50 tracking-wider uppercase">{t('projectInfo.title')}</h2>
            <p className="text-sm text-surface-200 mt-1">{t('projectInfo.subtitle')}</p>
          </div>
          {activeProject ? (
            <div className="bg-surface-800 border border-surface-400/50 rounded-xl p-6 space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-300 mb-1">{t('projectInfo.projectName')}</label>
                <p className="text-sm text-surface-50">{activeProject.name}</p>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-300 mb-1">{t('projectInfo.clientName')}</label>
                <p className="text-sm text-surface-50">{activeProject.clientName}</p>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-300 mb-1">{t('projectInfo.webhookUrl')}</label>
                <p className="text-sm text-surface-300 font-mono">{t('projectInfo.configuredByAdmin')}</p>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-300 mb-1">{t('projectInfo.webhookFormat')}</label>
                <p className="text-sm text-surface-50 font-mono">{activeProject.webhookFormat}</p>
              </div>
              {activeProject.agentPhoneNumber && (
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-300 mb-1">{t('projectInfo.agentPhone')}</label>
                  <p className="text-sm text-surface-50 font-mono">{activeProject.agentPhoneNumber}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">{t('projectInfo.noProject')}</h3>
              <p className="text-sm text-surface-300">{t('projectInfo.noProjectDesc')}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin role: full CRUD
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-mono text-lg font-bold text-surface-50 tracking-wider uppercase">{t('projects.title')}</h2>
            <p className="text-sm text-surface-200 mt-1">{t('projects.subtitle')}</p>
          </div>
          {!showForm && (
            <button
              onClick={handleNew}
              className="flex items-center gap-2 bg-accent text-surface-900 font-mono text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t('projects.new')}
            </button>
          )}
        </div>

        {showForm ? (
          <ProjectForm
            project={editingProject}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <ProjectList
            projects={projects}
            activeProjectId={activeProject?.id}
            onSelect={setActiveProjectId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
