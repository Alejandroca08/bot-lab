import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useTranslation } from '../../contexts/LanguageContext';

export default function VoiceRecorder({ onRecorded }) {
  const { t } = useTranslation();
  const { isRecording, duration, startRecording, stopRecording } = useVoiceRecorder();

  const handleMouseDown = async () => {
    await startRecording();
  };

  const handleMouseUp = async () => {
    if (!isRecording) return;
    const result = await stopRecording();
    if (result) {
      onRecorded(result);
    }
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(Math.floor(sec % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20">
        <div className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse-recording" />
        <span className="text-xs font-mono text-danger">{formatDuration(duration)}</span>
        <button
          onMouseUp={handleMouseUp}
          onClick={handleMouseUp}
          className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      className="p-2.5 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all shrink-0"
      title={t('voice.holdToRecord')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
