/* ════════════════════════════════════════════════════
   MAIN APP CONTROLLER — Prajwal's macOS Portfolio
════════════════════════════════════════════════════ */

/* TIME CLOCK */
function tick() {
  const n = new Date();
  const d = n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const t = n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const el = document.getElementById('menubar-time');
  if (el) el.textContent = d + '  ' + t;
}
tick();
setInterval(tick, 1000);

/* HOVER TEXT ANIMATION */
function makeHover(text, el) {
  if (!el) return;
  el.innerHTML = text.split('').map(c =>
    `<span class="hover-letter">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
}
makeHover("Hey, I'm Prajwal! welcome to my", document.getElementById('welcome-small'));
makeHover("portfolio", document.getElementById('welcome-large'));

/* WINDOW MANAGEMENT & FOCUS */
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

/* DRAGGABLE WINDOW SYSTEM */
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

makeDraggable('main-window', '.mac-titlebar');
makeDraggable('projects-window', '.mac-titlebar');
makeDraggable('certs-window', '.mac-titlebar');
makeDraggable('techstack-window', '.mac-titlebar');
makeDraggable('contact-window', '.mac-titlebar');

/* CERTIFICATE PREVIEW MODAL */
function openCert(src) {
  const img = document.getElementById('cert-modal-img');
  const modal = document.getElementById('cert-modal');
  if (img) img.src = src;
  if (modal) modal.classList.add('open');
}

function closeCert() {
  const modal = document.getElementById('cert-modal');
  if (modal) modal.classList.remove('open');
}

/* ASK ABOUT ME CHATBOT CONTROLLER */
function openAskMe() {
  const panel = document.getElementById('askme-panel');
  const overlay = document.getElementById('askme-overlay');
  if (!panel || !overlay) return;
  panel.style.display = 'flex';
  overlay.style.display = 'block';
  setTimeout(() => {
    panel.style.opacity = '1';
    panel.style.transform = 'translate(-50%,-50%) scale(1)';
  }, 10);

  const msgs = document.getElementById('chat-msgs');
  if (msgs && msgs.children.length === 0) {
    addMsg('bot', "Hi there! 👋 I am Prajwal's AI Assistant. I have analyzed Prajwal's complete resume and background. Ask me anything about his <b>skills, projects, certifications, internship, hackathons, or hobbies!</b>");
    renderSuggestions();
  }
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  }, 300);
}

function closeAskMe() {
  const panel = document.getElementById('askme-panel');
  const overlay = document.getElementById('askme-overlay');
  if (!panel || !overlay) return;
  panel.style.opacity = '0';
  panel.style.transform = 'translate(-50%,-50%) scale(0.95)';
  setTimeout(() => { panel.style.display = 'none'; overlay.style.display = 'none'; }, 200);
}

function addMsg(role, html) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;
  const el = document.createElement('div');
  el.style.cssText = role === 'user'
    ? 'align-self:flex-end;max-width:82%;background:rgba(191,90,242,0.22);border:1px solid rgba(191,90,242,0.38);border-radius:14px 14px 3px 14px;padding:10px 15px;font-size:13px;color:rgba(255,255,255,0.92);line-height:1.6;'
    : 'align-self:flex-start;max-width:86%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px 14px 14px 3px;padding:11px 15px;font-size:13px;color:rgba(255,255,255,0.85);line-height:1.6;';
  el.innerHTML = html;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
}

function renderSuggestions() {
  const sg = document.getElementById('chat-suggestions');
  if (!sg) return;
  const list = (typeof suggestions !== 'undefined') ? suggestions : ['Who is Prajwal?', 'What are his skills?', 'Tell me about VIPER', 'His certificates?', 'How to contact him?'];
  sg.innerHTML = list.map(s =>
    `<button onclick="askSuggestion(this,'${s}')" style="font-size:11px;font-weight:500;padding:5px 12px;border-radius:20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);cursor:pointer;font-family:inherit;transition:all 0.15s;" onmouseenter="this.style.background='rgba(191,90,242,0.2)';this.style.borderColor='rgba(191,90,242,0.45)';this.style.color='#c8a0ff'" onmouseleave="this.style.background='rgba(255,255,255,0.06)';this.style.borderColor='rgba(255,255,255,0.12)';this.style.color='rgba(255,255,255,0.7)'">${s}</button>`
  ).join('');
}

function askSuggestion(btn, q) {
  if (btn && btn.parentElement) btn.parentElement.innerHTML = '';
  const input = document.getElementById('chat-input');
  if (input) input.value = q;
  sendMsg();
}

function sendMsg() {
  const inp = document.getElementById('chat-input');
  if (!inp) return;
  const q = inp.value.trim();
  if (!q) return;
  addMsg('user', q);
  inp.value = '';

  const msgs = document.getElementById('chat-msgs');
  const typingEl = document.createElement('div');
  typingEl.style.cssText = 'align-self:flex-start;background:rgba(255,255,255,0.04);border:1px solid rgba(191,90,242,0.2);border-radius:12px;padding:8px 14px;font-size:12px;color:#c8a0ff;font-style:italic;display:flex;align-items:center;gap:6px;';
  typingEl.innerHTML = 'Analyzing resume & background... 💭';
  if (msgs) {
    msgs.appendChild(typingEl);
    msgs.scrollTop = msgs.scrollHeight;
  }

  setTimeout(() => {
    typingEl.remove();
    const ans = (typeof getAnswer === 'function') ? getAnswer(q) : `Hi there! 👋 Ask me anything about Prajwal's skills, projects, certifications, or experience!`;
    addMsg('bot', ans);
  }, 450);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeAskMe(); closeCert(); }
});
