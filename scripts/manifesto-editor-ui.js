(async () => {
  if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  const response=await fetch('/__editor/state');if(!response.ok)return;
  const state=await response.json();let enabled=false,selection=null,editing=null,saving=false,dirty=false;
  const bar=document.createElement('div');bar.className='editor-bar';
  bar.innerHTML='<button id="edit-toggle" aria-pressed="false">Edit mode</button><button id="add-margin" disabled>Add margin note</button><span id="editor-status" role="status">Local editor</span>';
  document.body.prepend(bar);
  const panel=document.createElement('dialog');panel.className='editor-dialog';
  panel.innerHTML='<form method="dialog"><h2>Margin note</h2><blockquote id="selected-quote"></blockquote><label for="note-text">Note (Markdown and links)</label><textarea id="note-text" rows="8" required></textarea><button type="button" id="insert-link">Link (⌘K)</button><div id="link-fields" hidden><label for="link-label">Link text</label><input id="link-label"><label for="link-url">URL</label><input id="link-url" type="url" placeholder="https://"><button type="button" id="apply-link">Insert link</button><button type="button" id="cancel-link">Cancel link</button><p id="link-error" role="alert"></p></div><div id="note-preview" aria-label="Note preview"></div><label for="note-side">Side</label><select id="note-side"><option value="right">Right</option><option value="left">Left</option></select><p id="save-error" role="alert"></p><div class="editor-actions"><button type="button" id="save-note">Save</button><button type="button" id="delete-note">Remove note</button><button type="button" id="cancel-note">Cancel</button></div></form>';
  document.body.append(panel);
  const style=document.createElement('style');style.textContent='.editor-bar{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;gap:12px;align-items:center;background:white;color:black;border-bottom:1px solid black;padding:10px 22px;font-size:13px}.editor-bar button,.editor-dialog button,.editor-dialog select{font:inherit;background:white;border:1px solid black;padding:7px 12px;color:black}.editor-bar button:disabled{opacity:.45}.editor-bar [aria-pressed="true"]{background:black;color:white}.editor-dialog{font:16px Optima,sans-serif;color:black;background:white;border:1px solid black;padding:24px;width:480px;max-width:calc(100% - 32px);max-height:90vh;overflow:auto}.editor-dialog::backdrop{background:rgb(0 0 0 / .2)}.editor-dialog h2{margin:0 0 18px}.editor-dialog label{display:block;margin:14px 0 6px}.editor-dialog textarea{font:inherit;line-height:1.5;display:block;width:100%;padding:12px;border:1px solid black;resize:vertical}.editor-dialog blockquote{margin:0;padding-left:12px;border-left:1px solid black;font-size:14px}.editor-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}.editor-edit-note{display:flex;align-items:center;justify-content:center;background:white;border:0;font:inherit;width:32px;height:32px;padding:8px;margin:8px 0 -8px auto}.editor-edit-note:hover{background:#000;color:#fff}.editor-edit-note[hidden]{display:none}.editor-dialog #save-error{margin-top:12px;font-size:14px}';document.head.append(style);
  const toggle=bar.querySelector('#edit-toggle'),add=bar.querySelector('#add-margin'),status=bar.querySelector('#editor-status'),text=panel.querySelector('textarea'),side=panel.querySelector('select');
  function open(note){editing=note;dirty=false;text.value=note.note||'';side.value=note.side||'right';panel.querySelector('#selected-quote').textContent=note.quote;panel.querySelector('#delete-note').hidden=!state.notes.some(n=>n.id===note.id);panel.querySelector('#save-error').textContent='';panel.querySelector('#link-fields').hidden=true;renderPreview();panel.showModal();text.focus();}
  toggle.addEventListener('click',()=>{enabled=!enabled;toggle.setAttribute('aria-pressed',String(enabled));add.disabled=true;selection=null;status.textContent=enabled?'Select text in the title or essay, or edit an existing note.':'Local editor';});
  for(const note of state.notes){const box=document.getElementById(note.id);if(!box)continue;const b=document.createElement('button');b.className='editor-edit-note';b.setAttribute('aria-label','Edit margin note');b.title='Edit margin note';b.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z"/></svg>';b.addEventListener('click',()=>open({...note}));box.append(b);}
  document.addEventListener('selectionchange',()=>{
    if(!enabled||panel.open)return;const s=getSelection();add.disabled=true;selection=null;if(!s.rangeCount||s.isCollapsed)return;
    const r=s.getRangeAt(0);const element=n=>n.nodeType===1?n:n.parentElement;
    const p=element(r.startContainer).closest('.manifesto-content, .manifesto > .page-heading h1');
    if(!p||!p.contains(r.endContainer)){status.textContent='Select text within the title or essay.';return;}
    const prefix=document.createRange();prefix.selectNodeContents(p);prefix.setEnd(r.startContainer,r.startOffset);
    const start=prefix.toString().length,quote=r.toString();if(!quote.trim())return;
    selection={id:'margin-'+crypto.randomUUID(),scope:p.matches('h1')?'title':'content',block:p.textContent,start,end:start+quote.length,quote,note:'',side:'right'};add.disabled=false;status.textContent='Selection ready.';
  });
  add.addEventListener('mousedown',e=>e.preventDefault());add.addEventListener('click',()=>{if(selection)open(selection);});
  async function save(remove){
    if(saving)return;if(!remove&&!fields.hidden&&!insertLink())return;if(!remove&&!text.value.trim()){text.reportValidity();return;}
    const updated={...editing,note:text.value,side:side.value};const notes=state.notes.filter(n=>n.id!==editing.id);if(!remove)notes.push(updated);
    saving=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='Saving and rebuilding…';
    try{const res=await fetch('/__editor/save',{method:'POST',headers:{'Content-Type':'application/json','X-Editor-Token':state.token},body:JSON.stringify({version:state.version,notes})});const result=await res.json();if(!res.ok)throw Error(result.error);dirty=false;location.href='/manifesto.html'+(remove?'':'#'+updated.id);location.reload();}
    catch(e){panel.querySelector('#save-error').textContent=e.message;status.textContent='Not saved.';saving=false;panel.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  text.addEventListener('input',()=>{dirty=true;renderPreview();});side.addEventListener('change',()=>dirty=true);
  panel.querySelector('#save-note').addEventListener('click',()=>save(false));panel.querySelector('#delete-note').addEventListener('click',()=>save(true));
  function close(){if(!saving&&(!dirty||confirm('Discard this unsaved note?'))){dirty=false;panel.close();}}
  panel.querySelector('#cancel-note').addEventListener('click',close);panel.addEventListener('cancel',e=>{e.preventDefault();close();});panel.querySelector('form').addEventListener('submit',e=>{e.preventDefault();save(false);});
  let linkStart=0,linkEnd=0;
  const fields=panel.querySelector('#link-fields'),urlInput=panel.querySelector('#link-url'),labelInput=panel.querySelector('#link-label');
  function beginLink(){linkStart=text.selectionStart;linkEnd=text.selectionEnd;labelInput.value=text.value.slice(linkStart,linkEnd);urlInput.value='';panel.querySelector('#link-error').textContent='';fields.hidden=false;urlInput.focus();}
  panel.querySelector('#insert-link').addEventListener('mousedown',e=>e.preventDefault());
  panel.querySelector('#insert-link').addEventListener('click',beginLink);
  text.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();beginLink();}});
  function insertLink(){
    const url=urlInput.value.trim();
    if(!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(url)||/[\s<>]/.test(url)){panel.querySelector('#link-error').textContent='Enter an http, https, email, or relative URL.';urlInput.focus();return false;}
    const label=(labelInput.value.trim()||url).replace(/[\[\]]/g,'');
    text.setRangeText('['+label+']('+url.replace(/\(/g,'%28').replace(/\)/g,'%29')+')',linkStart,linkEnd,'end');
    fields.hidden=true;dirty=true;text.focus();renderPreview();return true;
  }
  panel.querySelector('#apply-link').addEventListener('click',insertLink);
  urlInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();insertLink();}});
  urlInput.addEventListener('input',()=>dirty=true);labelInput.addEventListener('input',()=>dirty=true);
  panel.querySelector('#cancel-link').addEventListener('click',()=>{fields.hidden=true;text.focus();});
  function renderPreview(){
    const preview=panel.querySelector('#note-preview');preview.replaceChildren();
    // Build preview elements without interpreting pasted HTML as executable markup.
    const parts=text.value.split(/(\[[^\]]+\]\([^\s)]+\)|https?:\/\/[^\s<>]+|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    for(const part of parts){
      const link=part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
      if(link&&/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(link[2])){const a=document.createElement('a');a.textContent=link[1];a.href=link[2];a.target='_blank';a.rel='noopener noreferrer';preview.append(a);}
      else if(/^https?:\/\//.test(part)){const a=document.createElement('a');a.textContent=part;a.href=part;a.target='_blank';a.rel='noopener noreferrer';preview.append(a);}
      else if(/^\*\*[^*]+\*\*$/.test(part)){const b=document.createElement('strong');b.textContent=part.slice(2,-2);preview.append(b);}
      else if(/^\*[^*]+\*$/.test(part)){const em=document.createElement('em');em.textContent=part.slice(1,-1);preview.append(em);}
      else preview.append(document.createTextNode(part));
    }
  }
  style.textContent+='#note-preview{white-space:pre-wrap;line-height:1.6;border:1px solid black;padding:14px;margin-top:16px;min-height:52px}#note-preview:empty{display:none}#note-preview a,.margin-box a{color:black;text-decoration:underline;text-underline-offset:3px}.editor-dialog input{display:block;width:100%;font:inherit;padding:8px;border:1px solid black;margin-bottom:10px}#link-fields{border-top:1px solid black;margin-top:14px;padding-top:6px}#insert-link{margin-top:12px}';
  if(new URLSearchParams(location.search).get('edit')==='1')toggle.click();
  const pageVersion=document.querySelector('script[src="/__editor/ui.js"]').dataset.version;
  async function refreshSource(){
    try{
      const response=await fetch('/__editor/refresh',{cache:'no-store'});const result=await response.json();
      if(!response.ok){status.textContent=result.error||'The Markdown build failed.';}
      else if(result.version!==pageVersion){
        if(dirty||panel.open||saving)status.textContent='The Markdown changed. Close the note editor to refresh; unsaved notes are kept open.';
        else {location.reload();return;}
      }
    }catch(e){/* Keep the page usable while the local server restarts. */}
    setTimeout(refreshSource,1500);
  }
  setTimeout(refreshSource,1500);
  addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
})();
