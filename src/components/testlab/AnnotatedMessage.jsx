import { useState, useContext } from 'react';
import { ConversationContext } from '../../contexts/ConversationContext';
import { useTranslation } from '../../contexts/LanguageContext';
import AnnotationForm from './AnnotationForm';

export default function AnnotatedMessage({ message, conversationId, annotations }) {
  const { removeAnnotation } = useContext(ConversationContext);
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  const senderLabel = message.sender === 'customer' ? t('sender.customer') : message.sender === 'bot' ? t('sender.bot') : t('sender.agent');
  const senderColor = message.sender === 'customer' ? 'text-blue-400' : message.sender === 'bot' ? 'text-accent' : 'text-purple-400';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="group">
      <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${annotations.length > 0 ? 'bg-warning/5 border border-warning/10' : 'hover:bg-surface-800'}`}>
        {/* Sender indicator */}
        <div className="w-8 pt-1 shrink-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold
            ${message.sender === 'customer' ? 'bg-blue-500/15 text-blue-400' :
              message.sender === 'bot' ? 'bg-accent/15 text-accent' :
              'bg-purple-500/15 text-purple-400'}`}>
            {senderLabel[0]}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${senderColor}`}>{senderLabel}</span>
            <span className="text-[10px] text-surface-300 font-mono">{time}</span>
          </div>

          {message.type === 'text' && (
            <p className="text-sm text-surface-50 whitespace-pre-wrap break-words">{message.content}</p>
          )}
          {message.type === 'image' && (
            <div>
              <img src={message.content} alt="" className="rounded-lg max-h-32 object-cover" />
              {message.metadata?.caption && <p className="text-sm text-surface-100 mt-1">{message.metadata.caption}</p>}
            </div>
          )}
          {message.type === 'audio' && (
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-200">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              </svg>
              <span className="text-xs text-surface-200 font-mono">
                {t('annotatedMsg.voiceMemo')}{message.metadata?.duration ? ` (${Math.floor(message.metadata.duration)}s)` : ''}
              </span>
            </div>
          )}

          {/* Annotations */}
          {annotations.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {annotations.map((ann) => (
                <div key={ann.id} className="flex items-start gap-2 bg-surface-700/50 rounded-lg px-3 py-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0
                    ${ann.severity === 'critical' ? 'bg-severity-critical' :
                      ann.severity === 'medium' ? 'bg-severity-medium' : 'bg-severity-minor'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-surface-200">{ann.category.replace('_', ' ')}</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded
                        ${ann.severity === 'critical' ? 'bg-severity-critical/15 text-severity-critical' :
                          ann.severity === 'medium' ? 'bg-severity-medium/15 text-severity-medium' :
                          'bg-severity-minor/15 text-severity-minor'}`}>
                        {ann.severity}
                      </span>
                    </div>
                    <p className="text-xs text-surface-100">{ann.note}</p>
                    {ann.suggestion && (
                      <p className="text-xs text-accent/70 mt-1 italic">{t('annotatedMsg.suggestion') + ':'} {ann.suggestion}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeAnnotation(conversationId, ann.id)}
                    className="p-0.5 rounded text-surface-400 hover:text-danger transition-colors shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Annotate button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-1.5 rounded-lg transition-all shrink-0
            ${showForm ? 'bg-warning/15 text-warning' :
              annotations.length > 0 ? 'text-warning hover:bg-warning/10' :
              'text-surface-400 opacity-0 group-hover:opacity-100 hover:text-warning hover:bg-warning/10'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </button>
      </div>

      {showForm && (
        <AnnotationForm
          conversationId={conversationId}
          messageId={message.id}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
