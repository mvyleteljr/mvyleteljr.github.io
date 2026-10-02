#!/usr/bin/env python3
"""Convert the saved Google Docs Write-Up tab to the local reading study.
No network calls. Source stays unchanged; one approved wording change is applied.
"""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from collections import Counter
import json, re, hashlib

ROOT=Path(__file__).resolve().parents[1]
STUDY=ROOT/'design-studies'
snapshot=json.loads((STUDY/'source/write-up.json').read_text())
tab=snapshot['tab']
OLD='with black box tactics'
NEW='including black box tactics'
counts=Counter()
headings=[]
ids={}
counters={}

def plain(p): return ''.join(e.get('textRun',{}).get('content','') for e in p['elements'])
def corrected(s): return s.replace(OLD,NEW)
def slug(s): return re.sub('[^a-z0-9]+','-',s.lower()).strip('-')
def walk(content):
    for item in content:
        if 'paragraph' in item: yield item
        if 'table' in item:
            for row in item['table']['tableRows']:
                for cell in row['tableCells']: yield from walk(cell['content'])

for item in walk(tab['body']['content']):
    p=item['paragraph']; text=plain(p).strip(); style=p.get('paragraphStyle',{}).get('namedStyleType','NORMAL_TEXT')
    if style.startswith('HEADING_'):
        # Native heading IDs are stable even when a heading's wording changes.
        hid='h-'+p.get('paragraphStyle',{}).get('headingId',str(item['startIndex']))
        ids[p.get('paragraphStyle',{}).get('headingId','')]=hid
        headings.append(dict(id=hid,text=text,level=int(style[-1]),index=item['startIndex']))
heading_by_index={h['index']:h for h in headings}


def inline(p):
    output=[]
    # Apply the approved wording change even if Docs split it across style runs.
    source=plain(p); starts=[m.start() for m in re.finditer(re.escape(OLD),source)]
    offset=0
    for e in p['elements']:
        if 'textRun' not in e: raise ValueError('Unsupported paragraph element: '+str(e.keys()))
        run=e['textRun'];text=run['content']; end=offset+len(text)
        for start in reversed(starts):
            # Replace only "with"; all following words retain their source styles.
            lo=max(start,offset);hi=min(start+4,end)
            if lo<hi:
                text=text[:lo-offset]+(NEW.split(' ')[0] if lo==start else '')+text[hi-offset:]
        offset=end
        value=escape(text);style=run.get('textStyle',{})
        for flag,tag in [('bold','strong'),('italic','em'),('underline','u'),('strikethrough','s')]:
            if style.get(flag):value=f'<{tag}>{value}</{tag}>'
        baseline=style.get('baselineOffset')
        if baseline in ['SUPERSCRIPT','SUBSCRIPT']:
            tag='sup' if baseline=='SUPERSCRIPT' else 'sub';value=f'<{tag}>{value}</{tag}>'
        link=style.get('link')
        if link:
            href=link.get('url')
            if not href and link.get('headingId'):href='#'+ids[link['headingId']]
            if not href:raise ValueError('Unsupported link: '+str(link))
            if not re.match(r'^(https?://|mailto:|#)',href):raise ValueError('Unexpected link scheme')
            value=f'<a href="{escape(href,quote=True)}">{value}</a>';counts['links']+=1
        output.append(value)
    return ''.join(output)

