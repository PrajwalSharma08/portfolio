/* ════════════════════════════════════════════════════
   WINDOW MANAGEMENT MODULE — Prajwal's Portfolio
════════════════════════════════════════════════════ */
let topZ = 1000;

function bringToFront(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  topZ += 2;
  win.style.zIndex = topZ;
}

function openWindow(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  win.style.display = 'flex';
  bringToFront(winId);
  win.style.animation = 'none';
  win.offsetHeight;
  win.style.animation = 'macWinIn 0.25s cubic-bezier(0.34,1.3,0.64,1) forwards';
}

function closeWindow(winId) {
  const win = document.getElementById(winId);
  if (win) win.style.display = 'none';
}

function scrollToProj(cardId) {
  setTimeout(() => {
    const el = document.getElementById(cardId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 280);
}
