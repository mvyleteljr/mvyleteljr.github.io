import importlib.util,tempfile,json
from pathlib import Path
spec=importlib.util.spec_from_file_location('editor','scripts/manifesto-editor.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
p=Path(tempfile.mkdtemp())/'manifesto.md';original='---\nlayout: manifesto\ntitle: Test\n---\n\nA **test** paragraph.\n';p.write_text(original)
_,_,version=m.read_document(p)
note=dict(id='margin-test',block='A test paragraph.',start=2,end=6,quote='test',note='A [source](https://example.com).',side='left')
m.save_document(p,version,[note]);saved=m.read_document(p)[1][0];assert all(saved[k]==v for k,v in note.items());assert saved['created_at']==saved['updated_at'];assert p.read_text().split('---',2)[2]==original.split('---',2)[2]
try:m.save_document(p,version,[]);raise AssertionError('stale write accepted')
except ValueError:pass
_,_,version=m.read_document(p);m.save_document(p,version,[]);assert m.read_document(p)[1]==[]
print('Save, body preservation, stale-write rejection, and removal passed.')
_,_,version=m.read_document(p)
second={**note,'id':'margin-second','start':0,'end':6,'quote':'A test'}
title=dict(id='margin-title',scope='title',block='Test',start=0,end=4,quote='Test',note='Title context',side='right')
m.save_document(p,version,[note,second,title])
assert len(m.read_document(p)[1])==3
assert p.read_text().split('---',2)[2]==original.split('---',2)[2]
print('Multiple overlapping notes and title notes passed.')

_,saved,version=m.read_document(p)
prior=saved[0].copy()
m.save_document(p,version,saved)
assert m.read_document(p)[1][0]==prior
_,saved,version=m.read_document(p)
saved[0]["note"]="Changed context"
m.save_document(p,version,saved)
assert m.read_document(p)[1][0]["created_at"]==prior["created_at"]
assert "last_updated: " in p.read_text()
print("Timestamp creation and preservation passed.")
