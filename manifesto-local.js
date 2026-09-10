(() => {
  if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) return;
  // The editing server injects its own controls. Other local previews link to it.
  if (document.querySelector('script[src="/__editor/ui.js"]')) return;
  const bar=document.createElement('div');bar.className='local-edit-launcher';
  const link=document.createElement('a');link.href='http://127.0.0.1:4176/manifesto.html?edit=1';link.textContent='Edit mode';bar.append(link);document.body.prepend(bar);
})();
