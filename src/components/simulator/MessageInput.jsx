import { useState, useRef } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import VoiceRecorder from './VoiceRecorder';
import ImageAttachment from './ImageAttachment';

export default function MessageInput({ onSend }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim(), 'text');
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelected = (base64, metadata) => {
    onSend(base64, 'image', metadata);
    setShowImagePicker(false);
  };

  const handleVoiceRecorded = ({ base64, duration }) => {
    onSend(base64, 'audio', { mimeType: 'audio/webm;codecs=opus', duration });
  };

  return (
    <div className="bg-surface-800 border-t border-surface-400/50 px-4 py-3">
      {showImagePicker && (
        <ImageAttachment
          onSelect={handleImageSelected}
          onCancel={() => setShowImagePicker(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attach image */}
        <button
          type="button"
          onClick={() => setShowImagePicker(!showImagePicker)}
          className="p-2.5 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 bg-surface-700 rounded-xl border border-surface-400/50 focus-within:border-accent/40 transition-colors">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('input.placeholder')}
            rows={1}
            className="w-full bg-transparent px-4 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 resize-none focus:outline-none max-h-32"
            style={{ minHeight: '40px' }}
          />
        </div>

        {/* Voice recorder or send */}
        {text.trim() ? (
          <button
            type="submit"
            className="send-btn p-2.5 rounded-lg bg-accent text-surface-900 hover:bg-accent-hover transition-all shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        ) : (
          <VoiceRecorder onRecorded={handleVoiceRecorded} />
        )}
      </form>
    </div>
  );
}
