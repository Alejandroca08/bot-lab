export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { webhookUrl, payload } = await context.request.json();

    if (!webhookUrl || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing webhookUrl or payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate URL format
    let url;
    try {
      url = new URL(webhookUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid webhookUrl' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Block private/internal network targets
    const hostname = url.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.') ||
      hostname.endsWith('.local')
    ) {
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
      JSON.stringify({ error: err.message || 'Proxy request failed' }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
