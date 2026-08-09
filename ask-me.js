/* ════════════════════════════════════════════════════
   GEMINI 3.6 FLASH AI ENGINE — Prajwal's Portfolio
   Smart Natural Language Processor & Knowledge Base
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
  'get','give','know','want','need','like','think','h',
  's','t','re','ve','ll','d','m','doing','hai','kya','ho'
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
  'website':'project','application':'project',
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

// ── 8. Knowledge Base (Gemini 3.6 Flash Intelligence) ─
const KB = [
  {
    keys: ['hi', 'hello', 'hey', 'greetings', 'hola', 'namaste', 'start', 'kaise ho', 'kaisa hai'],
    ans: `Namaste! 👋 Main <b>Gemini 3.6 Flash AI</b> hun — Prajwal Sharma ka official portfolio assistant. <br><br>Aap Prajwal ke <b>skills, projects, certificates, internship, hackathons, hobbies, ya contact details</b> ke baare mein kuch bhi puch sakte hain!`
  },
  {
    keys: ['prajwal', 'who', 'about', 'yourself', 'introduce', 'kaun hai', 'kaun h', 'konsa student', 'describe'],
    ans: `<b>Prajwal Sharma</b> ek <b>UI/UX Designer, Visual Artist, aur Python Developer</b> hain 🚀<br><br>
🎓 <b>Education:</b> B.Tech in Computer Science & Engineering (2022–2026) from <b>BBS College of Engineering & Technology, Prayagraj</b> (AKTU affiliated).<br>
🎨 <b>Specialization:</b> Traditional graphite pencil portraiture ko modern UI/UX design & Python engineering ke sath combine karte hain.<br>
💼 <b>Status:</b> Actively looking for Internship & Freelance opportunities!`
  },
  {
    keys: ['internship', 'intern', 'codsoft', 'job', 'work experience', 'placement', 'kya kar raha hai', 'kya kr rha h', 'internship hai kya'],
    ans: `Prajwal ne <b>CodSoft mein Python Programming Internship</b> complete ki hai! 🐍<br><br>
• Python scripting, automation, aur software engineering fundamentals par kaam kiya.<br>
• Filhaal final year B.Tech CSE student hain (graduating 2026).<br>
• <b>Actively open for new Internship roles</b> in UI/UX Design, Python Dev, or Web Development.<br><br>
📧 Contact for Internships: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`
  },
  {
    keys: ['hobby', 'hobbies', 'free time', 'interest', 'passion', 'kya pasand hai', 'kya krta h free time', 'drawing', 'art', 'pencil'],
    ans: `Prajwal ki hobbies & passions 🎨<br><br>
✏️ <b>Pencil Portraiture:</b> Graphite pencil portraits banana unka sabse bada passion hai! Years of art experience gives him a sharp eye for visual detail.<br>
🎨 <b>UI/UX Design:</b> Free time mein premium interfaces aur design systems craft karna.<br>
🐍 <b>Python & Coding:</b> Automation tools aur scripting projects build karna.<br>
🌐 <b>Web Dev:</b> Creative CSS animations aur modern web layouts experiment karna.<br>
🎭 <b>Brand Identity:</b> Logos aur brand visual identity design karna.`
  },
  {
    keys: ['skill', 'skills', 'python', 'figma', 'html', 'css', 'javascript', 'git', 'sql', 'c++', 'tech stack', 'technology', 'tools', 'kya janta hai', 'kya aata hai'],
    ans: `Prajwal ka full Tech & Design Stack 💻<br><br>
<b>Programming:</b> 🐍 Python · 🌐 HTML5 · 🎨 CSS3 · ⚡ JavaScript · 💻 C/C++ · 🗄️ SQL<br>
<b>Design & Tools:</b> 🖌️ Figma (UI/UX) · 🔀 Git & GitHub · 📱 Responsive Web Design<br>
<b>Creative:</b> ✏️ Pencil Portraiture · 🎭 Brand Identity Design<br>
<b>Learning:</b> 🤖 AI/ML Engineering · ☁️ Cloud Platforms`
  },
  {
    keys: ['viper', 'security', 'cyber', 'monitoring', 'threat'],
    ans: `<b>VIPER — AI Security Interface</b> 🔐<br><br>
Prajwal ka flagship UI/UX project — ek AI-powered Security Operations Center interface:<br>
• 🗺️ Real-time threat map visualization<br>
• 🚨 Cyber threat alert panels with severity indicators<br>
• 🌑 Cyber-dark aesthetic (deep blacks + neon cyan accents)<br><br>
Figma mein fully designed with complete design system & components. <a href="viper-case-study.html" style="color:#c8a0ff">View Case Study →</a>`
  },
  {
    keys: ['tradesight', 'trade sight', 'fintech', 'stock', 'yukti', 'market'],
    ans: `<b>TradeSight AI — Fintech Platform</b> 📈<br><br>
Built at <b>Yukti Hackathon 2024 (AKTU)</b> — Finalist project!<br>
• 🤖 AI stock market sentiment analysis dashboard<br>
• 📊 Real-time candlestick chart UI concept<br>
• 💛 Luxury gold & dark brown brand identity<br>
• 🐍 Python backend for sentiment calculation.<br><br>
<a href="tradesight-case-study.html" style="color:#c8a0ff">View Case Study →</a>`
  },
  {
    keys: ['pencilastic', 'gallery', 'art website'],
    ans: `<b>Pencilastic — Digital Art Gallery</b> ✏️<br><br>
Prajwal ki personal digital gallery website for graphite pencil portraits:<br>
• Minimal white layout with elegant typography<br>
• Curated artwork showcase bridging traditional art with web dev<br>
• Built with HTML5, CSS3, and JavaScript.`
  },
  {
    keys: ['certificate', 'certificates', 'certification', 'tata', 'deloitte', 'google', 'codsoft', 'hackwithindia', 'gfg'],
    ans: `Prajwal ke paas <b>8 Professional Certificates</b> hain 🏆<br><br>
🔵 <b>Tata Group</b> — Data Visualisation: Empowering Business<br>
🔵 <b>Tata Group</b> — Cybersecurity Analyst Job Simulation<br>
🟢 <b>Deloitte</b> — Technology Consulting Job Simulation<br>
🔴 <b>Google</b> — AI Essentials Certificate<br>
☁️ <b>Google Cloud</b> — Generative AI Fundamentals<br>
🐍 <b>CodSoft</b> — Python Programming Internship<br>
💡 <b>HackWithIndia</b> — Hackathon Participation<br>
🧩 <b>GeeksforGeeks</b> — Syntax Error Hackathon`
  },
  {
    keys: ['hackathon', 'yukti', 'lovable', 'hackwithindia', 'gfg', 'competition'],
    ans: `Prajwal ne <b>4 Hackathons</b> mein participate kiya hai 🏆<br><br>
🥈 <b>Yukti Hackathon 2024 (AKTU):</b> Finalist with TradeSight AI<br>
🚀 <b>Lovable Hackathon:</b> Top 5,000 / 25,000 globally (Top 20% worldwide 🌍)<br>
💻 <b>HackWithIndia:</b> Certificate participant<br>
🧩 <b>GFG Syntax Error:</b> Hackathon participant`
  },
  {
    keys: ['contact', 'email', 'reach', 'linkedin', 'github', 'instagram', 'phone', 'contact info', 'kaise milen'],
    ans: `Prajwal se contact karne ke tareeqe 📬<br><br>
📧 <b>Email:</b> <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a><br>
💼 <b>LinkedIn:</b> <a href="https://www.linkedin.com/in/prajwal-sharma-015b98296" target="_blank" style="color:#5cb4ff">linkedin.com/in/prajwal-sharma-015b98296</a><br>
🐙 <b>GitHub:</b> <a href="https://github.com/PrajwalSharma08" target="_blank" style="color:#c8a0ff">github.com/PrajwalSharma08</a><br>
📷 <b>Instagram:</b> <a href="https://instagram.com/ps_artist_661" target="_blank" style="color:#c8a0ff">@ps_artist_661</a>`
  },
  {
    keys: ['resume', 'cv', 'download', 'pdf'],
    ans: `Prajwal ka Resume aap direct portfolio se download kar sakte hain! 📄<br><br>
Portfolio window mein <b>"📄 Download PDF"</b> button click karein, ya bottom dock mein Resume icon click karein.`
  }
];

// ── 9. Find best-matching answer ─────────────────────
function getAnswer(q) {
  if (!q || typeof q !== 'string') return `Mujhse Prajwal ke baare mein kuch bhi puchhiye! Jaise: <i>"What are his skills?"</i> 😊`;
  const lower = q.toLowerCase().trim();
  if (lower === 'tell' || lower === 'tell me' || lower === 'details' || lower === 'more' || lower === 'batao' || lower === 'kuch batao') {
    return `<b>Prajwal Sharma</b> ek B.Tech CSE student, UI/UX Designer, Visual Artist, aur Python Developer hain! 🚀<br><br>Aap kya jaan-na chahte hain?<br>• 🎨 <b>Skills & Tech Stack</b><br>• 🔐 <b>VIPER & Projects</b><br>• 🏆 <b>Certificates & Hackathons</b><br>• 🐍 <b>Internship Experience</b>`;
  }
  const tokens = tokenize(q);
  if (!tokens.length) {
    return `Mujhse Prajwal ke baare mein puchhiye! Jaise:<br><i>"What are his skills?"</i> ya <i>"Tell me about VIPER"</i> 😊`;
  }
  let best = null, bestScore = 0;
  for (const entry of KB) {
    const s = scoreEntry(entry, tokens);
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  if (best && bestScore >= 0.07) return best.ans;
  return `Main is sawaal ka exact jawab nahi dhoond paaya! 🤔<br><br>
Aap ye try kar sakte hain:<br>
• <i>"What are his skills?"</i><br>
• <i>"Tell me about VIPER project"</i><br>
• <i>"Is he doing any internship?"</i><br>
• <i>"What are his hobbies?"</i><br>
• <i>"How can I contact him?"</i><br><br>
Ya direct email karein: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`;
}
