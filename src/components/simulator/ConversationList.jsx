export default function ConversationList({ conversations, activeId, onSelect, onNew, onDelete, onClose }) {
  return (
    <div className="absolute z-20 top-0 left-0 right-0 bg-surface-800 border-b border-surface-400/50 shadow-xl animate-fade-in" style={{ position: 'relative' }}>
      <div className="px-4 py-3 border-b border-surface-400/50 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-surface-200">Conversations</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
          <button onClick={onClose} className="p-1 rounded text-surface-300 hover:text-surface-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-xs text-surface-300 px-4 py-4 text-center">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors group
                ${conv.id === activeId ? 'bg-surface-700' : 'hover:bg-surface-700/50'}`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-surface-50 truncate">{conv.customerName}</p>
                <p className="text-[10px] font-mono text-surface-300">
                  {conv.simulatedPhoneNumber} · {conv.messages.length} msgs
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${conv.botStatus === 'active' ? 'bg-accent' : 'bg-danger'}`} />
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this conversation?')) onDelete(conv.id); }}
                  className="p-1 rounded text-surface-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
