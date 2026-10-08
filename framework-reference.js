(()=>{
// Open a collapsed survey before following a link into its contents.
function revealSurvey(){
 const id=decodeURIComponent(location.hash.slice(1)),target=document.getElementById(id);
 const survey=target?.closest('details.survey-source');
 if(survey){survey.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}))}
}
addEventListener('hashchange',revealSurvey);
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="#"]');if(!a)return;
 const target=document.getElementById(decodeURIComponent(a.hash.slice(1)));
 const survey=target?.closest('details.survey-source');
 if(survey)survey.open=true;
});
revealSurvey();

const data=document.querySelector('#framework-concepts');if(!data)return;
const concepts=JSON.parse(data.textContent),article=document.querySelector('.prose');
const box=document.createElement('aside');box.className='framework-popover';box.hidden=true;box.id='framework-popover';box.setAttribute('aria-label','Framework reference');
const title=document.createElement('strong'),quote=document.createElement('p'),link=document.createElement('a'),close=document.createElement('button');
close.textContent='×';close.setAttribute('aria-label','Close framework reference');link.textContent='Read full section ↗';box.append(close,title,quote,link);document.body.append(box);
let current=null,timer;
function hide(){clearTimeout(timer);box.hidden=true;if(current){current.setAttribute('aria-expanded','false');current.removeAttribute('aria-describedby')}current=null}
function position(){
 if(!current)return;
 const r=current.getBoundingClientRect(),b=box.getBoundingClientRect();
 box.style.left=Math.max(12,Math.min(innerWidth-b.width-12,r.left))+'px';
 box.style.top=Math.max(12,Math.min(innerHeight-b.height-12,r.bottom+8))+'px';
}
function show(el){
 clearTimeout(timer);if(current&&current!==el)hide();current=el;
 const c=concepts[el.dataset.concept];title.textContent=c.title;quote.textContent=c.description;
 link.href=(document.getElementById(c.id)?'':'framework.html')+'#'+c.id;
 box.hidden=false;el.setAttribute('aria-expanded','true');el.setAttribute('aria-describedby',box.id);position();
}
function delayedHide(){clearTimeout(timer);timer=setTimeout(()=>{if(!box.matches(':hover')&&!box.contains(document.activeElement)&&current!==document.activeElement)hide()},220)}
const byId=Object.fromEntries(Object.entries(concepts).map(([k,c])=>[c.id,k]));
// Existing links to a known section gain the same preview.
article.querySelectorAll('a').forEach(a=>{
 if(a.closest('h1,h2,h3,h4,h5'))return;
 const u=new URL(a.href,location.href);
 const id=decodeURIComponent(u.hash.slice(1));
 if(byId[id])a.dataset.concept=byId[id];
 else if(/framework\.html$/.test(u.pathname)&&!u.hash)a.dataset.concept='Alignment Framework';
});
// Mark explicit framework codes in prose, including A1–A2 loops. Do not alter links or headings.
const walker=document.createTreeWalker(article,NodeFilter.SHOW_TEXT);
const nodes=[];while(walker.nextNode())if(!walker.currentNode.parentElement.closest('a,button,h1,h2,h3,h4,h5,script,figure'))nodes.push(walker.currentNode);
nodes.forEach(node=>{
 const pattern=/\b(?:A[1-4](?:[ab])?|S[1-3])\b/g;let m,last=0;const f=document.createDocumentFragment();
 while((m=pattern.exec(node.textContent))){
  if(!concepts[m[0]])continue;
  f.append(document.createTextNode(node.textContent.slice(last,m.index)));
  const a=document.createElement('a');a.textContent=m[0];a.dataset.concept=m[0];
  a.href=(document.getElementById(concepts[m[0]].id)?'':'framework.html')+'#'+concepts[m[0]].id;
  f.append(a);last=pattern.lastIndex;
 }
 if(last){f.append(document.createTextNode(node.textContent.slice(last)));node.replaceWith(f)}
});
article.querySelectorAll('a[data-concept]').forEach(a=>{
 if(!concepts[a.dataset.concept])return;
 a.classList.add('framework-term');a.setAttribute('aria-expanded','false');a.setAttribute('aria-controls',box.id);
 a.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')show(a)});
 a.addEventListener('pointerleave',delayedHide);a.addEventListener('focus',()=>show(a));a.addEventListener('blur',delayedHide);
 a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();show(a)});
 a.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();show(a);close.focus()}});
});
box.addEventListener('pointerenter',()=>clearTimeout(timer));box.addEventListener('pointerleave',delayedHide);box.addEventListener('focusout',delayedHide);
close.onclick=()=>{const old=current;hide();if(old){old.focus();hide()}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden){const old=current;hide();if(box.contains(document.activeElement)&&old){old.focus();hide()}}});
document.addEventListener('pointerdown',e=>{if(!box.contains(e.target)&&!e.target.closest('.framework-term'))hide()});
addEventListener('scroll',hide,{passive:true});addEventListener('resize',hide);
// Keep only the active major part open as the reader moves through the essay.
let frame;
addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
 const active=document.querySelector('.contents [aria-current]')?.closest('details');
 if(active)document.querySelectorAll('.contents details').forEach(d=>{d.open=d===active});
})},{passive:true});
})();
