/* ════════════════════════════════════════════════════
   CERTIFICATE PREVIEW MODAL MODULE — Prajwal's Portfolio
════════════════════════════════════════════════════ */
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
