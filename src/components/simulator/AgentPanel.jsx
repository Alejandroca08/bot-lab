import { useState, useContext, useRef, useEffect } from 'react';
import { ConversationContext } from '../../contexts/ConversationContext';
import { useWebhook } from '../../hooks/useWebhook';
import { buildOutboundTextPayload } from '../../utils/payloadBuilders';
import { generateMessageId } from '../../utils/idGenerators';
import { REACTIVATION_KEYWORD } from '../../utils/constants';
import MessageBubble from './MessageBubble';

export default function AgentPanel({ conversation, project, onClose }) {
  const { addMessage, updateMessageStatus, setBotStatus } = useContext(ConversationContext);
  const { sendPayload } = useWebhook();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  const sendAgentMessage = async (body) => {
    const isReactivation = body === REACTIVATION_KEYWORD;
    const msgId = generateMessageId();

    const message = {
      id: msgId,
      sender: 'agent',
      type: 'text',
      content: body,
      timestamp: new Date().toISOString(),
      status: 'sending',
      metadata: { agentName: project.clientName },
    };

    addMessage(conversation.id, message);

    // Update bot status
    if (isReactivation) {
      setBotStatus(conversation.id, 'active');
    } else {
      setBotStatus(conversation.id, 'deactivated');
    }

    // Build and send outbound payload
    const payload = buildOutboundTextPayload({
      from: project.agentPhoneNumber,
      to: conversation.simulatedPhoneNumber,
      body,
      wabaId: 'waba_simulated',
    });

    const result = await sendPayload(project.webhookUrl, payload);
    updateMessageStatus(conversation.id, msgId, result.ok ? 'delivered' : 'failed');

    setText('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendAgentMessage(text.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-80 bg-surface-800/80 border-l border-purple-500/20 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-500/20 flex items-center justify-between bg-bubble-agent/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-purple-200">{project.clientName}</h4>
            <p className="text-[10px] font-mono text-purple-300/60">Agent Panel</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-surface-300 hover:text-surface-50 hover:bg-surface-700 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Bot status indicator */}
      <div className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2
        ${conversation.botStatus === 'active'
          ? 'bg-accent/10 text-accent'
          : 'bg-danger/10 text-danger'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${conversation.botStatus === 'active' ? 'bg-accent' : 'bg-danger animate-pulse-recording'}`} />
        {conversation.botStatus === 'active' ? 'Bot activado' : `Bot desactivado — ${project.clientName} está respondiendo`}
      </div>

      {/* Messages (mirrored) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" style={{ background: 'rgba(45, 27, 78, 0.1)' }}>
        {conversation.messages.map((msg) => {
          // In agent panel, flip perspective: customer msgs are "incoming", agent msgs are "outgoing"
          const flippedMsg = {
            ...msg,
            sender: msg.sender === 'customer' ? 'bot' : msg.sender === 'agent' ? 'customer' : msg.sender,
          };
          return <MessageBubble key={msg.id} message={flippedMsg} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2 border-t border-purple-500/20 space-y-2">
        {/* Listo button */}
        <button
          onClick={() => sendAgentMessage(REACTIVATION_KEYWORD)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all
            ${conversation.botStatus === 'deactivated'
              ? 'bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25'
              : 'bg-surface-700 text-surface-300 border border-surface-400/50 cursor-not-allowed opacity-50'
            }`}
          disabled={conversation.botStatus === 'active'}
        >
          Listo ✅
        </button>

        {/* Text input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Reply as ${project.clientName}...`}
            rows={1}
            className="flex-1 bg-surface-700 rounded-lg border border-purple-500/20 px-3 py-2 text-xs text-surface-50 placeholder:text-surface-300 resize-none focus:outline-none focus:border-purple-400/40 max-h-20"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-30 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