def render(content):
    out=[];stack=[]
    def close():
        frame=stack.pop();out.append('</li></'+frame['tag']+'>')
    for item in content:
        p=item.get('paragraph'); bullet=p.get('bullet') if p else None
        if bullet:
            level=bullet.get('nestingLevel',0);list_id=bullet['listId']
            while len(stack)>level+1:close()
            if stack and stack[-1]['id']!=list_id:
                while stack:close()
            if level>len(stack):raise ValueError('List skips a nesting level')
            props=tab['lists'][list_id]['listProperties']['nestingLevels'][level]
            tag='ol' if props.get('glyphType') else 'ul'
            key=(list_id,level);number=counters.get(key,props.get('startNumber',1)-1)+1;counters[key]=number
            for deeper in list(counters):
                if deeper[0]==list_id and deeper[1]>level:del counters[deeper]
            if len(stack)==level+1:out.append('</li><li>')
            else:
                types={'DECIMAL':'1','ALPHA':'a','UPPER_ALPHA':'A','ROMAN':'i','UPPER_ROMAN':'I'}
                attrs=f' start="{number}" type="{types.get(props.get("glyphType"),"1")}"' if tag=='ol' else ''
                out.append('<'+tag+attrs+'><li>');stack.append({'tag':tag,'id':list_id})
            out.append(f'<p id="p-{item["startIndex"]}">'+inline(p)+'</p>');counts['list_items']+=1
            continue
        # Blank separators in Google Docs do not end a list.
        if p and not plain(p).strip():continue
        while stack:close()
        if 'table' in item:
            counts['tables']+=1;out.append('<div class="table-scroll" tabindex="0" aria-label="Scrollable table"><table>')
            for i,row in enumerate(item['table']['tableRows']):
                out.append('<tr>')
                for cell in row['tableCells']:
                    tag='th' if i==0 else 'td';style=cell.get('tableCellStyle',{});attrs=' scope="col"' if i==0 else ''
                    for field,attr in [('rowSpan','rowspan'),('columnSpan','colspan')]:
                        if style.get(field,1)>1:attrs+=f' {attr}="{style[field]}"'
                    out.append('<'+tag+attrs+'>'+render(cell['content'])+'</'+tag+'>');counts['table_cells']+=1
                out.append('</tr>')
            out.append('</table></div>');continue
        if not p:
            if 'sectionBreak' in item:continue
            raise ValueError('Unsupported content block: '+str(item.keys()))
        h=heading_by_index.get(item.get('startIndex'))
        if h:
            tag='h'+str(h['level']);out.append(f'<{tag} id="{h["id"]}">'+inline(p)+f'</{tag}>')
        else:out.append(f'<p id="p-{item["startIndex"]}">'+inline(p)+'</p>')
    while stack:close()
    return '\n'.join(out)

body=render(tab['body']['content'])
# Wrap the full Alignment Card through the next peer or higher-level heading.
card=next(h for h in headings if h['text'].rstrip(':')=='Alignment Card')
next_heading=next((h for h in headings if h['index']>card['index'] and h['level']<=card['level']),None)
card_start=body.index(f'<h{card["level"]} id="{card["id"]}">')
card_end=body.index(f'<h{next_heading["level"]} id="{next_heading["id"]}">') if next_heading else len(body)
body=body[:card_start]+'<section class="alignment-card" aria-labelledby="'+card['id']+'">'+body[card_start:card_end]+'</section>'+body[card_end:]
# Keep the survey as its own structural unit without changing its position or text.
survey=next(h for h in headings if h['text']=='Alignment Survey')
needle=f'<h2 id="{survey["id"]}">';at=body.index(needle)
body=body[:at]+'<section class="survey-source" aria-labelledby="'+survey['id']+'">'+body[at:]+'</section>'

class Verify(HTMLParser):
    def __init__(self):super().__init__(convert_charrefs=True);self.text=[];self.tags=Counter();self.links=[]
    def handle_data(self,data):self.text.append(data)
    def handle_starttag(self,tag,attrs):
        self.tags[tag]+=1
        if tag=='a':self.links.append(dict(attrs)['href'])
verify=Verify();verify.feed(body)
normalize=lambda s:re.sub(r'\s+',' ',s).strip()
expected=normalize(corrected(''.join(plain(x['paragraph']) for x in walk(tab['body']['content']))))
actual=normalize(''.join(verify.text))
assert expected==actual,'Source text mismatch'
source_list_count=sum(bool(x['paragraph'].get('bullet')) for x in walk(tab['body']['content']))
assert source_list_count==verify.tags['li'], 'List item mismatch'
assert counts['table_cells']==verify.tags['td']+verify.tags['th']
assert len(headings)==sum(verify.tags['h'+str(i)] for i in range(1,7))
source_links=[]
for block in walk(tab['body']['content']):
    for element in block['paragraph']['elements']:
        link=element.get('textRun',{}).get('textStyle',{}).get('link')
        if link:source_links.append(link.get('url') or '#'+ids[link['headingId']])
assert verify.links==source_links,'Link targets or order changed'

# Short navigation labels do not replace the source headings in the article.
def navtext(h):
    text=h['text'].rstrip(':')
    if re.match(r'^A[1-4]:',text):text=text.split(' (')[0]
    return text
nav=['<a href="#introduction">Introduction</a>'];groups=[]
for h in headings:
    if h['level']==2:
        if groups:nav.append('</div></details>');groups=[]
        nav.append(f'<details class="nav-group"><summary><a href="#{h["id"]}">{escape(h["text"])}</a></summary><div>');groups.append(h)
    else:nav.append(f'<a class="nav-level-{h["level"]}" href="#{h["id"]}">{escape(navtext(h))}</a>')
