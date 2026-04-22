import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars. ' +
    'Create a .env.local file with these values.'
  );
}

// Supabase client — only used for auth (onAuthStateChange, signIn, signOut).
// All database operations use restQuery() below to avoid getSession() lock hangs.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storageKey: 'botlab-auth',
    },
  },
);

// Direct REST helper — bypasses supabase-js client entirely for DB operations.
// The supabase-js client's internal getSession() hangs on self-hosted instances
// due to browser lock contention. This helper uses the token already in memory.
export async function restQuery(path, { method = 'GET', body, prefer, single = false } = {}, token) {
  if (!token) {
    return { data: null, error: { message: 'No auth token available' } };
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${token}`,
  };
  if (prefer) headers['Prefer'] = prefer;

  const res = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    return { data: null, error: { message: `Request failed (${res.status})` } };
  }

  if (!text) return { data: null, error: null };

  try {
    const parsed = JSON.parse(text);
    const data = single && Array.isArray(parsed) ? parsed[0] || null : parsed;
    return { data, error: null };
  } catch {
    return { data: null, error: { message: 'Failed to parse response' } };
  }
}

// Auth signup via direct GoTrue API — does NOT change the current browser session.
// Used by admin to create client accounts without logging themselves out.
export async function authSignUpDirect(email, password, metadata = {}) {
  // Strip role from metadata — role is always 'client', enforced by DB trigger
  const { role, ...safeMetadata } = metadata;

  const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      email,
      password,
      data: safeMetadata,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return { data: null, error: { message: data?.msg || data?.message || `HTTP ${res.status}` } };
  }

  return { data, error: null };
}
