const variantClasses = {
  green: 'bg-accent/20 text-accent',
  red: 'bg-danger/20 text-danger',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  orange: 'bg-orange-500/20 text-orange-400',
  blue: 'bg-blue-500/20 text-blue-400',
  gray: 'bg-surface-500/30 text-surface-200',
};

export default function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
