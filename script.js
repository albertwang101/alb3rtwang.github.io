(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- gallery filter ---------- */
  const filters = [...document.querySelectorAll('.filter')];
  const items = [...document.querySelectorAll('.gallery__item')];
  const filterStatus = document.getElementById('filter-status');

  filters.forEach((btn) => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filters.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    let shown = 0;
    items.forEach((item) => {
      const show = cat === 'all' || item.dataset.cat === cat;
      item.hidden = !show;
      if (!show) return;
      shown++;
      if (!reduceMotion) {
        item.classList.remove('pop');
        void item.offsetWidth; // restart animation
        item.classList.add('pop');
      }
    });
    filterStatus.textContent = `Showing ${shown} piece${shown === 1 ? '' : 's'}`;
  }));

  /* ---------- lightbox ---------- */
  const dialog = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbMeta = document.getElementById('lb-meta');
  const lbCount = document.getElementById('lb-count');
  let visibleTiles = [];
  let current = 0;
  let opener = null;

  const showPiece = (i) => {
    current = (i + visibleTiles.length) % visibleTiles.length;
    const tile = visibleTiles[current];
    const img = tile.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = tile.dataset.title;
    lbMeta.textContent = tile.dataset.meta;
    lbCount.textContent = `${current + 1} / ${visibleTiles.length}`;
  };

  document.querySelector('.gallery').addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile || typeof dialog.showModal !== 'function') return;
    visibleTiles = items.filter((item) => !item.hidden).map((item) => item.querySelector('.tile'));
    opener = tile;
    showPiece(visibleTiles.indexOf(tile));
    dialog.showModal();
  });

  dialog.addEventListener('click', (e) => {
    const action = e.target.closest('[data-lb]')?.dataset.lb;
    if (action === 'close') dialog.close();
    else if (action === 'prev') showPiece(current - 1);
    else if (action === 'next') showPiece(current + 1);
    else if (e.target === dialog) dialog.close(); // backdrop click
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') showPiece(current + 1);
    if (e.key === 'ArrowLeft') showPiece(current - 1);
  });
  dialog.addEventListener('close', () => opener?.focus());

  document.getElementById('year').textContent = new Date().getFullYear();
})();
