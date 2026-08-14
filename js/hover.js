/* ════════════════════════════════════════════════════
   HOVER TEXT ANIMATION MODULE — Prajwal's Portfolio
════════════════════════════════════════════════════ */
function makeHover(text, el) {
  if (!el) return;
  el.innerHTML = text.split('').map(c =>
    `<span class="hover-letter">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
}
makeHover("Hey, I'm Prajwal! welcome to my", document.getElementById('welcome-small'));
makeHover("portfolio", document.getElementById('welcome-large'));
