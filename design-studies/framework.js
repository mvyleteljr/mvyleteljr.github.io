(()=>{
const $=s=>document.querySelector(s),key='alignment-reading-full-v1';
let saved=[],selection=null;
try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))saved=data.filter(x=>x.kind==='Your passage'&&typeof x.text==='string'&&typeof x.kind==='string'&&/^#[\w.:-]+$/.test(x.source)).slice(0,100);}catch{}
const headings=[...document.querySelectorAll('.prose h2,.prose h3,.prose h4,.prose h5')];
headings.forEach(h=>{if(h.closest('summary'))return;const a=document.createElement('a');a.href='#'+h.id;a.title='Link to this section';while(h.firstChild)a.append(h.firstChild);h.append(a)});
const navLinks=[...document.querySelectorAll('.contents a[href^="#"]')];
let navFrame;
function updateNavigation(){
  const current=headings.filter(h=>!h.closest('details.survey-source:not([open]) .survey-body')&&h.getBoundingClientRect().top<=160).pop();
  navLinks.forEach(a=>{if(current&&a.hash==='#'+current.id){a.setAttribute('aria-current','location');const group=a.closest('.nav-group');if(group)group.open=true}else a.removeAttribute('aria-current')});
}
addEventListener('scroll',()=>{cancelAnimationFrame(navFrame);navFrame=requestAnimationFrame(updateNavigation)},{passive:true});
updateNavigation();
const copyPrompt=$('#copy-agent-prompt');
if(copyPrompt)copyPrompt.onclick=async()=>{
  const field=$('#agent-prompt-text'),status=$('#prompt-copy-status');
  try{await navigator.clipboard.writeText(field.value);status.textContent='Copied.'}
  catch{field.focus();field.select();status.textContent='Select Copy from your browser, or press Command+C / Ctrl+C.'}
};
function announce(text){$('#announcement').textContent=text}
function persist(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{announce('Browser storage is unavailable. References will last for this visit.')}}
function setPanel(open){$('#reference-panel').hidden=!open;$('#reference-toggle').setAttribute('aria-expanded',String(open));document.body.classList.toggle('references-open',open)}
function add(item){if(!saved.some(x=>x.text===item.text&&x.source===item.source)){saved.push(item);persist();render();announce('Added to references.')}setPanel(true);$('#kept').lastElementChild?.scrollIntoView({block:'nearest'})}
function render(){const host=$('#kept');host.replaceChildren();$('#count').textContent=saved.length?'('+saved.length+')':'';$('#saved-count').textContent=saved.length;
if(!saved.length){const p=document.createElement('p');p.className='empty';p.textContent='Your selected passages will appear here.';host.append(p)}
saved.forEach((item,i)=>{const card=document.createElement('section');card.className='ref-card';const header=document.createElement('header'),label=document.createElement('span'),remove=document.createElement('button');label.textContent=item.kind;remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label','Remove '+item.kind.toLowerCase());remove.onclick=()=>{saved.splice(i,1);persist();render()};header.append(label,remove);const p=document.createElement('p');p.textContent=item.text;const a=document.createElement('a');a.textContent='Back to passage ↗';a.href=item.source;a.onclick=()=>{if(innerWidth<1000)setPanel(false)};card.append(header,p,a);host.append(card)})}
$('#reference-toggle').onclick=()=>setPanel($('#reference-panel').hidden);$('#close-panel').onclick=()=>{setPanel(false);$('#reference-toggle').focus()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){setPanel(false);$('#keep-selection').hidden=true}});
function inspectSelection(){const s=getSelection(),b=$('#keep-selection');if(!s.rangeCount||s.isCollapsed){b.hidden=true;return}const r=s.getRangeAt(0),node=r.commonAncestorContainer,el=node.nodeType===1?node:node.parentElement;if(!el.closest('.prose')){b.hidden=true;return}const text=s.toString().trim();if(!text){b.hidden=true;return}const start=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement;selection={kind:'Your passage',text,source:'#'+(start.closest('[id]')?.id||'a2')};const rect=r.getBoundingClientRect();b.style.left=Math.max(8,Math.min(innerWidth-150,rect.left))+'px';b.style.top=Math.max(8,Math.min(innerHeight-50,rect.bottom+8))+'px';b.hidden=false}
document.addEventListener('mouseup',inspectSelection);document.addEventListener('selectionchange',inspectSelection);document.addEventListener('keyup',e=>{if(e.key!=='Escape')inspectSelection()});$('#keep-selection').onmousedown=e=>e.preventDefault();$('#keep-selection').onclick=()=>{if(selection)add(selection);$('#keep-selection').hidden=true;getSelection().removeAllRanges()};addEventListener('scroll',()=>{$('#keep-selection').hidden=true},{passive:true});
try{const last=localStorage.getItem(key+'-position');if(last&&document.getElementById(last)){$('#resume').href='#'+last;$('#resume').hidden=false}}catch{}
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){try{localStorage.setItem(key+'-position',e.target.id)}catch{}}},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.prose p[id]').forEach(p=>observer.observe(p));render();
})();
