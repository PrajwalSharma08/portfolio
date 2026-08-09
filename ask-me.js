/* ════════════════════════════════════════════════════
   ASK ABOUT ME — Prajwal's AI Resume Assistant
   Synthesizes answers from Prajwal's complete resume.
════════════════════════════════════════════════════ */

// ── 1. Stop words ────────────────────────────────────
const STOP = new Set([
  'is','are','was','were','the','a','an','he','his','him',
  'does','did','do','has','have','had','will','can','could',
  'would','should','may','might','must','shall',
  'this','that','these','those','it',
  'i','my','we','our','they','their','you','your',
  'of','in','on','at','to','for','with','from','and','or',
  'but','if','then','so','also','too','as','by','up','be',
  'get','give','know','want','need','like','think','all'
]);

// ── 2. Synonym → Canonical Topic Mapping ──────────────
const SYN = {
  // internship / work
  'intern':'internship','interning':'internship','interned':'internship',
  'job':'work','jobs':'work','employed':'work','employment':'work',
  'working':'work','placement':'internship','training':'internship',
  'work':'work','career':'work','codsoft':'internship','experience':'internship',
  // hobby
  'hobbies':'hobby','interest':'hobby','interests':'hobby',
  'passion':'hobby','passions':'hobby','enjoy':'hobby','enjoying':'hobby',
  'leisure':'hobby','spare':'hobby','fun':'hobby','drawing':'hobby',
  'likes':'hobby','loves':'hobby','recreation':'hobby','art':'hobby','portrait':'hobby','pencil':'hobby',
  // skill / tech
  'skills':'skill','tech':'skill','technology':'skill','stack':'skill',
  'technologies':'skill','language':'skill','languages':'skill',
  'tools':'skill','tool':'skill','knows':'skill','know':'skill',
  'expertise':'skill','proficient':'skill','capable':'skill',
  'programming':'skill','framework':'skill','coding':'skill','code':'skill','python':'skill','figma':'skill',
  // project
  'projects':'project','built':'project','build':'project',
  'made':'project','created':'project','developed':'project',
  'development':'project','portfolio':'project','app':'project',
  'website':'project','application':'project','apps':'project','websites':'project',
  // certificate
  'certificates':'certificate','certification':'certificate',
  'certifications':'certificate','certified':'certificate',
  'credential':'certificate','credentials':'certificate',
  'course':'certificate','courses':'certificate',
  'diploma':'certificate','achievement':'certificate','achievements':'certificate',
  // education
  'college':'education','university':'education','bbs':'education',
  'btech':'education','studying':'education','study':'education',
  'studied':'education','degree':'education','student':'education',
  'academics':'education','academic':'education','aktu':'education','prayagraj':'education',
  // hackathon
  'hackathons':'hackathon','competition':'hackathon','contest':'hackathon',
  'competitions':'hackathon','challenges':'hackathon','compete':'hackathon',
  'competed':'hackathon','contests':'hackathon','yukti':'hackathon','lovable':'hackathon',
  // contact
  'reach':'contact','email':'contact','connect':'contact',
  'message':'contact','hire':'contact','collaborate':'contact',
  'collab':'contact','dm':'contact','linkedin':'contact','number':'contact','social':'contact',
  // resume
  'cv':'resume','pdf':'resume','download':'resume'
};

