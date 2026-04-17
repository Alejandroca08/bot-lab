const variantClasses = {
  primary: 'bg-accent text-surface-900 font-semibold hover:bg-accent-hover',
  secondary: 'bg-surface-600 text-surface-50 hover:bg-surface-500 border border-surface-400',
  danger: 'bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30',
  ghost: 'text-surface-200 hover:text-surface-50 hover:bg-surface-700',
};

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ...rest
}) {
  return (
    <button
      disabled={disabled}
      className={`rounded-lg transition-all duration-150 font-mono uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
