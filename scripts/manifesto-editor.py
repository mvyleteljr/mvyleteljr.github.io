#!/usr/bin/env python3
"""Local-only Markdown annotation editor. Run from any directory."""
import argparse, hashlib, html, json, os, secrets, subprocess, tempfile, threading
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
def read_document(path):
    text = path.read_text()
    parts = text.split('---', 2)
    if len(parts) != 3 or parts[0]: raise ValueError('Expected Markdown front matter.')
    notes = []
    for line in parts[1].splitlines():
        if line.startswith('marginalia: '): notes = json.loads(line[len('marginalia: '):])
    return text, notes, hashlib.sha256(text.encode()).hexdigest()

def save_document(path, version, notes):
    original, _, current = read_document(path)
    if version != current: raise ValueError('The file changed since this page loaded. Reload before saving.')
    if not isinstance(notes, list) or len(notes)>100: raise ValueError('Too many notes.')
    ids=set()
    for note in notes:
        if not isinstance(note,dict) or set(note)-{'scope'}!={'id','block','start','end','quote','note','side'}: raise ValueError('Invalid note.')
        if any(not isinstance(note[k],str) for k in ['id','block','quote','note','side']): raise ValueError('Invalid text.')
        if not note['id'].startswith('margin-') or not note['id'].replace('-','').isalnum() or note['id'] in ids: raise ValueError('Invalid note ID.')
        if 'scope' in note and note['scope'] not in ['title','content']: raise ValueError('Invalid text scope.')
        if note['side'] not in ['left','right'] or not note['note'].strip() or len(note['note'])>20000: raise ValueError('Invalid margin note.')
        a,b=note['start'],note['end']
        # Browser offsets use UTF-16 code units.
        encoded=note['block'].encode('utf-16-le')
        if type(a)!=int or type(b)!=int or not 0<=a<b<=len(encoded)//2: raise ValueError('Invalid selection.')
        if encoded[a*2:b*2].decode('utf-16-le')!=note['quote']: raise ValueError('Selected text does not match.')
        ids.add(note['id'])
    _,front,body=original.split('---',2)
    lines=[line for line in front.splitlines() if not line.startswith('marginalia: ')]
    front='\n'.join(lines).strip('\n')
    updated='---\n'+front+'\nmarginalia: '+json.dumps(notes,ensure_ascii=False)+'\n---'+body
    fd,name=tempfile.mkstemp(prefix='.manifesto-',dir=path.parent)
    try:
        with os.fdopen(fd,'w') as f: f.write(updated)
        os.replace(name,path)
    finally:
        if os.path.exists(name): os.unlink(name)
    return original

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4176);args=parser.parse_args()
    destination=Path(tempfile.mkdtemp(prefix='manifesto-editor-'))
    token=secrets.token_urlsafe(32);lock=threading.Lock();document=ROOT/'manifesto.md'
    origin=f'http://127.0.0.1:{args.port}'
    def build():
        result=subprocess.run(['bundle','exec','jekyll','build','--destination',str(destination)],cwd=ROOT,capture_output=True,text=True)
        if result.returncode: raise RuntimeError('The site build failed. See the server terminal.\n'+result.stderr[-2000:])
    build()
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw): super().__init__(*a,directory=str(destination),**kw)
        def valid_host(self): return self.headers.get('Host') in [f'127.0.0.1:{args.port}',f'localhost:{args.port}']
        def reply(self,status,data):
            raw=json.dumps(data).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw)
        def do_GET(self):
            if not self.valid_host(): return self.reply(403,{'error':'Invalid host.'})
            route=urlsplit(self.path).path
            if route=='/__editor/state':
                _,notes,version=read_document(document);return self.reply(200,{'notes':notes,'version':version,'token':token})
            if route=='/__editor/ui.js':
                raw=(ROOT/'scripts/manifesto-editor-ui.js').read_bytes();self.send_response(200);self.send_header('Content-Type','text/javascript');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw);return
            if route=='/manifesto.html':
                raw=(destination/'manifesto.html').read_text().replace('</body>','<script src="/__editor/ui.js"></script></body>')
                self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw.encode());return
            if not Path(self.translate_path(route)).exists() and Path(self.translate_path(route)+'.html').exists(): self.path=route+'.html'
            super().do_GET()
        def do_POST(self):
            if not self.valid_host() or urlsplit(self.path).path!='/__editor/save' or self.headers.get('Origin') not in [origin,f'http://localhost:{args.port}'] or self.headers.get('X-Editor-Token')!=token:
                return self.reply(403,{'error':'Local editor authorization failed.'})
            try:
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<2000000 or self.headers.get('Content-Type')!='application/json': raise ValueError('Invalid request.')
                data=json.loads(self.rfile.read(size))
                with lock:
                    original=save_document(document,data['version'],data['notes'])
                    try: build()
                    except Exception:
                        document.write_text(original);raise
                self.reply(200,{'saved':True})
            except (ValueError,KeyError) as e: self.reply(409,{'error':str(e)})
            except Exception as e: print(e,flush=True);self.reply(500,{'error':'Save failed; the previous Markdown was restored.'})
    print(f'Editor: {origin}/manifesto.html',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
if __name__=='__main__': main()
