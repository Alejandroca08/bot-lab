import { useContext, useState } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { ConversationContext } from '../../contexts/ConversationContext';
import AnnotatedMessage from './AnnotatedMessage';
import ConversationSummary from './ConversationSummary';
import ExportOptions from './ExportOptions';

export default function TestLabView() {
  const { activeProject } = useContext(ProjectContext);
  const { conversations, activeConversation, setActiveConversationId, getConversationsForProject } = useContext(ConversationContext);
  const [showExport, setShowExport] = useState(false);

  const projectConversations = activeProject ? getConversationsForProject(activeProject.id) : [];

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">No Project Selected</h3>
          <p className="text-sm text-surface-300">Select a project first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-surface-800 border-b border-surface-400/50 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-mono text-sm font-bold text-surface-50 tracking-wider uppercase">Test Lab</h2>
            <p className="text-[11px] text-surface-300 mt-0.5">Review and annotate conversations</p>
          </div>
          {/* Conversation picker */}
          <select
            value={activeConversation?.id || ''}
            onChange={(e) => setActiveConversationId(e.target.value || null)}
            className="bg-surface-700 border border-surface-400 rounded-lg px-3 py-1.5 text-xs text-surface-50 font-mono focus:outline-none focus:border-accent"
          >
            <option value="">Select conversation...</option>
            {projectConversations.map((conv) => (
              <option key={conv.id} value={conv.id}>
                {conv.customerName} — {conv.messages.length} msgs — {new Date(conv.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        {activeConversation && (
          <button
            onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-surface-700 text-surface-200 hover:text-surface-50 border border-surface-400/50 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        )}
      </div>

      {showExport && activeConversation && (
        <ExportOptions conversation={activeConversation} onClose={() => setShowExport(false)} />
      )}

      {/* Content */}
      {activeConversation ? (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <ConversationSummary conversation={activeConversation} />
            <div className="mt-6 space-y-2">
              {activeConversation.messages.map((msg) => (
                <AnnotatedMessage
                  key={msg.id}
                  message={msg}
                  conversationId={activeConversation.id}
                  annotations={activeConversation.annotations?.filter(a => a.messageId === msg.id) || []}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-surface-300">Select a conversation to review</p>
        </div>
      )}
    </div>
  );
}
