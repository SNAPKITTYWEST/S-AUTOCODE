#!/usr/bin/env python3
"""
CODEX Server - Local proxy for Fireworks AI
Run this locally to enable CODEX agent in S-AUTOCODE
Usage: python codex-server.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.error

FIREWORKS_API_KEY = "key_eEDSHgkIYo5hjal14"
MODEL_PATH = "accounts/ahmedparr93-mr3fh2cp/deployments/o5hjal14"
API_URL = "https://api.fireworks.ai/inference/v1/chat/completions"

class CodexHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Proxy requests to Fireworks AI"""
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            # Add model path
            data['model'] = MODEL_PATH
            
            # Create request to Fireworks
            req = urllib.request.Request(
                API_URL,
                data=json.dumps(data).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {FIREWORKS_API_KEY}'
                }
            )
            
            # Make request
            with urllib.request.urlopen(req, timeout=30) as response:
                result = response.read()
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(result)
            
            print(f"✓ Request processed successfully")
            
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"✗ API Error: {e.code} - {error_body}")
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(error_body.encode('utf-8'))
            
        except Exception as e:
            print(f"✗ Server Error: {str(e)}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error = json.dumps({'error': str(e)})
            self.wfile.write(error.encode('utf-8'))

    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

if __name__ == '__main__':
    PORT = 8765
    server = HTTPServer(('localhost', PORT), CodexHandler)
    print(f"""
╔══════════════════════════════════════════╗
║     CODEX Server Running                 ║
╚══════════════════════════════════════════╝

Listening on: http://localhost:{PORT}
Fireworks Model: {MODEL_PATH}

Update S-AUTOCODE to use this endpoint:
  const apiUrl = 'http://localhost:{PORT}';

Press Ctrl+C to stop
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nShutting down...")
        server.shutdown()

# Made with Bob
