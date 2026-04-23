export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function MessageSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3 px-4 py-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`${i % 2 === 0 ? 'max-w-[55%]' : 'max-w-[45%]'} w-full space-y-1.5`}>
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationSkeleton({ count = 4 }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <div className="skeleton w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-3.5 w-2/3" />
            <div className="skeleton h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
