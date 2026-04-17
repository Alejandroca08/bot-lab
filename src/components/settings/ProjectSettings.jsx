import { useState, useContext } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

export default function ProjectSettings() {
  const { projects, activeProject, addProject, updateProject, deleteProject, setActiveProjectId } = useContext(ProjectContext);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (projectData) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      const newProject = addProject(projectData);
      setActiveProjectId(newProject.id);
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-mono text-lg font-bold text-surface-50 tracking-wider uppercase">Projects</h2>
            <p className="text-sm text-surface-200 mt-1">Configure your WhatsApp bot projects and webhook endpoints</p>
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
              New Project
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
