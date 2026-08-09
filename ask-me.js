/* ════════════════════════════════════════════════════
   ASK ME  —  Smart NLP Engine for Prajwal's Portfolio
   Pipeline: normalize → stop-word filter → synonym expand
            → per-token fuzzy score → best-match answer
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
  'get','give','know','want','need','like','think',
  's','t','re','ve','ll','d','m','doing'
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
  'leisure':'hobby','spare':'hobby','fun':'hobby',
  'likes':'hobby','loves':'hobby','recreation':'hobby',
  // skill / tech
  'skills':'skill','tech':'skill','technology':'skill','stack':'skill',
  'technologies':'skill','language':'skill','languages':'skill',
  'tools':'skill','tool':'skill','knows':'skill','know':'skill',
  'expertise':'skill','proficient':'skill','capable':'skill',
  'programming':'skill','languages':'skill','framework':'skill',
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
  'collab':'contact','dm':'contact','linkedin':'contact',
  // availability
  'available':'available','open':'available','fresher':'available',
  'opportunity':'available','opportunities':'available','seeking':'available',
  'looking':'available','freelance':'available','remote':'available',
  'recruit':'available','employ':'available',
  // art
  'pencil':'art','portrait':'art','portraits':'art','drawing':'art',
  'drawings':'art','sketch':'art','sketches':'art','artistic':'art',
  'artist':'art','creative':'art','graphite':'art',
  // python
  'py':'python','scripting':'python','script':'python',
  'automation':'python','coding':'python','code':'python',
  'backend':'python',
  // design
  'design':'figma','designing':'figma','uiux':'figma','prototype':'figma',
  'wireframe':'figma','wireframes':'figma','interface':'figma',
  'mockup':'figma','branding':'figma','ui':'figma','ux':'figma',
  // location
  'city':'location','india':'location','prayagraj':'location',
  'allahabad':'location','place':'location','based':'location',
  // goal
  'dream':'goal','future':'goal','aspiration':'goal','plan':'goal',
  'ambition':'goal','aim':'goal',
  // strength
  'strength':'strength','strong':'strength','best':'strength',
  'unique':'strength','different':'strength','speciality':'strength',
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
    if (canon !== w) out.add(w); // keep raw too for exact KB hits
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

// ── 7. Knowledge Base ────────────────────────────────
const KB = [
  {
    keys: ['internship', 'intern', 'codsoft', 'placement', 'training', 'work experience'],
    ans: `Prajwal completed a <b>Python Programming Internship at CodSoft</b> 🐍<br><br>
He built Python scripting projects and deepened his programming fundamentals during the internship. Currently a final-year student (graduating 2026) and <b>actively seeking new internship opportunities</b> in:<br>
• 🎨 UI/UX Design<br>
• 🐍 Python / Web Development<br>
• 🤖 AI/ML Engineering<br><br>
📧 Contact: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`
  },
  {
    keys: ['hobby', 'hobbies', 'interest', 'passion', 'enjoy', 'free time', 'leisure', 'spare time', 'fun', 'recreation', 'likes'],
    ans: `Prajwal's hobbies & passions 🎨<br><br>
✏️ <b>Pencil Portraiture</b> — His biggest passion! Years of graphite portrait drawing. Incredible eye for detail.<br>
🎨 <b>UI/UX Design</b> — Designs even in free time, always refining his craft.<br>
🐍 <b>Python & Coding</b> — Building automation scripts and small tools for fun.<br>
🌐 <b>Web Dev</b> — Experimenting with layouts, CSS tricks and animations.<br>
🎭 <b>Brand Identity</b> — Creating logos and visual systems from scratch.<br>
🤖 <b>AI/ML</b> — Exploring generative AI tools and models.`
  },
  {
    keys: ['viper', 'security', 'monitoring', 'threat', 'cyber', 'cybersecurity interface', 'ai security'],
    ans: `<b>VIPER</b> — AI Security Interface 🔐<br><br>
Prajwal's most polished UI/UX concept — a design for an AI-powered security operations center:<br>
• 🗺️ Real-time threat map visualization<br>
• 🚨 Active alert panels with severity levels<br>
• 👁️ Live tracking indicators<br>
• 🌑 Cyber-dark aesthetic — deep blacks + cyan accents<br><br>
Fully built in <b>Figma</b> as a complete design system. <a href="viper-case-study.html" style="color:#c8a0ff">View Case Study →</a>`
  },
  {
    keys: ['tradesight', 'trade sight', 'fintech', 'stock', 'trading', 'market', 'sentiment', 'investment'],
    ans: `<b>TradeSight AI</b> — Fintech Platform 📈<br><br>
Built at <b>Yukti Hackathon 2024 (AKTU)</b> — reached the finals!<br>
• 🤖 AI sentiment analysis dashboard for stock market<br>
• 📊 Candlestick chart UI with real-time feel<br>
• 💛 Complete brand identity — luxury gold & dark brown<br>
• 🐍 Python backend for market data analysis<br><br>
Full brand + product design in Figma + Python backend. <a href="tradesight-case-study.html" style="color:#c8a0ff">View Case Study →</a>`
  },
  {
    keys: ['pencilastic', 'digital gallery', 'art website', 'art gallery', 'gallery website'],
    ans: `<b>Pencilastic</b> — Digital Art Gallery ✏️<br><br>
Prajwal's personal gallery website for his traditional graphite artwork:<br>
• 🖼️ Clean minimal white layout with elegant typography<br>
• 📸 Curated grid of pencil portraits<br>
• 🌉 Bridges traditional art with modern web development<br><br>
Built with HTML, CSS, and JavaScript — a love letter to his pencil art roots.`
  },
  {
    keys: ['art', 'pencil', 'portrait', 'drawing', 'sketch', 'graphite', 'artistic', 'artist', 'creative', 'artwork', 'illustrat'],
    ans: `Prajwal is a <b>self-taught pencil portrait artist</b> ✏️<br><br>
Years of graphite portraiture experience — not just a hobby, it shapes how he designs:<br>
• 👁️ Strong eye for detail, value, light & shadow<br>
• 🎨 Composition skills that directly translate to UI layout<br>
• ✨ Aesthetic sensibility that makes designs feel premium<br><br>
See his work on <a href="https://instagram.com/ps_artist_661" target="_blank" style="color:#c8a0ff">Instagram @ps_artist_661</a> or in the <b>Pencilastic</b> project!`
  },
  {
    keys: ['hackathon', 'yukti', 'lovable', 'hackwithindia', 'gfg', 'syntax', 'competition', 'contest', 'competed', 'challenge'],
    ans: `Prajwal has competed in <b>4 hackathons</b>! 🏆<br><br>
🥈 <b>Yukti Hackathon 2024</b> (AKTU, UP) — Finalist with TradeSight AI<br>
🚀 <b>Lovable Hackathon</b> — Top 5,000 out of 25,000 globally! (Top 20% 🌍)<br>
💻 <b>HackWithIndia</b> — Participant & certificate<br>
🧩 <b>GFG Syntax Error</b> — Participant<br><br>
Hackathons are where he excels — full-stack design + code under pressure!`
  },
  {
    keys: ['nova', 'fest', 'coordinator', 'cultural', 'college event', 'organizer', 'led', 'managed', 'organized'],
    ans: `Prajwal was <b>Head Coordinator for Nova Fest</b> at BBS College 🎤<br><br>
• 🎨 Led ALL design and branding for the festival<br>
• 📋 Managed logistics and team coordination<br>
• 🖼️ Created all visual materials — posters, banners, digital assets<br>
• 🎭 Oversaw the entire large-scale cultural festival end-to-end<br><br>
Great demonstration of leadership, design execution and time management skills!`
  },
  {
    keys: ['certificate', 'certification', 'certified', 'credential', 'achievement', 'qualified', 'badge'],
    ans: `Prajwal has earned <b>8 professional certificates</b> 🏅<br><br>
🔵 <b>Tata Group</b> — Data Visualisation: Empowering Business<br>
🔵 <b>Tata Group</b> — Cybersecurity Analyst Job Simulation<br>
🟢 <b>Deloitte</b> — Technology Consulting Job Simulation<br>
🔴 <b>Google</b> — AI Essentials<br>
☁️ <b>Google Cloud</b> — Generative AI Fundamentals<br>
🐍 <b>CodSoft</b> — Python Programming Internship<br>
💡 <b>HackWithIndia</b> — Hackathon Certificate<br>
🧩 <b>GeeksforGeeks</b> — Syntax Error Hackathon<br><br>
All visible in the Certificates section! 📜`
  },
  {
    keys: ['google', 'ai essentials', 'generative', 'vertex', 'cloud', 'llm', 'foundation model'],
    ans: `Prajwal holds <b>2 Google certificates</b> 🔴☁️<br><br>
🔴 <b>Google AI Essentials</b> — Core AI concepts, prompt engineering, responsible AI<br>
☁️ <b>Google Cloud — Generative AI Fundamentals</b> — Foundation models, Vertex AI, LLMs, prompt design<br><br>
He's actively learning AI/ML engineering and exploring generative AI tools! 🤖`
  },
  {
    keys: ['tata', 'data visualisation', 'empowering business', 'cybersecurity analyst', 'simulation'],
    ans: `Prajwal completed <b>2 Tata Group job simulations</b> 🔵<br><br>
📊 <b>Data Visualisation: Empowering Business</b><br>→ Dashboards & charts for business decisions<br><br>
🔐 <b>Cybersecurity Analyst Job Simulation</b><br>→ Security incident analysis + professional reports<br><br>
Enterprise-level exposure while still a student! 💼`
  },
  {
    keys: ['deloitte', 'consulting', 'technology consulting', 'advisory'],
    ans: `Prajwal completed the <b>Deloitte Technology Consulting Job Simulation</b> 🟢<br><br>
Worked through real-world consulting scenarios:<br>
• 💡 Technology strategy and recommendations<br>
• 📊 Business problem analysis<br>
• 📝 Professional reporting and communication<br><br>
Global firm-level exposure — excellent for a CSE student! 💼`
  },
  {
    keys: ['skill', 'python', 'html', 'css', 'javascript', 'figma', 'git', 'sql', 'technology', 'tech stack', 'tools', 'expertise', 'programming', 'know', 'proficient'],
    ans: `Prajwal's complete tech skill set 💻<br><br>
<b>Programming:</b><br>
🐍 Python &nbsp;·&nbsp; 🌐 HTML5 &nbsp;·&nbsp; 🎨 CSS3 &nbsp;·&nbsp; ⚡ JavaScript &nbsp;·&nbsp; 💻 C/C++ &nbsp;·&nbsp; 🗄️ SQL<br><br>
<b>Design & Tools:</b><br>
🖌️ Figma &nbsp;·&nbsp; 🔀 Git & GitHub &nbsp;·&nbsp; 📱 Responsive Design<br><br>
<b>Specializations:</b><br>
🎭 UI/UX Design &nbsp;·&nbsp; 🖼️ Brand Identity &nbsp;·&nbsp; ✏️ Pencil Art<br><br>
<b>Learning:</b> 🤖 AI/ML Engineering &nbsp;·&nbsp; ☁️ Cloud Platforms`
  },
  {
    keys: ['python', 'scripting', 'automation', 'backend', 'django', 'flask', 'py'],
    ans: `Python is Prajwal's core programming language 🐍<br><br>
• Interned at <b>CodSoft</b> as a Python developer<br>
• Built the <b>TradeSight AI</b> market analysis backend in Python<br>
• AI/ML learning — working through ML libraries<br>
• Scripting, automation, and data projects<br>
• Exploring Django/Flask for web backends<br><br>
Python was his gateway into software engineering! 🚀`
  },
  {
    keys: ['figma', 'design', 'interface', 'wireframe', 'prototype', 'component', 'mockup', 'branding', 'ui', 'ux'],
    ans: `Figma is Prajwal's primary creative tool 🖌️<br><br>
He uses it end-to-end:<br>
• 🗂️ Component libraries & design systems from scratch<br>
• 📐 Wireframing & information architecture<br>
• 🎨 High-fidelity mockups with visual polish<br>
• 🔗 Interactive prototyping<br>
• 🎭 Brand identity systems<br><br>
Biggest Figma projects: <b>VIPER</b> (security UI) & <b>TradeSight AI</b> (fintech). Both have complete design systems!`
  },
  {
    keys: ['project', 'work', 'built', 'created', 'developed', 'made', 'portfolio'],
    ans: `Prajwal's 3 main portfolio projects 🚀<br><br>
🔐 <b>VIPER</b> — AI Security Monitoring UI/UX (Figma)<br>
📈 <b>TradeSight AI</b> — Fintech brand & dashboard (Yukti Hackathon 2024)<br>
✏️ <b>Pencilastic</b> — Personal pencil art gallery website (HTML/CSS/JS)<br><br>
He also has 15+ smaller projects in Python, web dev, and branding. Ask about any!`
  },
  {
    keys: ['education', 'college', 'university', 'bbs', 'btech', 'cse', 'computer science', 'aktu', 'degree', 'student', 'studying', 'prayagraj', '2026'],
    ans: `Prajwal's Education 📚<br><br>
🎓 <b>B.Tech — Computer Science & Engineering</b><br>
📍 BBS College of Engineering & Technology, Prayagraj<br>
🗓️ 2022 – 2026 (Final year)<br>
🏛️ Affiliated with AKTU, Uttar Pradesh<br><br>
Strong CS foundation + real-world skills in design, Python, and web development.`
  },
  {
    keys: ['contact', 'reach', 'email', 'connect', 'hire', 'message', 'approach', 'dm', 'collab', 'linkedin', 'github', 'instagram'],
    ans: `How to reach Prajwal 📬<br><br>
📧 <b>Email:</b> <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a><br>
💼 <b>LinkedIn:</b> <a href="https://www.linkedin.com/in/prajwal-sharma-015b98296" target="_blank" style="color:#5cb4ff">linkedin.com/in/prajwal-sharma-015b98296</a><br>
🐙 <b>GitHub:</b> <a href="https://github.com/PrajwalSharma08" target="_blank" style="color:#c8a0ff">github.com/PrajwalSharma08</a><br>
📷 <b>Instagram:</b> <a href="https://instagram.com/ps_artist_661" target="_blank" style="color:#c8a0ff">@ps_artist_661</a><br><br>
Open to <b>internships, freelance, and collaborations</b>! Email or LinkedIn works best. 🚀`
  },
  {
    keys: ['resume', 'cv', 'download', 'pdf', 'biodata'],
    ans: `Prajwal's resume is right here! 📄<br><br>
• Click the <b>📄 Resume icon in the dock</b> (bottom bar)<br>
• Or scroll to the bottom of the window for the <b>"Download PDF" button</b><br><br>
Covers: Education · Skills · Projects · Internship · Hackathons · Certificates.`
  },
  {
    keys: ['available', 'opportunity', 'seeking', 'looking', 'freelance', 'remote', 'hire', 'employ', 'recruit', 'fresher'],
    ans: `Prajwal is <b>actively open to opportunities</b> 🚀<br><br>
✅ Internships — UI/UX, Python, Web Dev, AI/ML<br>
✅ Freelance — Design, branding, web development<br>
✅ Collaborations — Creative + tech projects<br>
✅ Remote work — Available worldwide<br><br>
🗓️ Graduating in <b>2026</b> — perfect time for pre-placement or intern roles!<br>
📧 <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`
  },
  {
    keys: ['location', 'city', 'place', 'india', 'prayagraj', 'allahabad', 'uttar', 'pradesh', 'based', 'where'],
    ans: `Prajwal is from <b>Prayagraj, Uttar Pradesh, India</b> 🇮🇳<br><br>
Currently studying at BBS College there. Available for:<br>
• 🏠 On-site roles in UP / nearby cities<br>
• 🌐 Remote work — anywhere in the world<br>
• ✈️ Relocation for the right opportunity`
  },
  {
    keys: ['experience', 'background', 'work experience', 'career', 'history', 'summary', 'profile'],
    ans: `Prajwal's Experience Summary 📋<br><br>
🐍 <b>Python Intern — CodSoft</b><br>Scripting projects, Python fundamentals<br><br>
🎤 <b>Head Coordinator — Nova Fest (BBS College)</b><br>Full design, branding & event coordination<br><br>
🥈 <b>Finalist — Yukti Hackathon 2024 (AKTU)</b><br>TradeSight AI — fintech brand + Python backend<br><br>
🚀 <b>Top 5K/25K — Lovable Global Hackathon</b><br>Top 20% worldwide!`
  },
  {
    keys: ['strength', 'strong', 'speciality', 'unique', 'different', 'stand out', 'best at', 'good at'],
    ans: `Prajwal's biggest strengths 💪<br><br>
🎨 <b>Design + Dev combo</b> — Can design beautiful UIs AND build them. Rare!<br>
✏️ <b>Artist's eye</b> — Years of pencil art = exceptional visual sensitivity<br>
🧠 <b>End-to-end thinker</b> — From brand identity to working prototype<br>
⚡ <b>Fast learner</b> — Most skills are self-taught<br>
🤝 <b>Team leader</b> — Proven at Nova Fest and multiple hackathons`
  },
  {
    keys: ['goal', 'aim', 'dream', 'future', 'aspiration', 'plan', 'career goal', 'ambition', 'vision'],
    ans: `Prajwal's career goals 🎯<br><br>
🎨 Become a <b>full-stack product designer</b> — design AND build, end to end<br>
🤖 Go deeper into <b>AI/ML engineering</b> — especially AI-powered design tools<br>
🌐 Build products that blend <b>art + technology</b> meaningfully<br>
🚀 Work at a startup or tech company where design has real impact<br><br>
Long-term dream: Found his own <b>design-led tech studio</b> 🏢`
  },
  // Identity — lowest priority (only when nothing else matches)
  {
    keys: ['who', 'name', 'yourself', 'introduce', 'about', 'describe'],
    ans: `Hi! I'm <b>Prajwal Sharma</b> 👋<br><br>
B.Tech CSE student at BBS College, Prayagraj (2022–2026).<br><br>
🎨 <b>UI/UX Designer</b> — premium digital interfaces<br>
✏️ <b>Visual Artist</b> — self-taught pencil portraiture<br>
🐍 <b>Python Developer</b> — scripting, AI/ML, web backends<br>
🌐 <b>Web Developer</b> — HTML, CSS, JavaScript<br><br>
Ask me about his <b>skills, projects, certificates, experience, or goals!</b>`
  },
];

// ── 8. Find best-matching answer ─────────────────────
function getAnswer(q) {
  const tokens = tokenize(q);
  if (!tokens.length) {
    return `Please ask me something! Try:<br><i>"What are his skills?"</i> or <i>"Tell me about VIPER"</i> 😊`;
  }
  let best = null, bestScore = 0;
  for (const entry of KB) {
    const s = scoreEntry(entry, tokens);
    if (s > bestScore) { bestScore = s; best = entry; }
  }
  if (best && bestScore >= 0.07) return best.ans;
  return `Hmm, I'm not sure about that! 🤔<br><br>
Try asking things like:<br>
• <i>"What are his skills?"</i><br>
• <i>"Tell me about the VIPER project"</i><br>
• <i>"Is he doing any internship?"</i><br>
• <i>"What are his hobbies?"</i><br>
• <i>"How can I contact him?"</i><br>
• <i>"What are his career goals?"</i><br><br>
Or email directly: <a href="mailto:manjumanoj1177@gmail.com" style="color:#c8a0ff">manjumanoj1177@gmail.com</a>`;
}
