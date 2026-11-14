"""Local static preview with the same security headers defined in vercel.json.
Usage: python3 scripts/devserver.py 4173
"""
import http.server
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / 'vercel.json').read_text())
HEADERS = {entry['key']: entry['value'] for entry in CONFIG['headers'][0]['headers']}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        for key, value in HEADERS.items():
            self.send_header(key, value)
        if self.path.startswith('/assets/'):
            self.send_header('Cache-Control', 'public, max-age=86400')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    with http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler) as server:
        print('Secure preview http://127.0.0.1:' + str(port), flush=True)
        server.serve_forever()
