/* ════════════════════════════════════════════════════
   DRAGGABLE WINDOW SYSTEM MODULE — Prajwal's Portfolio
════════════════════════════════════════════════════ */
function makeDraggable(winId, handleSelector) {
  const win = document.getElementById(winId);
  if (!win) return;
  const handle = win.querySelector(handleSelector);
  if (!handle) return;
  let dragging = false, sx, sy, sl, st;

  handle.addEventListener('mousedown', e => {
    if (e.target.classList.contains('tl')) return;
    dragging = true;
    bringToFront(winId);
    const r = win.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top;
    win.style.left = r.left + 'px';
    win.style.top = r.top + 'px';
    win.style.transform = 'none';
    win.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = (sl + e.clientX - sx) + 'px';
    win.style.top = Math.max(30, st + e.clientY - sy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (dragging) { dragging = false; win.style.transition = ''; }
  });
}

// Initialize draggables for all 5 windows
makeDraggable('main-window', '.mac-titlebar');
makeDraggable('projects-window', '.mac-titlebar');
makeDraggable('certs-window', '.mac-titlebar');
makeDraggable('techstack-window', '.mac-titlebar');
makeDraggable('contact-window', '.mac-titlebar');
