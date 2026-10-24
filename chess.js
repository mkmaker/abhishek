(() => {
  'use strict';

  const board = document.getElementById('chess-board');
  const status = document.getElementById('chess-status');
  const counter = document.getElementById('chess-moves');
  const undo = document.getElementById('chess-undo');
  const reset = document.getElementById('chess-reset');
  if (!board || !status || !counter || !undo || !reset) return;

  const SIZE = 5;
  const START = 20;
  const TARGET = 4;
  const GOAL = 4;
  const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const squares = [];
  let history = [START];
  let focusedIndex = START;
  let drag = null;
  let suppressClickUntil = 0;

  function squareName(index) {
    return `${String.fromCharCode(97 + index % SIZE)}${SIZE - Math.floor(index / SIZE)}`;
  }

  function legalMoves(index) {
    const row = Math.floor(index / SIZE);
    const column = index % SIZE;
    return offsets.flatMap(([dy, dx]) => {
      const y = row + dy;
      const x = column + dx;
      return y >= 0 && y < SIZE && x >= 0 && x < SIZE ? [y * SIZE + x] : [];
    });
  }

  const piece = document.createElement('div');
  piece.className = 'chess-piece';
  piece.setAttribute('aria-hidden', 'true');
  piece.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40" focusable="false" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M11 30c0-5 2-8 6-12l-5 3-5-4 8-10 2-4 6 3c7 1 11 8 9 17l-2 7H11ZM20 10a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM10 32h22v4H8v-4h2Z"/></svg>';

  for (let index = 0; index < SIZE * SIZE; index += 1) {
    const square = document.createElement('button');
    square.type = 'button';
    square.className = `chess-square ${(Math.floor(index / SIZE) + index % SIZE) % 2 ? 'is-dark' : 'is-light'}`;
    square.dataset.index = String(index);
    square.dataset.square = squareName(index);
    square.tabIndex = index === START ? 0 : -1;
    if (index === TARGET) {
      square.classList.add('is-target');
      square.dataset.label = squareName(TARGET);
      const label = document.createElement('span');
      label.className = 'target-label';
      label.textContent = squareName(TARGET);
      label.setAttribute('aria-hidden', 'true');
      square.append(label);
    }
    squares.push(square);
    board.append(square);
  }
  board.append(piece);

  function current() {
    return history[history.length - 1];
  }

  function setFocus(index, moveFocus = false) {
    focusedIndex = index;
    squares.forEach((square, squareIndex) => {
      square.tabIndex = squareIndex === index ? 0 : -1;
    });
    if (moveFocus) squares[index].focus({ preventScroll: true });
  }

  function render(message) {
    const position = current();
    const moves = history.length - 1;
    const solved = position === TARGET;
    const legal = solved ? [] : legalMoves(position);
    squares.forEach((square, index) => {
      const hasKnight = index === position;
      const isLegal = legal.includes(index);
      square.classList.toggle('has-knight', hasKnight);
      square.classList.toggle('is-legal', isLegal);
      if (hasKnight) square.setAttribute('aria-current', 'true');
      else square.removeAttribute('aria-current');
      const labels = [squareName(index)];
      if (hasKnight) labels.push('knight');
      if (index === TARGET) labels.push('target');
      if (isLegal) labels.push('legal move');
      square.setAttribute('aria-label', labels.join(', '));
    });
    piece.style.setProperty('--piece-x', String(position % SIZE));
    piece.style.setProperty('--piece-y', String(Math.floor(position / SIZE)));
    board.classList.toggle('is-solved', solved);
    counter.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
    undo.disabled = moves === 0;
    setFocus(focusedIndex);
    if (message) status.textContent = message;
    else if (solved) status.textContent = moves === GOAL
      ? 'Solved in 4 moves. Nicely played.'
      : `Reached e5 in ${moves} moves. Can you do it in 4?`;
    else status.textContent = moves === 0
      ? 'Choose a highlighted square to begin.'
      : `Knight on ${squareName(position)}. Choose a highlighted square.`;
  }

  function move(index) {
    if (current() === TARGET || !legalMoves(current()).includes(index)) return false;
    clearDrag();
    history.push(index);
    focusedIndex = index;
    render();
    setFocus(index, true);
    return true;
  }

  function clearDrag(message) {
    if (!drag) return;
    const ended = drag;
    drag = null;
    piece.classList.remove('is-dragging');
    piece.style.removeProperty('--drag-x');
    piece.style.removeProperty('--drag-y');
    squares.forEach(square => square.classList.remove('is-drag-over'));
    if (ended.source.hasPointerCapture?.(ended.pointerId)) {
      ended.source.releasePointerCapture(ended.pointerId);
    }
    if (message) status.textContent = message;
  }

  function indexAtPoint(clientX, clientY) {
    const bounds = board.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    if (x < 0 || y < 0 || x >= bounds.width || y >= bounds.height) return -1;
    return Math.floor(y / (bounds.height / SIZE)) * SIZE + Math.floor(x / (bounds.width / SIZE));
  }

  board.addEventListener('focusin', event => {
    const square = event.target.closest('.chess-square');
    if (square) setFocus(Number(square.dataset.index));
  });

  board.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && drag) {
      event.preventDefault();
      clearDrag('Move cancelled. Choose a highlighted square.');
      return;
    }
    const square = event.target.closest('.chess-square');
    if (!square) return;
    const index = Number(square.dataset.index);
    const row = Math.floor(index / SIZE);
    const column = index % SIZE;
    let next = index;
    if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * SIZE + column;
    else if (event.key === 'ArrowDown') next = Math.min(SIZE - 1, row + 1) * SIZE + column;
    else if (event.key === 'ArrowLeft') next = row * SIZE + Math.max(0, column - 1);
    else if (event.key === 'ArrowRight') next = row * SIZE + Math.min(SIZE - 1, column + 1);
    else if (event.key === 'Home') next = row * SIZE;
    else if (event.key === 'End') next = row * SIZE + SIZE - 1;
    else return;
    event.preventDefault();
    setFocus(next, true);
  });

  board.addEventListener('click', event => {
    if (event.detail !== 0 && performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const square = event.target.closest('.chess-square');
    if (!square) return;
    const index = Number(square.dataset.index);
    if (move(index)) return;
    if (current() === TARGET) status.textContent = 'Puzzle complete. Undo a move or reset to play again.';
    else if (index === current()) status.textContent = `Knight on ${squareName(index)}. Choose a highlighted square.`;
    else status.textContent = `${squareName(index)} is not a legal move. Choose a highlighted square.`;
  });

  board.addEventListener('pointerdown', event => {
    const square = event.target.closest('.chess-square');
    if (!square || Number(square.dataset.index) !== current() || current() === TARGET || drag) return;
    if (!event.isPrimary || event.button !== 0) return;
    const bounds = board.getBoundingClientRect();
    const position = current();
    drag = {
      pointerId: event.pointerId,
      source: square,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - bounds.left - position % SIZE * bounds.width / SIZE,
      grabY: event.clientY - bounds.top - Math.floor(position / SIZE) * bounds.height / SIZE,
      active: false
    };
    square.setPointerCapture(event.pointerId);
  });

  board.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.active = true;
    event.preventDefault();
    const bounds = board.getBoundingClientRect();
    piece.style.setProperty('--drag-x', `${event.clientX - bounds.left - drag.grabX}px`);
    piece.style.setProperty('--drag-y', `${event.clientY - bounds.top - drag.grabY}px`);
    piece.classList.add('is-dragging');
    const hovered = indexAtPoint(event.clientX, event.clientY);
    const legal = legalMoves(current());
    squares.forEach((square, index) => square.classList.toggle('is-drag-over', index === hovered && legal.includes(index)));
  }, { passive: false });

  board.addEventListener('pointerup', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const wasDragging = drag.active;
    const destination = indexAtPoint(event.clientX, event.clientY);
    clearDrag();
    if (!wasDragging) return;
    suppressClickUntil = performance.now() + 500;
    if (!move(destination)) status.textContent = 'Move cancelled. Choose a highlighted square.';
  });

  board.addEventListener('pointercancel', event => {
    if (drag?.pointerId === event.pointerId) {
      suppressClickUntil = performance.now() + 500;
      clearDrag('Move cancelled. Choose a highlighted square.');
    }
  });
  board.addEventListener('lostpointercapture', event => {
    if (drag?.pointerId === event.pointerId) clearDrag('Move cancelled. Choose a highlighted square.');
  });
  window.addEventListener('resize', () => clearDrag(), { passive: true });
  window.addEventListener('blur', () => clearDrag());

  undo.addEventListener('click', () => {
    clearDrag();
    if (history.length < 2) return;
    history.pop();
    focusedIndex = current();
    render(`Move undone. Knight on ${squareName(current())}. Choose a highlighted square.`);
    setFocus(current(), true);
  });
  reset.addEventListener('click', () => {
    clearDrag();
    history = [START];
    focusedIndex = START;
    render();
    setFocus(START, true);
  });

  render();
})();
