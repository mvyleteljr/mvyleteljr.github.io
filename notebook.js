(() => {
  const reader = document.querySelector('#note-content');
  function show(key, announce = false) {
    const template = document.getElementById('note-' + key);
    if (!(template instanceof HTMLTemplateElement)) return false;
    reader.replaceChildren(template.content.cloneNode(true));
    document.querySelectorAll('[data-note]').forEach(el => {
      el.classList.toggle('selected', el.dataset.note === key);
      if (el.dataset.note === key) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-edge]').forEach(el => el.classList.toggle('selected', el.dataset.edge === key));
    if (announce) document.querySelector('#note-status').textContent = reader.querySelector('h2').textContent + ' is open in the reading area.';
    return true;
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-note]');
    if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!show(target.dataset.note, true)) return;
    event.preventDefault();
    history.pushState(null, '', '#' + target.dataset.note);
    if (matchMedia('(max-width: 760px)').matches) document.querySelector('.note-reader').scrollIntoView({block:'start'});
  });
  addEventListener('hashchange', () => show(location.hash.slice(1), true));
  show(location.hash.slice(1) || 'cooper-hewitt');
})();
