import { useTranslation } from '../../contexts/LanguageContext';

export default function ProjectList({ projects, activeProjectId, onSelect, onEdit, onDelete }) {
  const { t } = useTranslation();
  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-surface-400 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">{t('projects.none')}</h3>
        <p className="text-sm text-surface-300">{t('projects.noneDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`group bg-surface-800 border rounded-xl p-5 transition-all duration-150 cursor-pointer
            ${project.id === activeProjectId
              ? 'border-accent/40 bg-accent/5'
              : 'border-surface-400/50 hover:border-surface-300'
            }`}
          onClick={() => onSelect(project.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-semibold text-surface-50 truncate">{project.name}</h3>
                {project.id === activeProjectId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-accent/15 text-accent border border-accent/20">
                    {t('projects.active')}
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-300 font-mono mb-3">{t('projects.agent')}: {project.clientName}</p>
              <div className="flex items-center gap-4 text-[11px] text-surface-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                  {project.webhookFormat.toUpperCase()}
                </span>
                <span className="truncate max-w-[300px]">{project.webhookUrl}</span>
              </div>

            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                className="p-2 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm(t('projects.confirmDelete'))) onDelete(project.id); }}
                className="p-2 rounded-lg text-surface-300 hover:text-danger hover:bg-danger/10 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
