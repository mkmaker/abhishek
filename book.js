(() => {
  'use strict';

  const widget = document.getElementById('storybook-widget');
  const reader = document.getElementById('book-reader');
  const book = document.getElementById('storybook');
  const pages = document.getElementById('book-pages');
  const left = document.getElementById('book-left');
  const right = document.getElementById('book-right');
  const previous = document.getElementById('book-prev');
  const next = document.getElementById('book-next');
  const close = document.getElementById('book-close');
  const progress = document.getElementById('book-progress');
  if (!widget || !reader || !book || !pages || !left || !right || !previous || !next || !close || !progress) return;

  const spines = [...widget.querySelectorAll('.shelf-book[data-book]')];
  const stage = reader.querySelector('.book-stage');
  if (!stage || !spines.length) return;

  const books = [
    ['Paulo Coelho', 'The Alchemist', 'A shepherd travels in search of treasure.', 'https://fondationpaulocoelho.com/books/paulo-coelho-the-alchemist/'],
    ['Robert B. Cialdini', 'Influence', 'The psychology behind persuasion and why people say yes.', 'https://cialdini.com/books/influence'],
    ['Richard Carlson', 'Don’t Sweat the Small Stuff', 'Small daily changes for putting worries in perspective.', 'https://dontsweat.com/books/'],
    ['Robert T. Kiyosaki', 'Rich Dad Poor Dad', 'Contrasting lessons about money and financial education.', 'https://richdad.com/products/books/rich-dad-poor-dad/'],
    ['Robert S. Ross', 'Fatal Volley', 'A 1994 mystery and suspense novel.']
  ];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 0;
  let isOpen = false;
  let turn = null;
  let leaf = null;
  let gesture = null;

  function pageLabel(text) {
    const label = document.createElement('span');
    label.className = 'book-date';
    label.textContent = text;
    return label;
  }

  function pageNumber(number) {
    const label = document.createElement('span');
    label.className = 'book-page-number';
    label.textContent = String(number).padStart(2, '0');
    return label;
  }

  function render() {
    const [author, title, synopsis, url] = books[selected];
    pages.setAttribute('aria-label', `Book details: ${title}`);
    const heading = document.createElement('h4');
    heading.textContent = title;
    left.replaceChildren(pageLabel(author), heading, pageNumber(selected * 2 + 1));

    const paragraph = document.createElement('p');
    paragraph.textContent = synopsis;
    right.replaceChildren(pageLabel('About the book'), paragraph);
    if (url) {
      const source = document.createElement('a');
      source.className = 'book-source';
      source.href = url;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'Book details ';
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'icon');
      icon.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#arrow-up-right');
      icon.append(use);
      source.append(icon);
      source.setAttribute('aria-label', `Book details for ${title} (opens in a new tab)`);
      right.append(source);
    }
    right.append(pageNumber(selected * 2 + 2));

    previous.disabled = !isOpen || selected === 0;
    next.disabled = !isOpen || selected === books.length - 1;
    left.classList.toggle('is-turnable', !previous.disabled);
    right.classList.toggle('is-turnable', !next.disabled);
    progress.textContent = `${selected + 1} of ${books.length}`;
    for (const spine of spines) {
      const active = isOpen && Number(spine.dataset.book) === selected;
      spine.classList.toggle('is-selected', active);
      spine.setAttribute('aria-expanded', String(active));
    }
  }

  function finishTurn() {
    if (turn) turn.cancel();
    if (leaf) leaf.remove();
    turn = null;
    leaf = null;
  }

  function selectBook(destination, animate = true) {
    if (!isOpen || destination < 0 || destination >= books.length || destination === selected) return false;
    finishTurn();
    const direction = destination > selected ? 1 : -1;
    const focusInPages = pages.contains(document.activeElement);
    const oldFace = (direction > 0 ? right : left).cloneNode(true);
    oldFace.removeAttribute('id');
    oldFace.className = 'book-page turning-face turning-front';
    selected = destination;
    render();
    if (animate && !reducedMotion.matches && typeof book.animate === 'function') {
      leaf = document.createElement('div');
      leaf.className = `turning-page ${direction > 0 ? 'turning-next' : 'turning-previous'}`;
      leaf.setAttribute('aria-hidden', 'true');
      leaf.inert = true;
      const backFace = (direction > 0 ? left : right).cloneNode(true);
      backFace.removeAttribute('id');
      backFace.className = 'book-page turning-face turning-back';
      leaf.append(oldFace, backFace);
      book.append(leaf);
      const thisLeaf = leaf;
      turn = leaf.animate([
        { transform: 'rotateY(0deg)' },
        { transform: `rotateY(${direction > 0 ? -180 : 180}deg)` }
      ], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
      turn.onfinish = () => {
        if (leaf === thisLeaf) finishTurn();
      };
    }
    if (focusInPages) pages.focus({ preventScroll: true });
    else if (document.activeElement === next && next.disabled) previous.focus({ preventScroll: true });
    else if (document.activeElement === previous && previous.disabled) next.focus({ preventScroll: true });
    return true;
  }

  function go(direction) {
    return selectBook(selected + direction);
  }

  function openBook(index) {
    if (!Number.isInteger(index) || index < 0 || index >= books.length) return;
    finishTurn();
    gesture = null;
    selected = index;
    isOpen = true;
    reader.hidden = false;
    render();
    pages.focus();
  }

  function closeBook() {
    if (!isOpen) return;
    finishTurn();
    gesture = null;
    isOpen = false;
    reader.hidden = true;
    render();
    const spine = spines.find(button => Number(button.dataset.book) === selected);
    if (spine) spine.focus({ preventScroll: true });
  }

  for (const spine of spines) {
    spine.addEventListener('click', () => openBook(Number(spine.dataset.book)));
  }
  close.addEventListener('click', closeBook);
  previous.addEventListener('click', event => {
    if (go(-1) && event.detail > 0) pages.focus({ preventScroll: true });
  });
  next.addEventListener('click', event => {
    if (go(1) && event.detail > 0) pages.focus({ preventScroll: true });
  });
  reader.addEventListener('keydown', event => {
    if (!isOpen || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeBook();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      go(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  stage.addEventListener('pointerdown', event => {
    if (!isOpen || !event.isPrimary || event.button !== 0 || event.target.closest('a,button')) return;
    const page = event.target.closest('.book-page');
    gesture = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      page: page === left || page === right ? page : null
    };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const start = gesture;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    gesture = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    let direction = 0;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      direction = dx < 0 ? 1 : -1;
    } else if (start.page && Math.hypot(dx, dy) <= 10) {
      const bounds = start.page.getBoundingClientRect();
      const onSamePage = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (onSamePage) direction = start.page === right ? 1 : -1;
    }
    if (isOpen && direction && go(direction)) pages.focus({ preventScroll: true });
  });
  stage.addEventListener('pointercancel', () => { gesture = null; });
  stage.addEventListener('lostpointercapture', () => { gesture = null; });
  window.addEventListener('blur', () => { gesture = null; });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finishTurn(); });

  reader.hidden = true;
  render();
})();