if groups:nav.append('</div></details>')

# Preserve the approved reference panel, with its core definitions and reader tools.
old=(STUDY/'framework.html').read_text()
controls=old[old.index('<button id="keep-selection"'):old.index('</body>')]
controls=controls.replace(OLD,NEW)
source_url='https://docs.google.com/document/d/1kyRJjqGT04682q6-LIZWehKG3S0TMx_EKVim9La9jNY/preview?usp=sharing'
agent_prompt = """Read “Alignment & Safety Frontiers: A Framework”:
""" + source_url + """

Help me explore the author's framework and research index. First confirm that you can read the full document. If you cannot access it, ask me to provide an export; do not infer its contents from the title or other sources.

Use the document as the source. Preserve its definitions and distinguish the author's claims from your own analysis. Cite section names and links where available. In this piece, safety includes alignment, interpretability, and additional black-box tactics.

Start by asking whether I want to understand the framework, examine a claim, or explore the research survey. Then guide the discussion one question at a time."""
reading_intro = '<p class="disclaimer"><strong><em>Disclaimer: This is a living document and will be updated regularly. The safety framework is still in progress and will be added here soon. Read the <a href="'+escape(source_url.replace('/preview?', '/edit?'),quote=True)+'">Google Doc</a> to leave comments. Comments are welcome.</em></strong></p>'
reading_intro += '<details class="agent-prompt"><summary>Explore this document with an agent</summary><p>Copy this prompt into your agent to start a discussion.</p><textarea id="agent-prompt-text" aria-label="Prompt to copy into an agent" readonly rows="12">'+escape(agent_prompt)+'</textarea><div class="prompt-actions"><button type="button" id="copy-agent-prompt">Copy prompt</button><span id="prompt-copy-status" role="status"></span></div></details>'
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Alignment &amp; Safety Frontiers: A Framework</title><link rel="stylesheet" href="framework.css"><script src="framework.js" defer></script></head><body>
<div class="study-label">Local design study · Full Write-Up tab · <a href="loop.html">Separate loop visual ↗</a></div><header class="site"><a href="http://127.0.0.1:4175/">Marshall Vyletel Jr.</a><span>Writing / Alignment</span></header>
<div class="layout full-document"><nav class="contents" aria-label="Document contents"><span class="label">CONTENTS</span>'''+''.join(nav)+'''<a id="resume" hidden>Continue reading →</a></nav><main><header class="intro" id="introduction"><p class="label">ALIGNMENT &amp; SAFETY</p><h1>Alignment &amp; Safety Frontiers: A Framework</h1>'''+reading_intro+'''</header><article id="write-up" class="prose">'''+body+'''</article></main><aside class="side-note"><span class="label">READING TOOLS</span><p>Select a passage to keep it with you.</p><p>References includes the core definitions and your saved passages.</p></aside></div>'''+controls+'''</body></html>'''
(STUDY/'framework.html').write_text(page)
report={'documentId':snapshot['documentId'],'tabId':tab['tabId'],'revisionId':snapshot['revisionId'],'retrievedAt':snapshot['retrievedAt'],'wordCount':len(expected.split()),'sourceParagraphs':sum(1 for _ in walk(tab['body']['content'])),'headings':len(headings),'listItems':source_list_count,'tables':counts['tables'],'tableCells':counts['table_cells'],'links':counts['links'],'normalizedTextMatches':True,'linkTargetsAndOrderMatch':True,'approvedChange':{'from':OLD,'to':NEW,'occurrences':sum(plain(x['paragraph']).count(OLD) for x in walk(tab['body']['content']))},'sourceSHA256':hashlib.sha256((STUDY/'source/write-up.json').read_bytes()).hexdigest()}
(STUDY/'source/conversion-check.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

# Publish the same checked article through the shared site layout.
public_content=page[page.index('<div class="layout full-document">'):page.index('</body>')]
public_content=public_content.replace('<main>', '<div class="framework-reading">').replace('</main>', '</div>')
front_matter='---\nlayout: default\ntitle: "Alignment & Safety Frontiers: A Framework"\nsection: framework\nframework: true\ndescription: "A framework and research survey of AI alignment and safety."\n---\n'
(ROOT/'framework.html').write_text(front_matter+public_content+'\n')
for asset in ('framework.css','framework.js'):
    (ROOT/asset).write_text((STUDY/asset).read_text())
