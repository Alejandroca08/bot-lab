import { useState, useEffect, useContext } from 'react';
import { restQuery, authSignUpDirect } from '../../lib/supabase';
import { ProjectContext } from '../../contexts/ProjectContext';
import { ConversationContext } from '../../contexts/ConversationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { VIEWS } from '../../utils/constants';

export default function ClientManager({ onViewChange }) {
  const { projects, setActiveProjectId } = useContext(ProjectContext);
  const { setActiveConversationId } = useContext(ConversationContext);
  const { session } = useAuth();
  const { t, lang } = useTranslation();
  const token = session?.access_token;
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
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
      if (data.length > 0) {
        loadClientStats(data.map(c => c.id));
      }
    }
    setLoading(false);
  };

  const loadClientStats = async (clientIds) => {
    const idList = clientIds.join(',');

    const convSelect = encodeURIComponent('id,user_id,created_at,customer_name,simulated_phone_number,bot_status,messages(count),annotations(count)');
    // Fetch conversations and annotations in parallel
    const [convResult, annResult] = await Promise.all([
      restQuery(
        `/rest/v1/conversations?select=${convSelect}&user_id=in.(${idList})&order=created_at.desc`,
        {},
        token
      ),
      restQuery(
        `/rest/v1/annotations?select=id,user_id,severity,created_at&user_id=in.(${idList})`,
        {},
        token
      ),
    ]);

    const stats = {};
    clientIds.forEach(id => {
      stats[id] = { conversations: 0, annotations: 0, critical: 0, medium: 0, minor: 0, lastActive: null, conversationList: [] };
    });

    if (convResult.data) {
      for (const conv of convResult.data) {
        if (!stats[conv.user_id]) continue;
        stats[conv.user_id].conversations++;
        stats[conv.user_id].conversationList.push(conv);
        const ts = new Date(conv.created_at).getTime();
        if (!stats[conv.user_id].lastActive || ts > stats[conv.user_id].lastActive) {
          stats[conv.user_id].lastActive = ts;
        }
      }
    }

    if (annResult.data) {
      for (const ann of annResult.data) {
        if (!stats[ann.user_id]) continue;
        stats[ann.user_id].annotations++;
        if (ann.severity === 'critical') stats[ann.user_id].critical++;
        else if (ann.severity === 'medium') stats[ann.user_id].medium++;
        else stats[ann.user_id].minor++;
        const ts = new Date(ann.created_at).getTime();
        if (!stats[ann.user_id].lastActive || ts > stats[ann.user_id].lastActive) {
          stats[ann.user_id].lastActive = ts;
        }
      }
    }

    setClientStats(stats);
  };

  const handleDeleteClient = async (clientId) => {
    // Delete profile (cascades from auth.users FK)
    const { error } = await restQuery(
      `/rest/v1/profiles?id=eq.${clientId}`,
      { method: 'DELETE' },
      token
    );

    if (error) {
      console.error('[ClientManager] Failed to delete client:', error);
      return;
    }

    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (expandedId === clientId) setExpandedId(null);
  };

  const handleTestBot = (client) => {
    if (client.project_id) {
      setActiveProjectId(client.project_id);
    }
    onViewChange?.(VIEWS.SIMULATOR);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email || !inviteForm.projectId || !inviteForm.password) return;

    setInviteLoading(true);
    setInviteError('');

    try {
      const { data: authData, error: authError } = await authSignUpDirect(
        inviteForm.email,
        inviteForm.password,
        { name: inviteForm.name }
      );

      if (authError) throw new Error(authError.message);

      const userId = authData?.id || authData?.user?.id;
      if (!userId) throw new Error('User was created but no ID returned');

      await restQuery(
        `/rest/v1/profiles?id=eq.${userId}`,
        { method: 'PATCH', body: { project_id: inviteForm.projectId }, prefer: 'return=minimal' },
        token
      );

      setShowInvite(false);
      setInviteForm({ name: '', email: '', projectId: '', password: '' });
      await loadClients();
    } catch (err) {
      setInviteError(err.message || t('clients.createError'));
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

  const timeAgo = (timestamp) => {
    if (!timestamp) return t('clients.never');
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('clients.justNow');
    if (mins < 60) return lang === 'es' ? `hace ${mins}m` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return lang === 'es' ? `hace ${hours}h` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return lang === 'es' ? `hace ${days}d` : `${days}d ago`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-mono text-lg font-bold text-surface-50 tracking-wider uppercase">{t('clients.title')}</h2>
            <p className="text-sm text-surface-200 mt-1">{t('clients.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-2 bg-accent text-surface-900 font-mono text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('clients.invite')}
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <form onSubmit={handleInvite} className="bg-surface-800 border border-surface-400/50 rounded-xl p-6 mb-6 animate-fade-in">
            <h3 className="font-mono text-sm uppercase tracking-wider text-accent mb-4">{t('clients.inviteTitle')}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">{t('clients.name')}</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('clients.namePlaceholder')}
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">{t('clients.email')}</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('clients.emailPlaceholder')}
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">{t('clients.assignProject')}</label>
                <select
                  value={inviteForm.projectId}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 focus:outline-none focus:border-accent transition-colors"
                  required
                >
                  <option value="">{t('clients.selectProject')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">{t('clients.tempPassword')}</label>
                <input
                  type="text"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t('clients.tempPasswordPlaceholder')}
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
              <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 rounded-lg text-xs font-mono uppercase text-surface-200 hover:text-surface-50 transition-colors">{t('clients.cancel')}</button>
              <button type="submit" disabled={inviteLoading} className="px-5 py-2 rounded-lg bg-accent text-surface-900 text-xs font-mono uppercase font-semibold hover:bg-accent-hover transition-all disabled:opacity-50">
                {inviteLoading ? t('clients.creating') : t('clients.create')}
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
            <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">{t('clients.none')}</h3>
            <p className="text-sm text-surface-300">{t('clients.noneDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const stats = clientStats[client.id] || {};
              const isExpanded = expandedId === client.id;

              return (
                <div
                  key={client.id}
                  className={`bg-surface-800 border rounded-xl transition-all duration-150
                    ${isExpanded ? 'border-accent/30 bg-accent/5' : 'border-surface-400/50 hover:border-surface-300'}`}
                >
                  {/* Main row — always visible */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : client.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-mono font-bold text-accent">
                            {(client.name || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-surface-50 truncate">{client.name}</h3>
                          <p className="text-[11px] text-surface-300 font-mono mt-0.5 truncate">{client.email || client.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Quick stats badges */}
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="text-[10px] font-mono text-surface-300 bg-surface-700 px-2 py-0.5 rounded">
                            {stats.conversations || 0} {t('clients.convos')}
                          </span>
                          <span className="text-[10px] font-mono text-surface-300 bg-surface-700 px-2 py-0.5 rounded">
                            {stats.annotations || 0} {t('clients.flags')}
                          </span>
                        </div>
                        {client.projects ? (
                          <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                            {client.projects.name}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-surface-300 bg-surface-700 px-2 py-0.5 rounded-full border border-surface-400/50">
                            {t('clients.unassigned')}
                          </span>
                        )}
                        {/* Expand indicator */}
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`text-surface-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-surface-400/30 pt-4 animate-fade-in">
                      {/* Stats grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <MiniStat label={t('clients.conversations')} value={stats.conversations || 0} color="text-surface-50" />
                        <MiniStat label={t('clients.critical')} value={stats.critical || 0} color="text-severity-critical" />
                        <MiniStat label={t('clients.medium')} value={stats.medium || 0} color="text-severity-medium" />
                        <MiniStat label={t('clients.minor')} value={stats.minor || 0} color="text-severity-minor" />
                      </div>

                      {/* Info row */}
                      <div className="flex items-center gap-4 text-[11px] font-mono text-surface-300 mb-4">
                        <span className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {t('clients.lastActive')}: {timeAgo(stats.lastActive)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                          {t('clients.totalFlags')}: {stats.annotations || 0}
                        </span>
                      </div>

                      {/* Conversations list */}
                      {stats.conversationList?.length > 0 ? (
                        <div className="mb-4">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-surface-200 mb-2">{t('clients.conversationsList')}</p>
                          <div className="bg-surface-700/50 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                            {stats.conversationList.map((conv) => {
                              const msgCount = conv.messages?.[0]?.count || 0;
                              const annCount = conv.annotations?.[0]?.count || 0;
                              return (
                                <button
                                  key={conv.id}
                                  onClick={() => {
                                    setActiveProjectId(client.project_id);
                                    setActiveConversationId(conv.id);
                                    onViewChange?.(VIEWS.TESTLAB);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-600/50 transition-colors border-b border-surface-400/20 last:border-b-0 group"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-400 shrink-0">
                                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span className="text-xs text-surface-100 truncate group-hover:text-surface-50">{conv.customer_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-mono text-surface-400">{msgCount} {t('clients.msgs')}</span>
                                    {annCount > 0 && (
                                      <span className="text-[10px] font-mono text-warning bg-warning/10 px-1.5 py-0.5 rounded">{annCount}</span>
                                    )}
                                    <span className="text-[10px] font-mono text-surface-400">{timeAgo(new Date(conv.created_at).getTime())}</span>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-400 group-hover:text-accent transition-colors">
                                      <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 py-3 text-center">
                          <p className="text-xs text-surface-400 font-mono">{t('clients.noConversations')}</p>
                        </div>
                      )}

                      {/* Project assignment */}
                      {!client.projects && (
                        <div className="mb-4">
                          <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">{t('clients.assignProject')}</label>
                          <select
                            value=""
                            onChange={(e) => handleAssignProject(client.id, e.target.value)}
                            className="bg-surface-700 border border-surface-400 rounded-lg px-3 py-2 text-xs text-surface-50 focus:outline-none focus:border-accent w-full max-w-xs"
                          >
                            <option value="">{t('clients.assignPlaceholder')}</option>
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {client.projects && (
                          <button
                            onClick={() => handleTestBot(client)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 text-accent border border-accent/30 text-xs font-mono uppercase tracking-wider hover:bg-accent/25 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {t('clients.testBot')}
                          </button>
                        )}
                        {client.projects && (
                          <button
                            onClick={() => {
                              setActiveProjectId(client.project_id);
                              onViewChange?.(VIEWS.TESTLAB);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-700 text-surface-200 border border-surface-400/50 text-xs font-mono uppercase tracking-wider hover:text-surface-50 hover:bg-surface-600 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            {t('clients.viewTestLab')}
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm(t('clients.confirmDelete'))) handleDeleteClient(client.id); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-surface-300 border border-surface-400/50 text-xs font-mono uppercase tracking-wider hover:text-danger hover:bg-danger/10 hover:border-danger/30 transition-all ml-auto"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          {t('clients.delete')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div className="bg-surface-700/50 rounded-lg p-3 text-center">
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      <p className="text-[9px] font-mono uppercase tracking-wider text-surface-300 mt-0.5">{label}</p>
    </div>
  );
}
