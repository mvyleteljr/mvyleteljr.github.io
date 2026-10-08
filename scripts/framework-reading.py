"""Reading aids built from the same source as the article."""
from html import escape
import json, re

def enhance(body, headings, tab, plain, walk):
    belief=next((h for h in headings if h['text']=='Beliefs & Trajectory'),None)
    if not belief:return body, '', '', ''
    ps=list(walk(tab['body']['content']))
    concepts={}
    for h in headings:
        if h['index']>=belief['index']:break
        code=re.match(r'^(A[1-4](?:[ab])?|S[1-3]):',h['text'])
        if code and code[1] in concepts:continue
        if not code and h['text'] not in ('Alignment','Safety','Alignment Framework','Alignment Card:','Safety - Card'):continue
        end=next((n['index'] for n in headings if n['index']>h['index'] and n['level']<=h['level']),belief['index'])
        texts=[plain(x['paragraph']).strip() for x in ps if h['index']<x['startIndex']<end and plain(x['paragraph']).strip() and not x['paragraph'].get('paragraphStyle',{}).get('namedStyleType','').startswith('HEADING')]
        cue=next((t for t in texts if t.startswith('Recognition Cue:')),None)
        description=(cue.removeprefix('Recognition Cue:').strip() if cue else next((t for t in texts if len(t)>90),texts[0] if texts else h['text']))
        if h['text'] in ('Alignment','Safety'):
            definition=next((plain(x['paragraph']).strip().split(':',1)[1].strip() for x in ps if plain(x['paragraph']).strip().startswith(h['text']+': ')),None)
            description=definition or description
        key=code[1] if code else h['text'].rstrip(':')
        concepts[key]={'title':h['text'].rstrip(':'),'description':description,'id':h['id']}
    data='<script type="application/json" id="framework-concepts">'+json.dumps(concepts,ensure_ascii=False).replace('<','\\u003c')+'</script>'
    # The chart repeats the source table, never substitutes for it.
    weights=next((h for h in headings if h['text']=='Weighing the Framework'),None)
    chart=''
    if weights:
        table=next((x['table'] for x in tab['body']['content'] if x.get('startIndex',0)>weights['index'] and 'table' in x),None)
        if table:
            rows=[]
            for row in table['tableRows'][1:]:
                cells=[' '.join(plain(x['paragraph']).strip() for x in walk(cell['content'])).strip() for cell in row['tableCells']]
                if len(cells)!=3 or not re.fullmatch(r'\d+%',cells[1]):continue
                value=int(cells[1][:-1]);code=cells[0].split()[0]
                rows.append('<li><a data-concept="'+escape(code)+'" href="#'+concepts[code]['id']+'">'+escape(cells[0])+'</a><span class="weight-track"><span style="width:'+str(value)+'%"></span></span><strong>'+cells[1]+'</strong><small>'+escape(cells[2])+'</small></li>')
            chart='<figure class="weight-chart"><figcaption>Weighing the Framework</figcaption><p>Current research weights, not financial allocations.</p><ul>'+''.join(rows)+'</ul></figure>'
            needle=f'<h{weights["level"]} id="{weights["id"]}">'
            pos=body.index('</h'+str(weights['level'])+'>',body.index(needle))+len('</h'+str(weights['level'])+'>')
            body=body[:pos]+chart+body[pos:]
    marker=f'<h{belief["level"]} id="{belief["id"]}">'
    standalone=body[body.index(marker):]
    # Cross-page heading links keep working without JavaScript.
    local_ids=set(re.findall(r'id="([^"]+)"',standalone))
    standalone=re.sub(r'href="#([^"]+)"',lambda m:m[0] if m[1] in local_ids else 'href="framework.html#'+m[1]+'"',standalone)
    return body,standalone,data,belief['id']

def navigation(headings, standalone=False):
    belief=next((h for h in headings if h['text']=='Beliefs & Trajectory'),None)
    if not belief:return None,''
    groups={'Frameworks':[],'Research surveys':[],'Beliefs & Trajectory':[]}
    active='Frameworks'
    for h in headings:
        if h['index']>=belief['index']:active='Beliefs & Trajectory'
        elif h['text'] in ('Alignment Survey','Safety Survey'):active='Research surveys'
        elif h['text']=='Safety Framework':active='Frameworks'
        groups[active].append(h)
    nav=[]
    for name,items in groups.items():
        if standalone and name!='Beliefs & Trajectory':continue
        links=''.join('<a class="nav-level-'+str(h['level'])+'" href="#'+h['id']+'">'+escape(h['text'].rstrip(':'))+'</a>' for h in items)
        nav.append('<details class="nav-group"'+(' open' if standalone else '')+'><summary>'+escape(name)+'</summary><div>'+links+'</div></details>')
    if standalone:
        nav.insert(0,'<a href="framework.html">← Full framework</a>')
    else:
        nav.insert(0,'<a href="#introduction">Introduction</a>')
    targets=[('Frameworks','Definitions · A1–A4 · S1–S3',groups['Frameworks'][0]['id']),('Research surveys','Alignment · Safety',groups['Research surveys'][0]['id']),('Beliefs & Trajectory','Priorities · Weights · Counterarguments',belief['id'])]
    overview='<nav class="reading-map" aria-label="Reading paths">'+''.join('<a href="#'+i+'"><strong>'+escape(n)+'</strong><span>'+escape(d)+'</span></a>' for n,d,i in targets)+'</nav><p class="standalone-link"><a href="beliefs.html">Read Beliefs &amp; Trajectory on its own ↗</a></p>'
    return ''.join(nav),overview
