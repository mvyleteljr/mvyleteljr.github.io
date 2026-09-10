(() => {
  const reader = document.querySelector('#note-content');
  if (!reader) return;
  const status = document.querySelector('.selection-status');
  function select(id, announce = true) {
    const source = document.getElementById(id);
    if (!(source instanceof HTMLTemplateElement)) return;
    reader.replaceChildren(source.content.cloneNode(true));
    document.querySelectorAll('[data-select]').forEach(button => {
      const selected = button.dataset.select === id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-edge]').forEach(line => line.classList.toggle('selected', line.dataset.edge === id));
    if (announce) status.textContent = reader.querySelector('h2').textContent + ' is open below or beside the map.';
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-select]');
    if (!button) return;
    select(button.dataset.select);
    if (matchMedia('(max-width: 760px)').matches) document.querySelector('.reader').scrollIntoView({block: 'start'});
  });
  select('attention', false);
})();
