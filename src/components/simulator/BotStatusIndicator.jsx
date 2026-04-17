export default function BotStatusIndicator({ status }) {
  const isActive = status === 'active';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider
      ${isActive
        ? 'bg-accent/10 text-accent border border-accent/20'
        : 'bg-danger/10 text-danger border border-danger/20'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-danger animate-pulse-recording'}`} />
      {isActive ? 'Bot ON' : 'Bot OFF'}
    </div>
  );
}
