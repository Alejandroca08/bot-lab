import { useState, useEffect, useContext } from 'react';
import { restQuery, authSignUpDirect } from '../../lib/supabase';
import { ProjectContext } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientManager() {
  const { projects } = useContext(ProjectContext);
  const { session } = useAuth();
  const token = session?.access_token;
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', projectId: '', password: '' });
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (token) loadClients();
  }, [token]);

  const loadClients = async () => {
    const select = encodeURIComponent('*,projects:project_id(*)');
    const { data, error } = await restQuery(
      `/rest/v1/profiles?select=${select}&role=eq.client&order=created_at.desc`,
      {},
      token
    );

    if (!error && data) {
      setClients(data);
    }
    setLoading(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email || !inviteForm.projectId || !inviteForm.password) return;

    setInviteLoading(true);
    setInviteError('');

    try {
      // Create user via direct GoTrue API (doesn't change admin session)
      const { data: authData, error: authError } = await authSignUpDirect(
        inviteForm.email,
        inviteForm.password,
        { name: inviteForm.name }
      );

      if (authError) throw new Error(authError.message);

      const userId = authData?.id || authData?.user?.id;
      if (!userId) throw new Error('User was created but no ID returned');

      // Update profile with project assignment
      const { error: updateError } = await restQuery(
        `/rest/v1/profiles?id=eq.${userId}`,
        { method: 'PATCH', body: { project_id: inviteForm.projectId }, prefer: 'return=minimal' },
        token
      );

      if (updateError) {
        // Failed to assign project
      }

      setShowInvite(false);
      setInviteForm({ name: '', email: '', projectId: '', password: '' });
      await loadClients();
    } catch (err) {
      setInviteError(err.message || 'Failed to create client');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAssignProject = async (clientId, projectId) => {
    await restQuery(
      `/rest/v1/profiles?id=eq.${clientId}`,
      { method: 'PATCH', body: { project_id: projectId }, prefer: 'return=minimal' },
      token
    );
    await loadClients();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-mono text-lg font-bold text-surface-50 tracking-wider uppercase">Clients</h2>
            <p className="text-sm text-surface-200 mt-1">Manage client access and project assignments</p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 bg-accent text-surface-900 font-mono text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Invite Client
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <form onSubmit={handleInvite} className="bg-surface-800 border border-surface-400/50 rounded-xl p-6 mb-6 animate-fade-in">
            <h3 className="font-mono text-sm uppercase tracking-wider text-accent mb-4">Invite New Client</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">Client Name</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Maria"
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@email.com"
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">Assign Project</label>
                <select
                  value={inviteForm.projectId}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 focus:outline-none focus:border-accent transition-colors"
                  required
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">Temporary Password</label>
                <input
                  type="text"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 font-mono placeholder:text-surface-300 focus:outline-none focus:border-accent transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {inviteError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">{inviteError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg text-xs font-mono uppercase text-surface-200 hover:text-surface-50 transition-colors">Cancel</button>
              <button type="submit" disabled={inviteLoading} className="px-5 py-2 rounded-lg bg-accent text-surface-900 text-xs font-mono uppercase font-semibold hover:bg-accent-hover transition-all disabled:opacity-50">
                {inviteLoading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        )}

        {/* Client list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-surface-400 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">No Clients Yet</h3>
            <p className="text-sm text-surface-300">Invite your first client to start collecting feedback</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-surface-800 border border-surface-400/50 rounded-xl p-5 group">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-surface-50">{client.name}</h3>
                    <p className="text-xs text-surface-300 font-mono mt-0.5">{client.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {client.projects ? (
                      <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                        {client.projects.name}
                      </span>
                    ) : (
                      <select
                        value=""
                        onChange={(e) => handleAssignProject(client.id, e.target.value)}
                        className="bg-surface-700 border border-surface-400 rounded-lg px-2 py-1 text-xs text-surface-50 focus:outline-none focus:border-accent"
                      >
                        <option value="">Assign project...</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
