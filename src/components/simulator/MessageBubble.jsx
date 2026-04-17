import { useRef } from 'react';

export default function MessageBubble({ message, annotationCount }) {
  const { sender, type, content, timestamp, status, metadata } = message;
  const isOutgoing = sender === 'customer';
  const isAgent = sender === 'agent';
  const isBot = sender === 'bot';
  const audioRef = useRef(null);

  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // System-style banner for reactivation keyword
  if (isAgent && content === 'Listo✅') {
    return (
      <div className="flex justify-center my-3 animate-fade-in">
        <div className="bg-accent/10 border border-accent/20 text-accent text-xs font-mono px-4 py-2 rounded-full">
          {message.metadata?.agentName || 'Agent'} reactivó el bot — {time}
        </div>
      </div>
    );
  }

  const bubbleColor = isOutgoing
    ? 'bg-bubble-outgoing'
    : isAgent
      ? 'bg-bubble-agent'
      : 'bg-bubble-incoming';

  const alignment = isOutgoing ? 'justify-end' : 'justify-start';
  const animClass = isOutgoing ? 'animate-slide-in-right' : 'animate-slide-in-left';
  const tailSide = isOutgoing ? 'right-[-6px]' : 'left-[-6px]';
  const tailColor = isOutgoing
    ? 'border-l-bubble-outgoing'
    : isAgent
      ? 'border-l-bubble-agent'
      : 'border-l-bubble-incoming';

  return (
    <div className={`flex ${alignment} mb-1.5 ${animClass}`}>
      <div className={`relative max-w-[65%] ${bubbleColor} rounded-xl px-3 py-2 shadow-md`}>
        {/* Sender label for bot/agent */}
        {(isBot || isAgent) && (
          <p className={`text-[10px] font-mono font-semibold mb-1 ${isAgent ? 'text-purple-300' : 'text-accent'}`}>
            {isAgent ? (metadata?.agentName || 'Agent') : 'Bot'}
          </p>
        )}

        {/* Content */}
        {type === 'text' && (
          <p className="text-[13px] text-white/90 leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        )}

        {type === 'image' && (
          <div>
            <img
              src={content.startsWith('data:') ? content : content}
              alt={metadata?.caption || 'Image'}
              className="rounded-lg max-w-full max-h-[300px] object-cover mb-1"
            />
            {metadata?.caption && (
              <p className="text-[13px] text-white/90 mt-1">{metadata.caption}</p>
            )}
          </div>
        )}

        {type === 'audio' && (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (audioRef.current.paused) audioRef.current.play();
                  else audioRef.current.pause();
                }
              }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
            <div className="flex-1">
              <div className="flex gap-0.5 items-end h-5">
                {Array.from({ length: 28 }, (_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-white/30"
                    style={{ height: `${Math.random() * 100}%`, minHeight: '2px' }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-white/50 font-mono mt-0.5">
                {metadata?.duration ? `${Math.floor(metadata.duration / 60)}:${String(Math.floor(metadata.duration % 60)).padStart(2, '0')}` : '0:00'}
              </p>
            </div>
            <audio ref={audioRef} src={content} preload="metadata" />
          </div>
        )}

        {/* Time + status */}
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-white/40">{time}</span>
          {isOutgoing && <StatusTick status={status} />}
          {annotationCount > 0 && (
            <span className="ml-1 w-4 h-4 rounded-full bg-warning/20 text-warning text-[9px] font-mono flex items-center justify-center">
              {annotationCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusTick({ status }) {
  if (status === 'sending') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="tick-sent">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }
  if (status === 'sent') {
    return (
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="tick-sent">
        <path d="M1 6l4 4L14 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'delivered') {
    return (
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="tick-delivered">
        <path d="M1 6l4 4L14 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6l4 4L19 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'read') {
    return (
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="tick-read">
        <path d="M1 6l4 4L14 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6l4 4L19 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-danger">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    );
  }
  return null;
}
