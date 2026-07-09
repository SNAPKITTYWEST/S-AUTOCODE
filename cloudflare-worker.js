// Cloudflare Worker for CODEX - Deploy to workers.cloudflare.com
// Handles CORS and provides instant Fireworks AI responses

const FIREWORKS_API_KEY = 'fw_nWm5Lhhp8mbShSuFyJwws';
const MODEL_PATH = 'accounts/fireworks/models/qwen2p5-coder-32b-instruct';
const API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse request
      const body = await request.json();
      
      // Add model path
      body.model = MODEL_PATH;
      
      // Call Fireworks AI
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Return with CORS headers
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

// Made with Bob
