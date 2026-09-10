(() => {
  const rows = document.querySelectorAll('.margin-row');
  if (!rows.length) return;
  // Link pasted web addresses without changing authored Markdown or existing links.
  rows.forEach(row => {
    const box=row.querySelector('.margin-box');
    const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while((node=walker.nextNode())) if(!node.parentElement.closest('a,code,pre,script,style')) nodes.push(node);
    nodes.forEach(node=>{
      const value=node.textContent,pattern=/https?:\/\/[^\s<>]+/g;
      let match,offset=0;const fragment=document.createDocumentFragment();
      while((match=pattern.exec(value))){
        const url=match[0].replace(/[.,;:!?]+$/,'');
        fragment.append(document.createTextNode(value.slice(offset,match.index)));
        const a=document.createElement('a');a.href=url;a.textContent=url;fragment.append(a);
        offset=match.index+url.length;
      }
      if(offset){fragment.append(document.createTextNode(value.slice(offset)));node.replaceWith(fragment);}
    });
  });
  let frame;
  function draw() {
    rows.forEach(row => {
      const box = row.querySelector('.margin-box');
      const highlight = Array.from(row.querySelectorAll('.margin-highlight')).find(a => a.hash === '#' + box.id);
      const svg = row.querySelector('.margin-connector');
      if (!highlight) { svg.hidden = true; return; }
      svg.hidden = false;
      const left = row.classList.contains('margin-left');
      const rects = highlight.getClientRects();
      const h = rects[left ? 0 : rects.length - 1];
      if (!h) return;
      const r = row.getBoundingClientRect(), b = box.getBoundingClientRect();
      const line = svg.querySelector('polyline');
      const passage = row.querySelector('.margin-passage').getBoundingClientRect();
      const x = (left ? h.left : h.right) - r.left;
      const y = h.bottom - r.top + 3;
      const gutter = (left ? passage.left - 14 : passage.right + 14) - r.left;
      const endX = (left ? b.right : b.left) - r.left;
      const endY = b.top + Math.min(24, b.height / 2) - r.top;
      line.setAttribute('points', `${x},${h.bottom-r.top} ${x},${y} ${gutter},${y} ${gutter},${endY} ${endX},${endY}`);
    });
  }
  function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); }
  const observer = new ResizeObserver(schedule);
  rows.forEach(row => observer.observe(row));
  addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
