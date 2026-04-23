import { formatConversationJSON, formatConversationMarkdown, formatAnnotationsSummary } from '../../utils/exportFormatters';
import { useTranslation } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';

export default function ExportOptions({ conversation, onClose }) {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const handleExportJSON = () => {
    const json = formatConversationJSON(conversation);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `botlab-${conversation.customerName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(t('toast.exportReady'), 'success');
  };

  const handleCopyMarkdown = async () => {
    const md = formatConversationMarkdown(conversation);
    await navigator.clipboard.writeText(md);
    addToast(t('toast.copiedClipboard'), 'success');
  };

  const handleCopySummary = async () => {
    const summary = formatAnnotationsSummary(conversation);
    await navigator.clipboard.writeText(summary);
    addToast(t('toast.copiedClipboard'), 'success');
  };

  return (
    <div className="bg-surface-800 border-b border-surface-400/50 px-6 py-3 flex items-center gap-3 animate-fade-in">
      <span className="text-[10px] font-mono uppercase tracking-wider text-surface-300 mr-2">{t('export.label')}</span>

      <button
        onClick={handleExportJSON}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-surface-700 text-surface-200 hover:text-surface-50 border border-surface-400/50 transition-all"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {t('export.json')}
      </button>

      <button
        onClick={handleCopyMarkdown}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-surface-700 text-surface-200 hover:text-surface-50 border border-surface-400/50 transition-all"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {t('export.markdown')}
      </button>

      <button
        onClick={handleCopySummary}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-surface-700 text-surface-200 hover:text-surface-50 border border-surface-400/50 transition-all"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {t('export.summary')}
      </button>

      <button onClick={onClose} className="ml-auto p-1 rounded text-surface-400 hover:text-surface-50 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
