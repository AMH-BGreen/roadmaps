import http.server, socketserver, os

import os
PORT = int(os.environ.get('PORT', 3131))
SERVE_DIR = '/Users/brgreen/Documents/Claude/Projects/AMH/roadmap'

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/' or path == '':
            path = '/index.html'
        filepath = SERVE_DIR + path
        try:
            with open(filepath, 'rb') as f:
                data = f.read()
            ext = path.rsplit('.', 1)[-1] if '.' in path else ''
            ct = {'html':'text/html','css':'text/css','js':'application/javascript',
                  'json':'application/json','png':'image/png','svg':'image/svg+xml'}.get(ext,'text/plain')
            self.send_response(200)
            self.send_header('Content-Type', ct)
            self.send_header('Content-Length', len(data))
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')
    def log_message(self, fmt, *args):
        pass

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    httpd.serve_forever()
