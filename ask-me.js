/* ════════════════════════════════════════════════════
   ASK ABOUT ME — Prajwal's AI Portfolio Engine
   Synthesizes answers directly from Prajwal's complete resume.
════════════════════════════════════════════════════ */

// ── 1. Stop words (noise to ignore) ─────────────────
const STOP = new Set([
  'is','are','was','were','the','a','an','he','his','him',
  'does','did','do','has','have','had','will','can','could',
  'would','should','may','might','must','shall',
  'what','who','how','where','when','which','why',
  'tell','me','about','any','some','please','give','show',
  'prajwal','sharma','this','that','these','those','it',
  'i','my','we','our','they','their','you','your',
  'of','in','on','at','to','for','with','from','and','or',
  'but','if','then','so','also','too','as','by','up','be',
  'get','give','know','want','need','like','think','all'
]);

// ── 2. Synonym → canonical topic map ────────────────
const SYN = {
  // internship / work
  'intern':'internship','interning':'internship','interned':'internship',
  'job':'work','jobs':'work','employed':'work','employment':'work',
  'working':'work','placement':'internship','training':'internship',
  'work':'work','career':'work',
  // hobby
  'hobbies':'hobby','interest':'hobby','interests':'hobby',
  'passion':'hobby','passions':'hobby','enjoy':'hobby','enjoying':'hobby',
  'leisure':'hobby','spare':'hobby','fun':'hobby','drawing':'hobby',
  'likes':'hobby','loves':'hobby','recreation':'hobby','art':'hobby',
  // skill / tech
  'skills':'skill','tech':'skill','technology':'skill','stack':'skill',
  'technologies':'skill','language':'skill','languages':'skill',
  'tools':'skill','tool':'skill','knows':'skill','know':'skill',
  'expertise':'skill','proficient':'skill','capable':'skill',
  'programming':'skill','framework':'skill',
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
  'academics':'education','academic':'education',
  // hackathon
  'hackathons':'hackathon','competition':'hackathon','contest':'hackathon',
  'competitions':'hackathon','challenges':'hackathon','compete':'hackathon',
  'competed':'hackathon','contests':'hackathon',
  // contact
  'reach':'contact','email':'contact','connect':'contact',
  'message':'contact','hire':'contact','collaborate':'contact',
  'collab':'contact','dm':'contact','linkedin':'contact','number':'contact',
  // availability
  'available':'available','open':'available','fresher':'available',
  'opportunity':'available','opportunities':'available','seeking':'available',
  'looking':'available','freelance':'available','remote':'available',
  'recruit':'available','employ':'available',
  // python
  'py':'python','scripting':'python','script':'python',
  'automation':'python','coding':'python','code':'python',
  // design
  'design':'figma','designing':'figma','uiux':'figma','prototype':'figma',
  'wireframe':'figma','wireframes':'figma','interface':'figma',
  'mockup':'figma','branding':'figma','ui':'figma','ux':'figma',
};

// ── 3. Levenshtein distance (typo tolerance) ─────────
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

// ── 4. Normalize query → clean tokens ───────────────
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

// ── 5. Token ↔ KB-key similarity score ──────────────
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

// ── 6. Score an entire KB entry ──────────────────────
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

// ── 7. Suggestions ───────────────────────────────────
const suggestions = [
  'Who is Prajwal?',
  'What are his skills?',
  'Tell me about VIPER',
  'His certificates?',
  'Is he doing any internship?',
  'How to contact him?'
];

