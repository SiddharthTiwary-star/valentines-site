// Hearts with reduced motion awareness
(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function spawnHeart(){
    if (reduce) return; // respect user setting
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤️';
    const x = Math.random() * window.innerWidth;
    heart.style.setProperty('--x', x + 'px');
    heart.style.left = x + 'px';
    heart.style.fontSize = (Math.random()*18 + 12) + 'px';
    heart.style.animationDuration = (Math.random()*3 + 3) + 's';
    document.body.appendChild(heart);
    setTimeout(()=> heart.remove(), 7000);
  }
  setInterval(spawnHeart, 420);
})();

// Mobile nav toggle
(function(){
  const btn = document.querySelector('.nav-toggle');
  const links = document.querySelector('nav .links');
  if(!btn || !links) return;
  btn.addEventListener('click', ()=>{
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// Runaway No button logic (mobile + desktop)
(function(){
  const group = document.querySelector('.btn-group');
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const popup = document.getElementById('popup');
  const hint = document.getElementById('hint');
  if(!group || !noBtn) return;

  function overlaps(a,b){
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function computeSafe(){
    const g = group.getBoundingClientRect();
    const n = noBtn.getBoundingClientRect();
    const y = yesBtn ? yesBtn.getBoundingClientRect() : null;
    const pad = 8;
    const maxX = Math.max(20, g.width - n.width - pad*2);
    const maxY = Math.max(20, g.height - n.height - pad*2);
    let tries=0, x=0, yPos=0;
    while(tries++<24){
      x = pad + Math.random()*maxX;
      yPos = pad + Math.random()*maxY;
      const cand = {left:g.left+x, top:g.top+yPos, right:g.left+x+n.width, bottom:g.top+yPos+n.height};
      if(!y || !overlaps(cand, y)) break;
    }
    return {x, y:yPos};
  }

  function move(){
    const {x,y} = computeSafe();
    noBtn.style.transform = `translate(${x}px, ${y}px)`;
    if(popup){
      popup.style.visibility='visible';
      clearTimeout(move._t); move._t=setTimeout(()=>popup.style.visibility='hidden', 1200);
    }
  }

  window.addEventListener('load', ()=>{
    noBtn.style.transform = 'translate(40px, 10px)';
    requestAnimationFrame(move);
  });

  const DANGER = 90; // px
  function evadeNear(px,py){
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    if(Math.hypot(px-cx, py-cy) <= DANGER) move();
  }

  noBtn.addEventListener('mouseover', move);
  noBtn.addEventListener('pointerdown', e=>{e.preventDefault(); e.stopPropagation(); move();});
  noBtn.addEventListener('touchstart', e=>{e.preventDefault(); e.stopPropagation(); move();}, {passive:false});
  noBtn.addEventListener('click', e=>{e.preventDefault(); e.stopPropagation(); move();});
  group.addEventListener('pointermove', e=>evadeNear(e.clientX, e.clientY));
  group.addEventListener('touchmove', e=>{const t=e.touches&&e.touches[0]; if(t) evadeNear(t.clientX,t.clientY);},{passive:true});

  if(hint){
    hint.addEventListener('click', ()=>{
      noBtn.style.transform = 'translate(12px, 12px)';
      setTimeout(move, 600);
    });
  }
})();

// Success swap (Home page)
function showSuccess(){
  const main = document.getElementById('mainContainer');
  const success = document.getElementById('successCard');
  if(main && success){ main.style.display='none'; success.style.display='block'; }
}

// Countdown page
(function(){
  const el = document.getElementById('countdown');
  if(!el) return;
  function nextVD(){ const now=new Date(); let y=now.getFullYear(); const t=new Date(y,1,14,0,0,0); return t<now? new Date(y+1,1,14,0,0,0): t; }
  const target = nextVD();
  function tick(){
    const now=new Date(); const diff=Math.max(0,target-now);
    const s=Math.floor(diff/1000)%60, m=Math.floor(diff/1000/60)%60, h=Math.floor(diff/1000/60/60)%24, d=Math.floor(diff/1000/60/60/24);
    el.querySelector('#d').textContent=d; el.querySelector('#h').textContent=h; el.querySelector('#m').textContent=m; el.querySelector('#s').textContent=s;
  }
  tick(); setInterval(tick,1000);
})();

// ---------------- Lightbox (Gallery page only) ----------------
(function(){
  const grid = document.querySelector('.grid');
  if(!grid) return; // only on gallery

  const backdrop = document.createElement('div');
  backdrop.className = 'lightbox-backdrop';
  backdrop.id = 'lightbox';
  backdrop.setAttribute('role','dialog');
  backdrop.setAttribute('aria-modal','true');

  const inner = document.createElement('div');
  inner.className = 'lightbox-inner';

  const imgEl = document.createElement('img');
  imgEl.className = 'lightbox-img';
  imgEl.alt = '';

  const caption = document.createElement('div');
  caption.className = 'lightbox-caption';

  const btnPrev = document.createElement('button');
  btnPrev.className = 'lightbox-btn lightbox-prev';
  btnPrev.setAttribute('aria-label','Previous');
  btnPrev.textContent = '‹';

  const btnNext = document.createElement('button');
  btnNext.className = 'lightbox-btn lightbox-next';
  btnNext.setAttribute('aria-label','Next');
  btnNext.textContent = '›';

  const btnClose = document.createElement('button');
  btnClose.className = 'lightbox-btn lightbox-close';
  btnClose.setAttribute('aria-label','Close');
  btnClose.textContent = '✕';

  inner.appendChild(imgEl);
  inner.appendChild(btnPrev);
  inner.appendChild(btnNext);
  inner.appendChild(btnClose);
  inner.appendChild(caption);
  backdrop.appendChild(inner);
  document.body.appendChild(backdrop);

  const thumbs = Array.from(grid.querySelectorAll('img'));
  const items = thumbs.map((t,i)=>({ full: t.dataset.full || t.src, alt: t.alt || `Photo ${i+1}` }));

  let idx = 0;
  function show(i){
    idx = (i+items.length)%items.length;
    const it = items[idx];
    imgEl.src = it.full; imgEl.alt = it.alt; caption.textContent = it.alt;
  }
  function open(i){ show(i); backdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close(){ backdrop.classList.remove('open'); document.body.style.overflow = ''; }

  thumbs.forEach((t,i)=>{
    t.addEventListener('click', ()=> open(i));
    t.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(i); }});
    t.setAttribute('tabindex','0');
  });

  btnPrev.addEventListener('click', ()=> show(idx-1));
  btnNext.addEventListener('click', ()=> show(idx+1));
  btnClose.addEventListener('click', close);
  backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) close(); });
  document.addEventListener('keydown', (e)=>{ if(!backdrop.classList.contains('open')) return; if(e.key==='Escape') close(); if(e.key==='ArrowLeft') show(idx-1); if(e.key==='ArrowRight') show(idx+1); });

  let sx=0, sy=0; inner.addEventListener('touchstart', (e)=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; }, {passive:true});
  inner.addEventListener('touchend', (e)=>{ const t=e.changedTouches[0]; const dx=t.clientX-sx, dy=t.clientY-sy; if(Math.abs(dx)>40 && Math.abs(dy)<80){ if(dx>0) show(idx-1); else show(idx+1); } });
})();
