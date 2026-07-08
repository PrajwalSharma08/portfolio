/**
 * Premium Sci-Fi Anime Coding Background Animation
 * Custom styles for Light Mode & Dark Mode
 */
(function() {
  const canvas = document.getElementById('code-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  let currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  // Coding vocabulary for drops
  const codeLines = [
    "def render_portfolio():", "const ui = new WebGL();", "import tensorflow as tf",
    "git commit -m 'deploy'", "npm run dev", "prajwal.art.draw()", "sys.status === 'ACTIVE'",
    "while True: learn()", "const cursor = new RingCursor();", "let sketch = new GraphiteArt();",
    "await fetch('/api/projects')", "01001001 01001100", "{ cse: 'B.Tech' }", "console.log('Premium UI')"
  ];

  const particles = [];
  const matrixDrops = [];
  const fontSize = 10;
  let columns = Math.floor(width / 24);

  // Initialize Matrix Drops
  function initMatrix() {
    columns = Math.floor(width / 24);
    matrixDrops.length = 0;
    for (let i = 0; i < columns; i++) {
      matrixDrops[i] = Math.random() * -80;
    }
  }

  // Initialize Constellation Particles (for light mode)
  function initParticles() {
    particles.length = 0;
    const count = Math.min(40, Math.floor((width * height) / 20000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      });
    }
  }

  initMatrix();
  initParticles();

  // Draw Sci-Fi Cyberpunk Terminal Rain (Dark Mode)
  function drawDarkMode(accentColor) {
    // Semi-transparent overlay to create trailing fade effect
    ctx.fillStyle = 'rgba(14, 14, 14, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `bold ${fontSize}px monospace`;
    
    // Cyberpunk neon green/cyan glow effect
    ctx.shadowBlur = 6;
    ctx.shadowColor = accentColor;

    for (let i = 0; i < matrixDrops.length; i++) {
      // Alternating column colors (accent vs soft dark-green/cyan)
      ctx.fillStyle = Math.random() > 0.85 ? '#00ffd8' : accentColor;
      
      const text = codeLines[Math.floor(Math.random() * codeLines.length)];
      const x = i * 24;
      const y = matrixDrops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > height && Math.random() > 0.975) {
        matrixDrops[i] = 0;
      }
      matrixDrops[i] += 0.7; // flow speed
    }
    
    ctx.shadowBlur = 0; // reset
  }

  // Draw Elegant Technical Wireframe/Constellation (Light Mode)
  function drawLightMode(accentColor) {
    ctx.clearRect(0, 0, width, height);
    
    // Draw constellation lines
    ctx.strokeStyle = accentColor;
    ctx.fillStyle = accentColor;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Draw node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Drift particle
      p.x += p.vx;
      p.y += p.vy;

      // Bounce limits
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Connect nodes
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.globalAlpha = (120 - dist) / 120 * 0.15; // fade lines based on distance
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // Scroll light binary/syntax indicators at the corners
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillText("sys.prajwal.status: ACTIVE", 20, height - 40);
    ctx.fillText("render_pipeline.rate: 60fps", width - 180, height - 40);
  }

  // Animation Loop
  function loop() {
    const rootStyle = getComputedStyle(document.documentElement);
    const accentColor = rootStyle.getPropertyValue('--accent').trim() || '#D9A86C';
    
    currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    if (currentTheme === 'dark') {
      drawDarkMode(accentColor);
    } else {
      drawLightMode(accentColor);
    }

    requestAnimationFrame(loop);
  }

  // Listen to theme switch to clear trails
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, width, height);
    });
  }

  // Handle resizing
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initMatrix();
    initParticles();
  });

  loop();
})();
