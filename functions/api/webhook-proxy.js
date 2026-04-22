// Allowed origins for CORS — restrict to your deployed domain in production
const ALLOWED_ORIGINS = [
  'https://botlab.rasorbit.com',
  'http://localhost:5173',
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function isBlockedHostname(hostname) {
  // Normalize
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  // Loopback
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;

  // IPv4 private ranges
  if (h.startsWith('10.')) return true;
  if (h.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;

  // Link-local, shared, loopback ranges
  if (h.startsWith('169.254.')) return true;  // link-local / cloud metadata
  if (h.startsWith('100.64.')) return true;   // shared address space
  if (h.startsWith('0.')) return true;

  // IPv6 private/reserved
  if (h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  if (h.startsWith('::ffff:127.') || h.startsWith('::ffff:10.') || h.startsWith('::ffff:192.168.')) return true;

  // Cloud metadata endpoints
  if (h === '169.254.169.254' || h === 'metadata.google.internal') return true;

  // Local domain suffixes
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return true;

  return false;
}

export async function onRequestPost(context) {
  const corsHeaders = getCorsHeaders(context.request);

  try {
    const { webhookUrl, payload } = await context.request.json();

    if (!webhookUrl || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing webhookUrl or payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate URL format and scheme
    let url;
    try {
      url = new URL(webhookUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid webhookUrl' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Only allow HTTP(S)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return new Response(
        JSON.stringify({ error: 'Only http and https URLs are allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Block private/internal network targets
    if (isBlockedHostname(url.hostname)) {
      return new Response(
        JSON.stringify({ error: 'Cannot proxy to private network addresses' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Forward the payload to the webhook URL
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.text();

    // Parse as JSON if possible, otherwise return raw text
    let data;
    try {
      data = JSON.parse(responseBody);
    } catch {
      data = responseBody;
    }

    return new Response(
      JSON.stringify({ ok: response.ok, status: response.status, data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy request failed' }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions(context) {
  const corsHeaders = getCorsHeaders(context.request);
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}
