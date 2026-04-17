export default function ConversationSummary({ conversation }) {
  const { messages, annotations = [], botStatus, createdAt } = conversation;

  const customerMsgs = messages.filter(m => m.sender === 'customer').length;
  const botMsgs = messages.filter(m => m.sender === 'bot').length;
  const agentMsgs = messages.filter(m => m.sender === 'agent').length;

  const criticalCount = annotations.filter(a => a.severity === 'critical').length;
  const mediumCount = annotations.filter(a => a.severity === 'medium').length;
  const minorCount = annotations.filter(a => a.severity === 'minor').length;

  // Category breakdown
  const categoryMap = {};
  annotations.forEach(a => {
    categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
  });

  // Duration
  let duration = '';
  if (messages.length >= 2) {
    const first = new Date(messages[0].timestamp);
    const last = new Date(messages[messages.length - 1].timestamp);
    const diffMs = last - first;
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  return (
    <div className="bg-surface-800 border border-surface-400/50 rounded-xl p-5">
      <h3 className="font-mono text-xs uppercase tracking-wider text-surface-200 mb-4">Conversation Summary</h3>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Stat label="Customer" value={customerMsgs} color="text-blue-400" />
        <Stat label="Bot" value={botMsgs} color="text-accent" />
        <Stat label="Agent" value={agentMsgs} color="text-purple-400" />
        <Stat label="Duration" value={duration || '—'} color="text-surface-50" />
      </div>

      {annotations.length > 0 && (
        <>
          <div className="border-t border-surface-400/30 pt-3 mb-3">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-surface-300 mb-2">Annotations ({annotations.length})</h4>
            <div className="flex gap-3">
              {criticalCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-severity-critical" />
                  <span className="text-severity-critical font-mono">{criticalCount} critical</span>
                </span>
              )}
              {mediumCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-severity-medium" />
                  <span className="text-severity-medium font-mono">{mediumCount} medium</span>
                </span>
              )}
              {minorCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-severity-minor" />
                  <span className="text-severity-minor font-mono">{minorCount} minor</span>
                </span>
              )}
            </div>
          </div>

          {Object.keys(categoryMap).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(categoryMap).map(([cat, count]) => (
                <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-700 text-[10px] font-mono text-surface-200">
                  {cat.replace('_', ' ')} <span className="text-surface-100 font-semibold">{count}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <div className="border-t border-surface-400/30 pt-3 mt-3 flex items-center gap-4 text-[10px] font-mono text-surface-300">
        <span>Bot: {botStatus === 'active' ? '🟢 Active' : '🔴 Deactivated'}</span>
        <span>Started: {new Date(createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-surface-700/50 rounded-lg p-3 text-center">
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-wider text-surface-300 mt-0.5">{label}</p>
    </div>
  );
}
