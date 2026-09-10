import importlib.util,tempfile,json
from pathlib import Path
spec=importlib.util.spec_from_file_location('editor','scripts/manifesto-editor.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
p=Path(tempfile.mkdtemp())/'manifesto.md';original='---\nlayout: manifesto\ntitle: Test\n---\n\nA **test** paragraph.\n';p.write_text(original)
_,_,version=m.read_document(p)
note=dict(id='margin-test',block='A test paragraph.',start=2,end=6,quote='test',note='A [source](https://example.com).',side='left')
m.save_document(p,version,[note]);assert m.read_document(p)[1]==[note];assert p.read_text().split('---',2)[2]==original.split('---',2)[2]
try:m.save_document(p,version,[]);raise AssertionError('stale write accepted')
except ValueError:pass
_,_,version=m.read_document(p);m.save_document(p,version,[]);assert m.read_document(p)[1]==[]
print('Save, body preservation, stale-write rejection, and removal passed.')
