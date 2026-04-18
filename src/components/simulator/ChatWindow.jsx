import { useState, useContext, useRef, useEffect } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { ConversationContext } from '../../contexts/ConversationContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import AgentPanel from './AgentPanel';
import BotStatusIndicator from './BotStatusIndicator';
import PasteResponseModal from './PasteResponseModal';
import ConversationList from './ConversationList';
import { useWebhook } from '../../hooks/useWebhook';
import { buildInboundTextPayload, buildInboundImagePayload, buildInboundAudioPayload } from '../../utils/payloadBuilders';
import { generateMessageId } from '../../utils/idGenerators';

export default function ChatWindow() {
  const { activeProject } = useContext(ProjectContext);
  const {
    activeConversation, conversations, setActiveConversationId,
    createConversation, addMessage, updateMessageStatus,
    setBotStatus, getConversationsForProject, deleteConversation,
  } = useContext(ConversationContext);
  const { sendPayload } = useWebhook();
  const [agentPanelOpen, setAgentPanelOpen] = useState(true);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef(null);

  const projectConversations = activeProject ? getConversationsForProject(activeProject.id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages?.length]);

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-700 border border-surface-400 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">No Project Selected</h3>
          <p className="text-sm text-surface-300">Select or create a project in Settings first</p>
        </div>
      </div>
    );
  }

  const handleNewConversation = async () => {
    const phone = activeProject.testPhoneNumbers[0] || '+1234567890';
    const conv = await createConversation(activeProject.id, phone, 'Test Customer');
    if (conv) {
      setActiveConversationId(conv.id);
    }
    setShowConversations(false);
  };

  const handleSendMessage = async (content, type = 'text', metadata = {}) => {
    if (!activeConversation) return;

    const message = {
      sender: 'customer',
      type,
      content,
      status: 'sending',
      metadata,
    };

    const created = await addMessage(activeConversation.id, message);
    if (!created) return;

    let payload;
    if (type === 'text') {
      payload = buildInboundTextPayload({
        from: activeConversation.simulatedPhoneNumber,
        to: activeProject.agentPhoneNumber,
        body: content,
        customerName: activeConversation.customerName,
      });
    } else if (type === 'image') {
      payload = buildInboundImagePayload({
        from: activeConversation.simulatedPhoneNumber,
        to: activeProject.agentPhoneNumber,
        caption: metadata.caption || '',
        imageId: generateMessageId(),
      });
    } else if (type === 'audio') {
      payload = buildInboundAudioPayload({
        from: activeConversation.simulatedPhoneNumber,
        to: activeProject.agentPhoneNumber,
        audioId: generateMessageId(),
      });
    }

    const result = await sendPayload(activeProject.webhookUrl, payload);
    await updateMessageStatus(activeConversation.id, created.id, result.ok ? 'delivered' : 'failed');

    // Auto-display bot response from webhook reply
    if (result.ok && result.data) {
      const botText = result.data.output || result.data.message || result.data.text ||
        (typeof result.data === 'string' ? result.data : null);
      if (botText) {
        await addMessage(activeConversation.id, {
          sender: 'bot',
          type: 'text',
          content: botText,
          status: 'delivered',
        });
      }
    }
  };

  const handlePasteResponse = async (responseText) => {
    if (!activeConversation) return;
    await addMessage(activeConversation.id, {
      sender: 'bot',
      type: 'text',
      content: responseText,
      status: 'read',
    });
    setPasteModalOpen(false);
  };

  return (
    <div className="h-full flex">
      {/* Left: Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="bg-surface-800 border-b border-surface-400/50 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConversations(!showConversations)}
              className="p-1.5 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {activeConversation ? (
              <div>
                <h3 className="text-sm font-semibold text-surface-50">{activeConversation.customerName}</h3>
                <p className="text-[10px] font-mono text-surface-300">{activeConversation.simulatedPhoneNumber}</p>
              </div>
            ) : (
              <span className="text-sm text-surface-300">Select or create a conversation</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeConversation && <BotStatusIndicator status={activeConversation.botStatus} />}
            <button
              onClick={() => setPasteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-surface-700 text-surface-200 hover:text-surface-50 hover:bg-surface-600 border border-surface-400/50 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              Paste Response
            </button>
            <button
              onClick={() => setAgentPanelOpen(!agentPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-all
                ${agentPanelOpen
                  ? 'bg-bubble-agent/30 text-purple-300 border-purple-400/30'
                  : 'bg-surface-700 text-surface-200 border-surface-400/50 hover:text-surface-50'
                }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Agent
            </button>
          </div>
        </div>

        {/* Conversation list dropdown */}
        {showConversations && (
          <ConversationList
            conversations={projectConversations}
            activeId={activeConversation?.id}
            onSelect={(id) => { setActiveConversationId(id); setShowConversations(false); }}
            onNew={handleNewConversation}
            onDelete={deleteConversation}
            onClose={() => setShowConversations(false)}
          />
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto wa-chat-bg px-4 py-3">
          {!activeConversation ? (
            <div className="h-full flex items-center justify-center">
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-5 py-3 rounded-xl font-mono text-xs uppercase tracking-wider hover:bg-accent/20 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Conversation
              </button>
            </div>
          ) : (
            <>
              {activeConversation.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message input */}
        {activeConversation && (
          <MessageInput onSend={handleSendMessage} />
        )}
      </div>

      {/* Right: Agent panel */}
      {agentPanelOpen && activeConversation && (
        <AgentPanel
          conversation={activeConversation}
          project={activeProject}
          onClose={() => setAgentPanelOpen(false)}
        />
      )}

      <PasteResponseModal
        isOpen={pasteModalOpen}
        onClose={() => setPasteModalOpen(false)}
        onPaste={handlePasteResponse}
      />
    </div>
  );
}
