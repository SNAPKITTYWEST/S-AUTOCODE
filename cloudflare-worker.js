/**
 * S-AUTOCODE Cloudflare Worker — /api/bridge
 *
 * Routes:
 *   POST /api/bridge  { action: "ai", messages, stream }
 *   POST /api/bridge  { action: "runtime", language, code }
 *   POST /api/bridge  { action: "command", command }
 *   GET  /api/bridge  → live OS status (for snapkittywest.github.io hub)
 *
 * Secrets (set in CF dashboard, never hardcoded):
 *   FIREWORKS_API_KEY
 *   DEVFLOW_URL        (collectivekitty.com internal runtime endpoint)
 *   DEVFLOW_SECRET     (shared secret for OS calls)
 *
 * CORS: allows snapkittywest.github.io + localhost dev
 */

const MODEL_PATH = 'accounts/fireworks/models/qwen2p5-coder-32b-instruct';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

const ALLOWED_ORIGINS = [
  'https://snapkittywest.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o => (origin || '').startsWith(o))
    ? origin
    : 'https://snapkittywest.github.io';
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ── GET /api/bridge — live OS status ─────────────────────────────────────────

async function handleStatus(env, origin) {
  // Try to fetch live status from DEVFLOW OS
  let liveData = null;
  if (env.DEVFLOW_URL) {
    try {
      const r = await fetch(`${env.DEVFLOW_URL}/api/status`, {
        headers: { 'x-bridge-secret': env.DEVFLOW_SECRET || '' },
        signal: AbortSignal.timeout(3000),
      });
      if (r.ok) liveData = await r.json();
    } catch { /* fallback below */ }
  }

  return json({
    status:        'live',
    worm_head:     liveData?.worm_head     || liveData?.chainHead?.slice(0, 8) || 'GENESIS',
    agents_active: liveData?.agents_active || 11,
    tier:          liveData?.tier          || 3,
    entropy:       liveData?.entropy       || 0.096,
    ts:            new Date().toISOString(),
  }, 200, origin);
}

// ── POST action: "ai" — Fireworks AI call ─────────────────────────────────────

async function handleAI(body, env, origin) {
  const apiKey = env.FIREWORKS_API_KEY;
  if (!apiKey) return json({ error: 'FIREWORKS_API_KEY not configured' }, 500, origin);

  const payload = {
    model:    body.model || MODEL_PATH,
    messages: body.messages || [],
    stream:   body.stream ?? false,
    max_tokens: body.max_tokens || 2048,
    temperature: body.temperature ?? 0.3,
  };

  const upstream = await fetch(FIREWORKS_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (body.stream) {
    // Pass SSE stream straight through with CORS headers
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        ...corsHeaders(origin),
      },
    });
  }

  const data = await upstream.json();
  return json(data, upstream.status, origin);
}

// ── POST action: "runtime" — execute code via DEVFLOW OS ─────────────────────

async function handleRuntime(body, env, origin) {
  // If DEVFLOW_URL configured, proxy to live OS runtime
  if (env.DEVFLOW_URL) {
    try {
      const r = await fetch(`${env.DEVFLOW_URL}/api/runtime/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bridge-secret': env.DEVFLOW_SECRET || '',
        },
        body: JSON.stringify({ language: body.language, code: body.code }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await r.json();
      return json(result, 200, origin);
    } catch (e) {
      // Fall through to sandbox
    }
  }

  // Sandbox fallback — browser handles Python/JS directly, worker returns stub
  return json({
    output:   `[Bridge] Runtime sandbox: ${body.language} execution delegated to browser`,
    exitCode: 0,
    runtime:  'browser-sandbox',
  }, 200, origin);
}

// ── POST action: "command" — shell command via DEVFLOW OS ─────────────────────

async function handleCommand(body, env, origin) {
  if (env.DEVFLOW_URL) {
    try {
      const r = await fetch(`${env.DEVFLOW_URL}/api/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bridge-secret': env.DEVFLOW_SECRET || '',
        },
        body: JSON.stringify({ command: body.command }),
        signal: AbortSignal.timeout(8000),
      });
      const result = await r.json();
      return json(result, 200, origin);
    } catch (e) { /* fallback */ }
  }

  // Simulation fallback
  return json({
    command:  body.command,
    output:   `[Bridge] Command execution: ${body.command}\n(Connect DEVFLOW_URL for live execution)`,
    exitCode: 0,
    simulated: true,
  }, 200, origin);
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only handle /api/bridge
    if (!url.pathname.endsWith('/api/bridge') && !url.pathname.endsWith('/bridge')) {
      return new Response('Not Found', { status: 404 });
    }

    // GET → live OS status (for snapkittywest.github.io hub widget)
    if (request.method === 'GET') {
      return handleStatus(env, origin);
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const action = body.action || 'ai';

      switch (action) {
        case 'ai':      return handleAI(body, env, origin);
        case 'runtime': return handleRuntime(body, env, origin);
        case 'command': return handleCommand(body, env, origin);
        default:
          return json({ error: `Unknown action: ${action}` }, 400, origin);
      }
    } catch (err) {
      return json({ error: err.message }, 500, origin);
    }
  },
};
