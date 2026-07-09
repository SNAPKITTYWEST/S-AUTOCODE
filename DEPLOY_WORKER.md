# Deploy Cloudflare Worker for Instant CODEX Responses

## Why?
- **CORS blocks** direct browser → Fireworks API calls
- **Cloudflare Workers** run on edge (instant, global)
- **Zero cold start** - always hot
- **Free tier** - 100k requests/day

## Steps

### 1. Create Cloudflare Account
Go to: https://dash.cloudflare.com/sign-up

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 3. Create Worker
```bash
cd S-AUTOCODE
wrangler init codex-worker
# Choose: Yes to TypeScript, No to git, Yes to deploy
```

### 4. Copy Worker Code
Replace `src/index.ts` with contents of `cloudflare-worker.js`

### 5. Deploy
```bash
wrangler deploy
```

You'll get a URL like: `https://codex-worker.YOUR-SUBDOMAIN.workers.dev`

### 6. Update S-AUTOCODE
In `fireworks-ai.js`, change:
```javascript
this.apiUrl = 'https://codex-worker.YOUR-SUBDOMAIN.workers.dev';
this.useMock = false; // Enable real AI
```

### 7. Push and Test
```bash
git add fireworks-ai.js
git commit -m "Connect to Cloudflare Worker"
git push
```

## Result
- ⚡ **Instant responses** (edge network)
- 🌍 **Global CDN** (low latency everywhere)
- 🔒 **Secure** (API key hidden in worker)
- 💰 **Free** (100k requests/day)

## Alternative: Vercel Edge Function

If you prefer Vercel:

1. Create `api/codex.js`:
```javascript
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const body = await req.json();
  const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer key_eEDSHgkIYo5hjal14'
    },
    body: JSON.stringify({
      model: 'accounts/ahmedparr93-mr3fh2cp/deployments/o5hjal14',
      ...body
    })
  });
  return response;
}
```

2. Deploy: `vercel --prod`

## Current Status
- ✅ Mock responses work instantly (no backend)
- ⏳ Real AI needs edge function (this guide)
- 🎯 Choose: Fast mock OR real AI with edge deploy