// ── 8. Resume Knowledge Base ─────────────────────────
const KB = [
  {
    keys: ['hi', 'hello', 'hey', 'greetings', 'hola', 'namaste', 'start'],
    ans: `Hello! 👋 How can I help you today?<br><br>I have access to Prajwal's full resume and background. You can ask me about his <b>skills, featured projects, certifications, internship, hackathons, or hobbies!</b>`
  },
  {
    keys: ['project', 'projects', 'work', 'built', 'created', 'developed', 'made', 'apps', 'websites'],
    ans: `Prajwal's Featured Portfolio Projects 🚀<br><br>
🔐 <b>VIPER — AI Security Interface:</b> High-fidelity UI/UX concept for an AI Security Operations Center featuring threat maps, real-time alerts, and cyber-dark aesthetic. <a href="viper-case-study.html" style="color:#c8a0ff">View Case Study →</a><br><br>
📈 <b>TradeSight AI — Fintech Platform:</b> Developed for Yukti Hackathon 2024 (AKTU Finalist). AI sentiment analysis dashboard for stock market trends with luxury gold branding. <a href="tradesight-case-study.html" style="color:#c8a0ff">View Case Study →</a><br><br>
✏️ <b>Pencilastic — Digital Art Gallery:</b> Minimal web gallery showcasing graphite pencil portrait artwork, built with HTML5, CSS3, and JavaScript.`
  },
  {
    keys: ['viper', 'security', 'cyber', 'monitoring', 'threat'],
    ans: `<b>VIPER — AI Security Interface</b> 🔐<br><br>
Prajwal's flagship UI/UX project — a concept for an AI-powered Security Operations Center:<br>
• 🗺️ Real-time threat map visualization<br>
• 🚨 Active threat alert panels with severity indicators<br>
• 🌑 Cyber-dark aesthetic (deep obsidian black + cyan accents)<br><br>
Built fully in <b>Figma</b> as a comprehensive design system. <a href="viper-case-study.html" style="color:#c8a0ff">View Case Study →</a>`
  },
  {
    keys: ['tradesight', 'trade sight', 'fintech', 'stock', 'yukti', 'market'],
    ans: `<b>TradeSight AI — Fintech Platform</b> 📈<br><br>
Developed for <b>Yukti Hackathon 2024 (AKTU Finalist)</b>:<br>
• 🤖 AI sentiment analysis dashboard for stock market trends<br>
• 📊 Real-time candlestick chart UI concept<br>
• 💛 Luxury gold & dark brown visual identity<br>
• 🐍 Python backend logic for sentiment analysis.<br><br>
<a href="tradesight-case-study.html" style="color:#c8a0ff">View Case Study →</a>`
  },
  {
    keys: ['pencilastic', 'gallery', 'art website', 'drawing website'],
    ans: `<b>Pencilastic — Digital Art Gallery</b> ✏️<br><br>
Prajwal's personal digital gallery website for graphite pencil portraiture:<br>
• Clean, minimal white layout with elegant typography<br>
• Curated artwork showcase bridging traditional art with web development<br>
• Built using HTML5, CSS3, and JavaScript.`
  },
  {
    keys: ['prajwal', 'who', 'about', 'yourself', 'introduce', 'background', 'describe', 'summary'],
    ans: `<b>Prajwal Sharma</b> is a <b>UI/UX Designer, Visual Artist, and Python Developer</b> based in Prayagraj, India 🚀<br><br>
🎓 <b>Education:</b> B.Tech in Computer Science & Engineering (2022–2026) from <b>BBS College of Engineering & Technology, Prayagraj</b> (affiliated with AKTU).<br>
🎨 <b>Background:</b> He blends traditional graphite pencil portraiture with modern UI/UX design systems and Python web development.<br>
💼 <b>Status:</b> Actively seeking Internship and Pre-Placement opportunities in UI/UX Design & Software Engineering!`
  },
  {
    keys: ['internship', 'intern', 'codsoft', 'job', 'work experience', 'placement', 'working', 'experience'],
    ans: `Prajwal completed a <b>Python Programming Internship at CodSoft</b> 🐍<br><br>
• Developed Python scripting projects, automation tools, and strengthened core software engineering fundamentals.<br>
• Served as <b>Head Coordinator for Nova Fest</b> at BBS College — managing end-to-end design, branding, and event logistics.<br>
• <b>Actively seeking new Internship opportunities</b> in UI/UX Design, Python Development, or Front-End Engineering.<br><br>
📧 Contact for Internships: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`
  },
  {
    keys: ['hobby', 'hobbies', 'free time', 'interest', 'passion', 'drawing', 'art', 'pencil', 'portrait', 'passions'],
    ans: `Prajwal's Hobbies & Creative Pursuits 🎨<br><br>
✏️ <b>Graphite Pencil Portraiture:</b> Years of self-taught graphite portrait drawing. This artistic foundation gives him an exceptional eye for detail, light, shadow, and visual balance.<br>
🎨 <b>UI/UX Design:</b> Designing high-fidelity interactive prototypes and design systems in Figma.<br>
🐍 <b>Python Scripting:</b> Creating automation scripts and experimenting with algorithms for fun.<br>
🌐 <b>Web Development:</b> Crafting responsive web interfaces with modern CSS animations and glassmorphism.<br>
🎭 <b>Brand Identity:</b> Designing logos, visual identities, and event branding.`
  },
  {
    keys: ['skill', 'skills', 'python', 'figma', 'html', 'css', 'javascript', 'git', 'sql', 'c++', 'tech stack', 'technology', 'tools', 'coding'],
    ans: `Prajwal's Resume Tech & Design Stack 💻<br><br>
• <b>Programming Languages:</b> Python, C / C++, HTML5, CSS3, JavaScript (ES6+), SQL<br>
• <b>UI/UX & Design:</b> Figma, Wireframing, High-Fidelity Prototyping, Brand Identity Systems<br>
• <b>Tools & Version Control:</b> Git, GitHub, VS Code, Canva, Figma Desktop<br>
• <b>Specializations:</b> Pencil Portraiture, Responsive Web Design, AI/ML (Learning)`
  },
  {
    keys: ['certificate', 'certificates', 'certification', 'certifications', 'tata', 'deloitte', 'google', 'codsoft', 'hackwithindia', 'gfg'],
    ans: `Prajwal holds <b>8 Professional Certifications</b> 🏆<br><br>
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
🚀 <b>Lovable Global Hackathon:</b> Top 5,000 out of 25,000 participants globally (Top 20% worldwide 🌍)<br>
💻 <b>HackWithIndia:</b> Certificate participant<br>
🧩 <b>GFG Syntax Error:</b> Hackathon participant`
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
Click the <b>📄 Resume icon</b> in the bottom dock or click the <b>'Download PDF'</b> button inside the Portfolio window.`
  }
];

// ── 9. Find best-matching answer ─────────────────────
function getAnswer(q) {
  if (!q || typeof q !== 'string') return `Ask me anything about Prajwal! For example: <i>"What are his skills?"</i> 😊`;
  const lower = q.toLowerCase().trim();
  if (lower === 'tell' || lower === 'tell me' || lower === 'details' || lower === 'more') {
    return `<b>Prajwal Sharma</b> is a B.Tech CSE student, UI/UX Designer, Visual Artist, and Python Developer! 🚀<br><br>What would you like to explore?<br>• 🎨 <b>Skills & Tech Stack</b><br>• 🔐 <b>VIPER & Projects</b><br>• 🏆 <b>Certificates & Hackathons</b><br>• 🐍 <b>Internship Experience</b>`;
  }
  const tokens = tokenize(q);
  if (!tokens.length) {
    return `Ask me anything about Prajwal's resume! For example:<br><i>"What are his skills?"</i> or <i>"Tell me about VIPER"</i> 😊`;
  }
  let best = null, bestScore = 0;
  for (const entry of KB) {
    const s = scoreEntry(entry, tokens);
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  if (best && bestScore >= 0.07) return best.ans;
  return `I searched Prajwal's resume for that, but couldn't find an exact match! 🤔<br><br>
Try asking about:<br>
• <i>"What are his skills?"</i><br>
• <i>"Tell me about VIPER project"</i><br>
• <i>"Is he doing any internship?"</i><br>
• <i>"What are his certificates?"</i><br>
• <i>"How to contact him?"</i><br><br>
Or email directly: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`;
}
