export default function Input({ label, error, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-mono text-xs uppercase tracking-wider text-surface-200 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-surface-700 border rounded-lg px-3 py-2.5 text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors ${
          error ? 'border-danger' : 'border-surface-400'
        }`}
        {...rest}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
