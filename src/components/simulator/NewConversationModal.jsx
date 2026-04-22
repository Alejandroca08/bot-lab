import { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function NewConversationModal({ isOpen, onClose, onCreate }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const generatePhone = () => `+57${Date.now().toString().slice(-10)}`;

  const handleCreate = () => {
    const customerName = name.trim() || `Prueba ${Date.now().toString().slice(-4)}`;
    const phone = generatePhone();
    onCreate(phone, customerName);
    setName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-800 border border-surface-400 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-400/50">
          <h3 className="font-mono text-sm uppercase tracking-wider text-accent">{t('newConv.title')}</h3>
          <button onClick={onClose} className="p-1 rounded text-surface-300 hover:text-surface-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <label className="block text-xs font-mono uppercase tracking-wider text-surface-200 mb-2">
            {t('newConv.label')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('newConv.placeholder')}
            autoFocus
            className="w-full bg-surface-700 border border-surface-400 rounded-lg px-4 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent/40"
          />
          <p className="text-[10px] text-surface-300 mt-1.5">
            {t('newConv.hint')}
          </p>

          <div className="flex justify-end gap-2 mt-5">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-surface-200 hover:text-surface-50 hover:bg-surface-700 transition-all">
              {t('newConv.cancel')}
            </button>
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-lg bg-accent text-surface-900 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-accent-hover transition-all"
            >
              {t('newConv.create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
