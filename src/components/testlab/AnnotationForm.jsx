import { useState, useContext } from 'react';
import { ConversationContext } from '../../contexts/ConversationContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { ANNOTATION_CATEGORIES, ANNOTATION_SEVERITIES } from '../../utils/constants';
import { generateUUID } from '../../utils/idGenerators';

export default function AnnotationForm({ conversationId, messageId, onClose }) {
  const { addAnnotation } = useContext(ConversationContext);
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    category: '',
    severity: '',
    note: '',
    suggestion: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category || !form.severity || !form.note.trim()) return;

    addAnnotation(conversationId, messageId, {
      id: generateUUID(),
      messageId,
      category: form.category,
      severity: form.severity,
      note: form.note.trim(),
      suggestion: form.suggestion.trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    addToast(t('toast.annotationSaved'), 'success');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="ml-11 mr-8 mt-1 mb-2 p-3 bg-surface-700 rounded-xl border border-surface-400/50 animate-fade-in">
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-surface-200 mb-1">{t('annotation.category')}</label>
          <select
            value={form.category}
            onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-surface-600 border border-surface-400 rounded-lg px-2.5 py-2 text-xs text-surface-50 focus:outline-none focus:border-accent"
            required
          >
            <option value="">{t('annotation.selectCategory')}</option>
            {ANNOTATION_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-surface-200 mb-1">{t('annotation.severity')}</label>
          <div className="flex gap-1.5">
            {ANNOTATION_SEVERITIES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, severity: s.value }))}
                className={`flex-1 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all
                  ${form.severity === s.value
                    ? `border-current`
                    : 'border-surface-400 text-surface-300 hover:border-surface-300'
                  }`}
                style={form.severity === s.value ? { color: s.color, backgroundColor: s.color + '15' } : {}}
              >
                {t(s.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-surface-200 mb-1">{t('annotation.note')}</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
          placeholder={t('annotation.notePlaceholder')}
          rows={2}
          className="w-full bg-surface-600 border border-surface-400 rounded-lg px-2.5 py-2 text-xs text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent resize-none"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-surface-200 mb-1">{t('annotation.suggestion')}</label>
        <textarea
          value={form.suggestion}
          onChange={(e) => setForm(prev => ({ ...prev, suggestion: e.target.value }))}
          placeholder={t('annotation.suggestionPlaceholder')}
          rows={2}
          className="w-full bg-surface-600 border border-surface-400 rounded-lg px-2.5 py-2 text-xs text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider text-surface-300 hover:text-surface-50 transition-colors">
          {t('annotation.cancel')}
        </button>
        <button
          type="submit"
          disabled={!form.category || !form.severity || !form.note.trim()}
          className="px-4 py-1.5 rounded-lg bg-warning/15 text-warning text-[10px] font-mono uppercase tracking-wider font-semibold hover:bg-warning/25 transition-all disabled:opacity-30 border border-warning/20"
        >
          {t('annotation.add')}
        </button>
      </div>
    </form>
  );
}
