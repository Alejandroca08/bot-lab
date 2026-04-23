import { useState, useEffect, useContext } from 'react';
import { supabase, restQuery } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectContext } from '../../contexts/ProjectContext';
import { useTranslation } from '../../contexts/LanguageContext';

export default function FeedbackDashboard() {
  const { session } = useAuth();
  const { activeProject } = useContext(ProjectContext);
  const { t, lang } = useTranslation();
  const token = session?.access_token;
  const [annotations, setAnnotations] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, medium: 0, minor: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ severity: 'all' });

  useEffect(() => {
    if (token) loadAnnotations();

    // Subscribe to real-time annotation inserts
    const channel = supabase
      .channel('annotations-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'annotations' },
        (payload) => {
          loadAnnotationDetails(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token, activeProject?.id]);

  const loadAnnotations = async () => {
    setLoading(true);

    const select = encodeURIComponent(
      '*,conversations(customer_name,project_id),messages(content,type,sender)'
    );
    const { data, error } = await restQuery(
      `/rest/v1/annotations?select=${select}&order=created_at.desc&limit=200`,
      {},
      token
    );

    if (error) {
      console.error('[FeedbackDashboard] Failed to load annotations:', error);
    }
    if (!error && data) {
      // Filter by active project if set
      const filtered = activeProject
        ? data.filter(a => a.conversations?.project_id === activeProject.id)
        : data;

      // Fetch profile names for annotation authors
      const userIds = [...new Set(filtered.map(a => a.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const idFilter = userIds.map(id => `id.eq.${id}`).join(',');
        const { data: profiles } = await restQuery(
          `/rest/v1/profiles?select=id,name&or=(${encodeURIComponent(idFilter)})`,
          {},
          token
        );
        if (profiles) {
          const nameMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
          filtered.forEach(a => { a._authorName = nameMap[a.user_id] || null; });
        }
      }

      setAnnotations(filtered);
      updateStats(filtered);
    }

    setLoading(false);
  };

  const loadAnnotationDetails = async (id) => {
    const select = encodeURIComponent(
      '*,conversations(customer_name,project_id),messages(content,type,sender)'
    );
    const { data, error } = await restQuery(
      `/rest/v1/annotations?select=${select}&id=eq.${id}`,
      { single: true },
      token
    );

    if (error) {
      console.error('[FeedbackDashboard] Failed to load annotation detail:', error);
    }
    if (!error && data) {
      // Only add if it belongs to the active project (or no project filter)
      if (!activeProject || data.conversations?.project_id === activeProject.id) {
        // Fetch author name
        if (data.user_id) {
          const { data: profile } = await restQuery(
            `/rest/v1/profiles?select=name&id=eq.${data.user_id}`,
            { single: true },
            token
          );
          data._authorName = profile?.name || null;
        }
        setAnnotations((prev) => [data, ...prev]);
        updateStats(null);
      }
    }
  };

  const updateStats = (data) => {
    const items = data || annotations;
    setStats({
      total: items.length,
      critical: items.filter((a) => a.severity === 'critical').length,
      medium: items.filter((a) => a.severity === 'medium').length,
      minor: items.filter((a) => a.severity === 'minor').length,
    });
  };

  const filteredAnnotations = filter.severity === 'all'
    ? annotations
    : annotations.filter((a) => a.severity === filter.severity);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('dashboard.timeJustNow');
    if (mins < 60) return lang === 'es' ? `hace ${mins}m` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return lang === 'es' ? `hace ${hours}h` : `${hours}h ago`;
    return lang === 'es' ? `hace ${Math.floor(hours / 24)}d` : `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-mono text-lg font-bold text-surface-50 tracking-wider uppercase">{t('dashboard.title')}</h2>
          <p className="text-sm text-surface-200 mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label={t('dashboard.total')} value={stats.total} color="text-surface-50" />
          <StatCard label={t('dashboard.critical')} value={stats.critical} color="text-severity-critical" />
          <StatCard label={t('dashboard.medium')} value={stats.medium} color="text-severity-medium" />
          <StatCard label={t('dashboard.minor')} value={stats.minor} color="text-severity-minor" />
        </div>

        {/* Filter */}
        <div className="flex gap-1 mb-6 bg-surface-800 rounded-lg p-0.5 w-fit border border-surface-400/50">
          {[{ key: 'all', labelKey: 'dashboard.filterAll' }, { key: 'critical', labelKey: 'dashboard.critical' }, { key: 'medium', labelKey: 'dashboard.medium' }, { key: 'minor', labelKey: 'dashboard.minor' }].map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setFilter({ severity: key })}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all
                ${filter.severity === key ? 'bg-surface-600 text-surface-50' : 'text-surface-300 hover:text-surface-50'}`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* Annotations feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredAnnotations.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-mono text-sm text-surface-100 uppercase tracking-wider mb-2">{t('dashboard.none')}</h3>
            <p className="text-sm text-surface-300">{t('dashboard.noneDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnotations.map((ann) => (
              <div key={ann.id} className="bg-surface-800 border border-surface-400/50 rounded-xl p-4 animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full
                      ${ann.severity === 'critical' ? 'bg-severity-critical' :
                        ann.severity === 'medium' ? 'bg-severity-medium' : 'bg-severity-minor'}`}
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-surface-200">
                      {ann.category.replace('_', ' ')}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded
                      ${ann.severity === 'critical' ? 'bg-severity-critical/15 text-severity-critical' :
                        ann.severity === 'medium' ? 'bg-severity-medium/15 text-severity-medium' :
                        'bg-severity-minor/15 text-severity-minor'}`}>
                      {ann.severity}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-surface-300">{timeAgo(ann.created_at)}</span>
                </div>

                <p className="text-sm text-surface-50 mb-2">{ann.note}</p>

                {ann.suggestion && (
                  <p className="text-xs text-accent/70 italic mb-2">{t('dashboard.suggestion')}: {ann.suggestion}</p>
                )}

                {/* Context */}
                <div className="bg-surface-700/50 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-surface-300 mb-1.5">
                    <span className="text-accent">{activeProject?.name || 'Unknown project'}</span>
                    <span>·</span>
                    <span>by {ann._authorName || 'Unknown'}</span>
                    <span>·</span>
                    <span>{ann.conversations?.customer_name || 'Unknown'}</span>
                  </div>
                  <p className="text-xs text-surface-200 truncate">
                    <span className={`font-semibold ${ann.messages?.sender === 'bot' ? 'text-accent' : 'text-blue-400'}`}>
                      {ann.messages?.sender === 'bot' ? t('sender.bot') : ann.messages?.sender === 'customer' ? t('sender.customer') : t('sender.agent')}:
                    </span>
                    {' '}{ann.messages?.type === 'text' ? ann.messages?.content : `[${ann.messages?.type}]`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-surface-800 border border-surface-400/50 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-wider text-surface-300 mt-1">{label}</p>
    </div>
  );
}
