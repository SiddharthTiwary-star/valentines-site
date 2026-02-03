// Floating hearts across all pages
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

// Runaway No button (only on pages where it exists)
const noBtn = document.getElementById('noBtn');
const popup = document.getElementById('popup');
if(noBtn){
  noBtn.addEventListener('mouseover', ()=>{
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
    if(popup){
      popup.style.visibility = 'visible';
      setTimeout(()=> popup.style.visibility = 'hidden', 1800);
    }
  });
}

// Success swap (only on index)
function showSuccess(){
  const main = document.getElementById('mainContainer');
  const success = document.getElementById('successCard');
  if(main && success){ main.style.display='none'; success.style.display='block'; }
}

// Countdown (only on countdown page)
function startCountdown(){
  const el = document.getElementById('countdown');
  if(!el) return;
  function nextValentines(){
    const now = new Date();
    let year = now.getFullYear();
    const target = new Date(year, 1, 14, 0, 0, 0); // Feb = 1 (0-indexed)
    if(target < now){ year += 1; }
    return new Date(year, 1, 14, 0, 0, 0);
  }
  let target = nextValentines();
  function tick(){
    const now = new Date();
    let diff = Math.max(0, target - now);
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
