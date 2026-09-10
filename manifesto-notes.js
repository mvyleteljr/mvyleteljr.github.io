(() => {
  const article=document.querySelector('.manifesto');
  const content=article.querySelector('.manifesto-content');
  const title=article.querySelector('.page-heading h1');
  // Retain original text nodes so overlapping notes never create nested links.
  const roots=[title,content];
  const records=roots.map(root=>{const nodes=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node,offset=0;while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}return {root,nodes,text:root.textContent};});
  const notes=JSON.parse(document.querySelector('#saved-marginalia').textContent)||[];
  const resolved=[];
  for(const note of notes){
    let record,start;
    if(note.scope){record=records[note.scope==='title'?0:1];start=note.start;if(record.text!==note.block){const found=record.text.indexOf(note.quote);if(found<0||record.text.indexOf(note.quote,found+1)!==-1)continue;start=found;}}
    else {record=records[1];const block=[...content.querySelectorAll('p')].find(p=>p.textContent===note.block);if(!block)continue;const first=record.nodes.find(n=>block.contains(n.node));if(!first)continue;start=first.start+note.start;}
    if(record.text.slice(start,start+note.end-note.start)!==note.quote)continue;
    resolved.push({...note,record,a:start,b:start+note.end-note.start});
  }
  resolved.sort((a,b)=>records.indexOf(a.record)-records.indexOf(b.record)||a.a-b.a);
  for(const record of records)for(const item of record.nodes){
    const matches=resolved.filter(n=>n.record===record&&n.a<item.end&&n.b>item.start);if(!matches.length)continue;
    const cuts=[...new Set([item.start,item.end,...matches.flatMap(n=>[Math.max(item.start,n.a),Math.min(item.end,n.b)])])].sort((a,b)=>a-b);
    const fragment=document.createDocumentFragment();
    for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],ids=matches.filter(n=>n.a<b&&n.b>a).map(n=>n.id);const text=item.node.data.slice(a-item.start,b-item.start);if(!ids.length){fragment.append(text);continue;}const span=document.createElement('span');span.className='margin-highlight';span.dataset.notes=ids.join(' ');span.textContent=text;span.tabIndex=0;span.setAttribute('role','button');span.setAttribute('aria-label',text+' — '+ids.length+' margin note'+(ids.length===1?'':'s'));let next=0;function reveal(){const box=document.getElementById(ids[next++%ids.length]);box.scrollIntoView({block:'nearest',behavior:'smooth'});box.focus({preventScroll:true});}span.addEventListener('click',e=>{if(!getSelection().isCollapsed)return;if(e.target.closest('a'))return;reveal();});span.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();reveal();}});fragment.append(span);}
    item.node.replaceWith(fragment);
  }
  const layer=document.createElement('div');layer.className='manifesto-margins';article.append(layer);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('manifesto-lines');svg.setAttribute('aria-hidden','true');article.append(svg);
  for(const note of resolved){const box=document.createElement('aside');box.className='margin-box';box.id=note.id;box.dataset.side=note.side;box.tabIndex=-1;box.setAttribute('aria-label','Margin note');box.append(document.getElementById('rendered-'+note.id).content.cloneNode(true));const stamp=document.createElement('p');stamp.className='margin-timestamp';if(note.updated_at||note.created_at){const date=new Date(note.updated_at||note.created_at);const time=document.createElement('time');time.dateTime=date.toISOString();time.textContent=date.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});stamp.append(note.updated_at&&note.updated_at!==note.created_at?'Updated ':'Added ',time);}else stamp.textContent='Date not recorded';box.append(stamp);layer.append(box);
    const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT),nodes=[];let node;while((node=walker.nextNode()))if(!node.parentElement.closest('a,code,pre'))nodes.push(node);
    for(const node of nodes){const parts=node.textContent.split(/(https?:\/\/[^\s<>]+)/g);if(parts.length===1)continue;const fragment=document.createDocumentFragment();for(const part of parts){if(!/^https?:\/\//.test(part)){fragment.append(part);continue;}const url=part.replace(/[.,;:!?]+$/,'');const a=document.createElement('a');a.href=url;a.textContent=url;fragment.append(a,part.slice(url.length));}node.replaceWith(fragment);}
  }
  let frame;
  function draw(){svg.replaceChildren();layer.style.height='';article.style.minHeight='';if(matchMedia('(max-width:1150px)').matches)return;
    const bounds=article.getBoundingClientRect(),textBounds=content.getBoundingClientRect();const bottom={left:0,right:0};
    for(const note of resolved){const box=document.getElementById(note.id);const marks=[...article.querySelectorAll('[data-notes]')].filter(el=>el.dataset.notes.split(' ').includes(note.id));const rect=marks[0]?.getClientRects()[0];if(!rect)continue;const left=note.side==='left',y=Math.max(rect.top-bounds.top,bottom[note.side]);box.style.top=y+'px';bottom[note.side]=y+box.offsetHeight+16;const b=box.getBoundingClientRect();const x=(left?rect.left:rect.right)-bounds.left;const gutter=(left?textBounds.left-16:textBounds.right+16)-bounds.left;const end=(left?b.right:b.left)-bounds.left;const line=document.createElementNS(svg.namespaceURI,'polyline');line.setAttribute('points',`${x},${rect.bottom-bounds.top} ${gutter},${rect.bottom-bounds.top+3} ${gutter},${y+16} ${end},${y+16}`);svg.append(line);}
    article.style.minHeight=Math.max(bottom.left,bottom.right)+'px';
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}
  const observer=new ResizeObserver(schedule);roots.forEach(root=>observer.observe(root));[...layer.children].forEach(box=>observer.observe(box));addEventListener('resize',schedule);document.fonts.ready.then(schedule);schedule();
  dispatchEvent(new Event('marginalia-ready'));
})();
