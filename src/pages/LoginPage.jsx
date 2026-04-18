import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password.trim());
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-surface-900">
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="font-mono text-xl font-bold text-surface-50 tracking-wider">BOTLAB</h1>
          <p className="text-xs text-surface-300 mt-1">WhatsApp Bot Testing Platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-800 border border-surface-400/50 rounded-xl p-6">
          <div className="mb-4">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              autoFocus
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              required
            />
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent text-surface-900 font-mono text-xs uppercase tracking-wider font-semibold hover:bg-accent-hover transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[10px] text-surface-400 font-mono mt-4">
          Contact your admin for access credentials
        </p>
      </div>
    </div>
  );
}
