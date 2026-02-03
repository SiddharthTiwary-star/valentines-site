// ---------------- Floating hearts (global) ----------------
function spawnHeart(){
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = '❤️';
  const x = Math.random() * window.innerWidth;
  heart.style.setProperty('--x', x + 'px');
  heart.style.left = x + 'px';
  heart.style.fontSize = (Math.random()*20 + 12) + 'px';
  heart.style.animationDuration = (Math.random()*3 + 3) + 's';
  document.body.appendChild(heart);
  setTimeout(()=> heart.remove(), 7000);
}
setInterval(spawnHeart, 350);

// ---------------- Runaway "No" button (mobile + desktop) ----------------
(function () {
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const group = document.querySelector('.btn-group');
  const popup = document.getElementById('popup');

  if (!noBtn || !group) return;

  // Track current translate for stateful movement
  let currentX = 0, currentY = 0;

  function clamp(val, min, max){ return Math.min(max, Math.max(min, val)); }

  function overlaps(a, b){
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  // Compute a new random position inside the group, avoiding the Yes button
  function computeSafePosition(){
    const groupRect = group.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn ? yesBtn.getBoundingClientRect() : null;
    const padding = 8;

    const maxX = Math.max(20, groupRect.width - noRect.width - padding*2);
    const maxY = Math.max(20, groupRect.height - noRect.height - padding*2);

    let tries = 0, x = 0, y = 0;
    while (tries++ < 24){
      x = padding + Math.random()*maxX;
      y = padding + Math.random()*maxY;

      // Build a candidate rect relative to viewport
      const cand = {
        left: groupRect.left + x,
        top: groupRect.top + y,
        right: groupRect.left + x + noRect.width,
        bottom: groupRect.top + y + noRect.height
      };

      if (!yesRect || !overlaps(cand, yesRect)) break;
    }

    return { x, y };
  }

  function moveNoButton(){
    const { x, y } = computeSafePosition();
    currentX = x; currentY = y;
    noBtn.style.transform = `translate(${x}px, ${y}px)`;

    if (popup){
      popup.style.visibility = 'visible';
      clearTimeout(moveNoButton._t);
      moveNoButton._t = setTimeout(() => (popup.style.visibility = 'hidden'), 1200);
    }
  }

  // Danger radius: if the pointer/finger gets too close, jump away
  const DANGER_RADIUS = 80; // px

  function maybeEvadeByPointer(px, py){
    const groupRect = group.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const cx = noRect.left + noRect.width/2;
    const cy = noRect.top + noRect.height/2;
    const dx = px - cx; const dy = py - cy;
    const dist = Math.hypot(dx, dy);
    if (dist <= DANGER_RADIUS){
      moveNoButton();
    }
  }

  // Desktop hover
  noBtn.addEventListener('mouseover', moveNoButton);

  // Pointer down covers modern touch + mouse
  noBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
    return false;
  });

  // Older mobile fallback
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
    return false;
  }, { passive: false });

  // Fallback click guard
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
    return false;
  });

  // Evade when the finger/pointer approaches (works on mobile while aiming)
  group.addEventListener('pointermove', (e) => {
    maybeEvadeByPointer(e.clientX, e.clientY);
  });

  group.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]){
      const t = e.touches[0];
      maybeEvadeByPointer(t.clientX, t.clientY);
    }
  }, { passive: true });

  // Initial random position after layout
  window.requestAnimationFrame(moveNoButton);

  // Reposition on resize/orientation change
  window.addEventListener('resize', () => {
    // reset transform then reposition
    noBtn.style.transform = 'translate(0,0)';
    currentX = currentY = 0;
    requestAnimationFrame(moveNoButton);
  });
})();

// ---------------- Success swap (Home page only) ----------------
function showSuccess(){
  const main = document.getElementById('mainContainer');
  const success = document.getElementById('successCard');
  if(main && success){
    main.style.display='none';
    success.style.display='block';
  }
}

// ---------------- Countdown (Countdown page only) ----------------
function startCountdown(){
  const el = document.getElementById('countdown');
  if(!el) return;

  function nextValentines(){
    const now = new Date();
    let year = now.getFullYear();
    const target = new Date(year, 1, 14, 0, 0, 0); // Feb = 1
    return (target < now) ? new Date(year + 1, 1, 14, 0, 0, 0) : target;
  }

  let target = nextValentines();

  function tick(){
    const now = new Date();
    const diff = Math.max(0, target - now);
    const s = Math.floor(diff/1000)%60;
    const m = Math.floor(diff/1000/60)%60;
    const h = Math.floor(diff/1000/60/60)%24;
    const d = Math.floor(diff/1000/60/60/24);
    el.querySelector('#d').textContent = d;
    el.querySelector('#h').textContent = h;
    el.querySelector('#m').textContent = m;
    el.querySelector('#s').textContent = s;
  }

  tick();
  setInterval(tick, 1000);
}
startCountdown();
