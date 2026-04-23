export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-1.5 animate-slide-in-left">
      <div className="bg-bubble-incoming rounded-xl px-4 py-3 shadow-md">
        <div className="flex items-center gap-1">
          <div className="typing-dot w-2 h-2 rounded-full bg-surface-300" />
          <div className="typing-dot w-2 h-2 rounded-full bg-surface-300" />
          <div className="typing-dot w-2 h-2 rounded-full bg-surface-300" />
        </div>
      </div>
    </div>
  );
}