// ── 3. Levenshtein Distance (Typo Tolerance) ──────────
function lev(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = [];
  for (let i = 0; i <= a.length; i++) {
    dp[i] = [i];
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = i === 0 ? j :
        a[i-1] === b[j-1] ? dp[i-1][j-1] :
        1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[a.length][b.length];
}

// ── 4. Tokenizer ─────────────────────────────────────
function tokenize(q) {
  const raw = q.toLowerCase()
    .replace(/[?!.,;:'"]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
  const out = new Set();
  for (const w of raw) {
    if (STOP.has(w)) continue;
    const canon = SYN[w] || w;
    out.add(canon);
    if (canon !== w) out.add(w);
  }
  return [...out];
}

// ── 5. Token Similarity ──────────────────────────────
function tokScore(qTok, kbKey) {
  if (qTok === kbKey) return 1.0;
  if (kbKey.includes(' ') && kbKey.includes(qTok)) return 0.9;
  if (kbKey.startsWith(qTok) && qTok.length >= 4) return 0.75;
  if (qTok.startsWith(kbKey) && kbKey.length >= 4) return 0.75;
  if (kbKey.includes(qTok) && qTok.length >= 4) return 0.6;
  if (qTok.length >= 5 && kbKey.length >= 5) {
    const d = lev(qTok, kbKey);
    if (d === 1) return 0.55;
    if (d === 2 && qTok.length >= 7) return 0.3;
  }
  return 0;
}

// ── 6. KB Score Calculator ───────────────────────────
function scoreEntry(entry, tokens) {
  if (!tokens.length) return 0;
  let total = 0;
  for (const tok of tokens) {
    let best = 0;
    for (const k of entry.keys) best = Math.max(best, tokScore(tok, k));
    total += best;
  }
  const matchCount = tokens.filter(t =>
    entry.keys.some(k => tokScore(t, k) > 0.4)
  ).length;
  return (total / tokens.length) + (matchCount * 0.15);
}

// ── 7. Default Suggestions ───────────────────────────
const suggestions = [
  'Who is Prajwal?',
  'What are his skills?',
  'Tell me about VIPER',
  'His certificates?',
  'Is he doing any internship?',
  'How to contact him?'
];

// ── 8. Comprehensive Knowledge Base (Resume + AI Synthesis) ──
const KB = [
  {
    keys: ['prajwal', 'who', 'about', 'yourself', 'introduce', 'background', 'describe', 'summary', 'bio', 'who is prajwal'],
    ans: `<b>Prajwal Sharma</b> is a <b>UI/UX Designer, Visual Artist, and Python Developer</b> based in Prayagraj, India 🚀<br><br>
🎓 <b>Education:</b> Pursuing B.Tech in Computer Science & Engineering (2022–2026) at <b>BBS College of Engineering & Technology, Prayagraj</b> (affiliated with AKTU).<br>
🎨 <b>Creative Approach:</b> Background in graphite pencil portraiture translates into a keen eye for visual balance, typography, and clean UI design systems.<br>
💼 <b>Status:</b> Actively seeking Internship and Pre-Placement opportunities in UI/UX Design, Front-End Engineering, and Python Software Development!`
  },
  {
    keys: ['project', 'projects', 'work', 'built', 'created', 'developed', 'made', 'apps', 'websites'],
    ans: `Prajwal's Featured Portfolio Projects 🚀<br><br>
🔐 <b>VIPER — AI Security Operations Center UI:</b> High-fidelity UI/UX concept featuring threat map visualizations, active alert panels, and a cyber-dark aesthetic. <a href="viper-case-study.html" style="color:#c8a0ff">View Case Study →</a><br><br>
📈 <b>TradeSight AI — Fintech Platform:</b> Stock market sentiment analysis dashboard built at Yukti Hackathon 2024 (AKTU Finalist) with luxury gold visual identity. <a href="tradesight-case-study.html" style="color:#c8a0ff">View Case Study →</a><br><br>
✏️ <b>Pencilastic — Digital Art Gallery:</b> Minimal web gallery showcasing graphite portrait artwork, built with HTML5, CSS3, and JavaScript.`
  },
  {
    keys: ['viper', 'security', 'cyber', 'monitoring', 'threat'],
    ans: `<b>VIPER — AI Security Operations Center Interface</b> 🔐<br><br>
Prajwal's flagship UI/UX project designed in Figma:<br>
• 🗺️ Real-time global threat map visualization<br>
• 🚨 Incident response panels with severity indicators<br>
• 🌑 Cyber-dark aesthetic (deep obsidian black + electric cyan accents)<br><br>
<a href="viper-case-study.html" style="color:#c8a0ff">View VIPER Case Study →</a>`
  },
  {
    keys: ['tradesight', 'trade sight', 'fintech', 'stock', 'yukti', 'market'],
    ans: `<b>TradeSight AI — Fintech Platform</b> 📈<br><br>
Built for <b>Yukti Hackathon 2024 (AKTU Finalist)</b>:<br>
• 🤖 AI sentiment analysis dashboard for stock market trends<br>
• 📊 Interactive candlestick chart UI concept<br>
• 💛 Luxury gold & dark brown visual branding<br>
• 🐍 Python backend logic for market sentiment analysis.<br><br>
<a href="tradesight-case-study.html" style="color:#c8a0ff">View TradeSight Case Study →</a>`
  },
  {
    keys: ['pencilastic', 'gallery', 'art website', 'drawing website'],
    ans: `<b>Pencilastic — Digital Art Gallery</b> ✏️<br><br>
Prajwal's personal digital gallery website for graphite pencil portraiture:<br>
• Clean, minimal layout with elegant typography<br>
• Showcases realistic graphite portrait artwork<br>
• Built using HTML5, CSS3, and JavaScript.`
  },
  {
    keys: ['internship', 'intern', 'codsoft', 'job', 'work experience', 'placement', 'working', 'experience'],
    ans: `Prajwal's Experience & Internship Background 🐍<br><br>
• <b>CodSoft:</b> Python Programming Intern — Built Python automation scripts and core software utilities.<br>
• <b>Nova Fest (BBS College):</b> Head Coordinator — Led event branding, visual design, and logistics coordination.<br>
• <b>Current Goal:</b> Open for Internship & Pre-Placement roles in UI/UX Design, Front-End Dev, and Python Development.<br><br>
📧 Contact: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`
  },
  {
    keys: ['hobby', 'hobbies', 'free time', 'interest', 'passion', 'drawing', 'art', 'pencil', 'portrait', 'passions'],
    ans: `Prajwal's Hobbies & Creative Pursuits 🎨<br><br>
✏️ <b>Graphite Pencil Portraiture:</b> Self-taught artist specializing in realistic pencil portraits. This artistic discipline sharpens his eye for shading, spacing, and micro-details in UI design.<br>
🎨 <b>UI/UX & Prototyping:</b> Designing glassmorphic web concepts in Figma.<br>
🐍 <b>Python Scripting:</b> Automation and building utility scripts.<br>
🌐 <b>Web Development:</b> Experimenting with interactive CSS animations.`
  },
  {
    keys: ['skill', 'skills', 'python', 'figma', 'html', 'css', 'javascript', 'git', 'sql', 'c++', 'tech stack', 'technology', 'tools', 'coding'],
    ans: `Prajwal's Technical & Design Stack 💻<br><br>
• <b>Programming Languages:</b> Python, C / C++, HTML5, CSS3, JavaScript (ES6+), SQL<br>
• <b>UI/UX & Design:</b> Figma, Wireframing, High-Fidelity Interactive Prototyping, Brand Identity<br>
• <b>Dev Tools & Version Control:</b> Git, GitHub, VS Code, Canva, Figma Desktop<br>
• <b>Specializations:</b> Pencil Portraiture, Responsive Glassmorphic Web Design, AI Interfaces`
  },
  {
    keys: ['certificate', 'certificates', 'certification', 'certifications', 'tata', 'deloitte', 'google', 'codsoft', 'hackwithindia', 'gfg'],
    ans: `Prajwal holds <b>8 Verified Certifications</b> 🏆<br><br>
🔵 <b>Tata Group:</b> Data Visualisation: Empowering Business<br>
🔵 <b>Tata Group:</b> Cybersecurity Analyst Job Simulation<br>
🟢 <b>Deloitte:</b> Technology Consulting Job Simulation<br>
🔴 <b>Google:</b> AI Essentials Certificate<br>
☁️ <b>Google Cloud:</b> Generative AI Fundamentals<br>
🐍 <b>CodSoft:</b> Python Programming Internship<br>
💡 <b>HackWithIndia:</b> Hackathon Participation Certificate<br>
🧩 <b>GeeksforGeeks:</b> Syntax Error Hackathon Certificate`
  },
  {
    keys: ['hackathon', 'hackathons', 'yukti', 'lovable', 'hackwithindia', 'gfg', 'competition', 'contest'],
    ans: `Prajwal's Hackathon Achievements 🏆<br><br>
🥈 <b>Yukti Hackathon 2024 (AKTU):</b> Finalist with TradeSight AI<br>
🚀 <b>Lovable Global AI Hackathon:</b> Placed Top 5,000 out of 25,000 participants worldwide (Top 20% globally 🌍)<br>
💻 <b>HackWithIndia & GFG Syntax Error:</b> Participation Certificates`
  },
  {
    keys: ['education', 'college', 'university', 'bbs', 'btech', 'cse', 'aktu', 'degree', 'student', 'prayagraj', 'study'],
    ans: `Prajwal's Academic Background 🎓<br><br>
• <b>Degree:</b> B.Tech in Computer Science & Engineering (2022–2026)<br>
• <b>College:</b> BBS College of Engineering & Technology, Prayagraj<br>
• <b>Affiliation:</b> Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow<br>
• <b>Focus Areas:</b> Software Engineering, Web Development, UI/UX Design`
  },
  {
    keys: ['contact', 'email', 'reach', 'linkedin', 'github', 'instagram', 'phone', 'contact info', 'connect', 'social', 'socials'],
    ans: `Ways to Connect with Prajwal 📬<br><br>
📧 <b>Email:</b> <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a><br>
💼 <b>LinkedIn:</b> <a href="https://www.linkedin.com/in/prajwal-sharma-015b98296" target="_blank" style="color:#5cb4ff">linkedin.com/in/prajwal-sharma-015b98296</a><br>
🐙 <b>GitHub:</b> <a href="https://github.com/PrajwalSharma08" target="_blank" style="color:#c8a0ff">github.com/PrajwalSharma08</a><br>
📷 <b>Instagram:</b> <a href="https://instagram.com/ps_artist_661" target="_blank" style="color:#c8a0ff">@ps_artist_661</a>`
  },
  {
    keys: ['resume', 'cv', 'download', 'pdf'],
    ans: `Prajwal's resume is available for instant download! 📄<br><br>
Click the <b>📄 Resume icon</b> on the desktop or click the <b>'Download PDF'</b> button inside the Portfolio window.`
  }
];

// ── 9. Intelligent Response Synthesizer ─────────────────
function getAnswer(q) {
  if (!q || typeof q !== 'string') return KB.find(k => k.keys.includes('prajwal')).ans;
  const lower = q.toLowerCase().trim().replace(/[?!.,;:'"]/g, '');

  // 1. Direct High-Priority Intent Matches
  if (
    lower.includes('who is prajwal') ||
    lower.includes('who is he') ||
    lower.includes('about prajwal') ||
    lower === 'who' ||
    lower === 'prajwal' ||
    lower === 'prajwal sharma' ||
    lower === 'bio' ||
    lower === 'intro' ||
    lower === 'introduction'
  ) {
    return KB.find(k => k.keys.includes('prajwal')).ans;
  }

  if (lower.includes('intern') || lower.includes('codsoft') || lower.includes('experience') || lower.includes('work')) {
    return KB.find(k => k.keys.includes('internship')).ans;
  }

  if (lower.includes('hobby') || lower.includes('hobbies') || lower.includes('art') || lower.includes('drawing') || lower.includes('portrait')) {
    return KB.find(k => k.keys.includes('hobby')).ans;
  }

  if (lower.includes('project') || lower.includes('projects') || lower.includes('built') || lower.includes('made')) {
    return KB.find(k => k.keys.includes('project')).ans;
  }

  if (lower.includes('viper')) {
    return KB.find(k => k.keys.includes('viper')).ans;
  }

  if (lower.includes('tradesight') || lower.includes('trade sight')) {
    return KB.find(k => k.keys.includes('tradesight')).ans;
  }

  if (lower.includes('pencilastic')) {
    return KB.find(k => k.keys.includes('pencilastic')).ans;
  }

  if (lower.includes('skill') || lower.includes('skills') || lower.includes('tech') || lower.includes('stack') || lower.includes('coding')) {
    return KB.find(k => k.keys.includes('skill')).ans;
  }

  if (lower.includes('certif') || lower.includes('tata') || lower.includes('deloitte') || lower.includes('google')) {
    return KB.find(k => k.keys.includes('certificate')).ans;
  }

  if (lower.includes('hackathon') || lower.includes('yukti') || lower.includes('lovable')) {
    return KB.find(k => k.keys.includes('hackathon')).ans;
  }

  if (lower.includes('education') || lower.includes('college') || lower.includes('university') || lower.includes('aktu') || lower.includes('btech')) {
    return KB.find(k => k.keys.includes('education')).ans;
  }

  if (lower.includes('contact') || lower.includes('email') || lower.includes('linkedin') || lower.includes('github') || lower.includes('instagram') || lower.includes('phone')) {
    return KB.find(k => k.keys.includes('contact')).ans;
  }

  if (lower.includes('resume') || lower.includes('cv') || lower.includes('download')) {
    return KB.find(k => k.keys.includes('resume')).ans;
  }

  // 2. Tokenizer Matching
  const tokens = tokenize(q);
  if (!tokens.length) {
    return KB.find(k => k.keys.includes('prajwal')).ans;
  }

  let best = null, bestScore = 0;
  for (const entry of KB) {
    const s = scoreEntry(entry, tokens);
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  if (best && bestScore >= 0.05) return best.ans;

  // Fallback: Default to Prajwal Bio
  return KB.find(k => k.keys.includes('prajwal')).ans;
}
