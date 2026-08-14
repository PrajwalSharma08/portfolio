/* ════════════════════════════════════════════════════
   LIVE CLOCK TIMER MODULE — Prajwal's Portfolio
════════════════════════════════════════════════════ */
function tick() {
  const n = new Date();
  const d = n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const t = n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const el = document.getElementById('menubar-time');
  if (el) el.textContent = d + '  ' + t;
}
tick();
setInterval(tick, 1000);
