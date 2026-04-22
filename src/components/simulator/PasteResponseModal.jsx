import { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function PasteResponseModal({ isOpen, onClose, onPaste }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [mode, setMode] = useState('text'); // 'text' or 'json'

  if (!isOpen) return null;

  const handlePaste = () => {
    if (!text.trim()) return;

    if (mode === 'json') {
      try {
        const parsed = JSON.parse(text);
        // Try to extract the message body from various YCloud response formats
        const body =
          parsed?.whatsappMessage?.text?.body ||
          parsed?.text?.body ||
          parsed?.body ||
          parsed?.message?.text ||
          parsed?.message ||
          JSON.stringify(parsed, null, 2);
        onPaste(typeof body === 'string' ? body : JSON.stringify(body));
      } catch {
        onPaste(text.trim());
      }
    } else {
      onPaste(text.trim());
    }

    setText('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-800 border border-surface-400 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-400/50">
          <h3 className="font-mono text-sm uppercase tracking-wider text-accent">{t('paste.title')}</h3>
          <button onClick={onClose} className="p-1 rounded text-surface-300 hover:text-surface-50 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* Mode toggle */}
          <div className="flex gap-1 mb-3 bg-surface-700 rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all
                ${mode === 'text' ? 'bg-surface-500 text-surface-50' : 'text-surface-300 hover:text-surface-50'}`}
            >
              {t('paste.plainText')}
            </button>
            <button
              onClick={() => setMode('json')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all
                ${mode === 'json' ? 'bg-surface-500 text-surface-50' : 'text-surface-300 hover:text-surface-50'}`}
            >
              {t('paste.json')}
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === 'json' ? t('paste.jsonPlaceholder') : t('paste.textPlaceholder')}
            rows={8}
            className={`w-full bg-surface-700 border border-surface-400 rounded-lg px-4 py-3 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent/40 resize-none ${mode === 'json' ? 'font-mono text-xs' : ''}`}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-surface-200 hover:text-surface-50 hover:bg-surface-700 transition-all">
              {t('paste.cancel')}
            </button>
            <button
              onClick={handlePaste}
              disabled={!text.trim()}
              className="px-5 py-2 rounded-lg bg-accent text-surface-900 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-accent-hover transition-all disabled:opacity-40"
            >
              {t('paste.add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
