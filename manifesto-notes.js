(() => {
  const notes = JSON.parse(document.querySelector('#saved-marginalia').textContent) || [];
  for (const note of notes) {
    const block = Array.from(document.querySelectorAll('.manifesto-content > p')).find(p => p.textContent === note.block);
    if (!block) continue;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let offset = 0, start, end, node;
    while ((node = walker.nextNode())) {
      const next = offset + node.textContent.length;
      if (!start && note.start >= offset && note.start < next) start = [node,note.start-offset];
      if (note.end > offset && note.end <= next) end = [node,note.end-offset];
      offset = next;
    }
    if (!start || !end) continue;
    const range = document.createRange(); range.setStart(...start);range.setEnd(...end);
    const anchor = document.createElement('a');anchor.className='margin-highlight';anchor.href='#'+note.id;
    anchor.append(range.extractContents());range.insertNode(anchor);
    const row = document.createElement('div');row.className='margin-row'+(note.side==='left'?' margin-left':'');row.dataset.noteId=note.id;
    block.before(row);
    const passage=document.createElement('div');passage.className='margin-passage';passage.append(block);row.append(passage);
    const box=document.createElement('aside');box.className='margin-box';box.id=note.id;box.setAttribute('aria-label','Margin note');
    box.append(document.getElementById('rendered-'+note.id).content.cloneNode(true));row.append(box);
    row.insertAdjacentHTML('beforeend','<svg class="margin-connector" aria-hidden="true"><polyline /></svg>');
  }
  dispatchEvent(new Event('marginalia-ready'));
})();
