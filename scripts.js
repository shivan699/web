/* =========================================================
   Student Portal — Global JavaScript
   ========================================================= */

// ── SIDEBAR TOGGLE (mobile) ──
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Close on nav link click (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
}

// ── ACTIVE NAV HIGHLIGHTING ──
function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ── TOPBAR BELL CLICK ──
function initBell() {
  const bell = document.getElementById('topbarBell');
  if (bell) {
    bell.addEventListener('click', () => {
      showToast('You have 3 new notifications!', 'info');
    });
  }
}

// ── TOAST NOTIFICATION ──
let toastTimeout;
function showToast(message, type = 'success') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = `
      position:fixed; bottom:24px; right:24px;
      background:${type==='success'?'#16a34a':type==='error'?'#ef4444':'#2563eb'};
      color:#fff; padding:12px 22px; border-radius:10px;
      font-family:var(--font-main); font-size:14px; font-weight:600;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);
      z-index:9999; transform:translateY(80px); opacity:0;
      transition:all 0.3s cubic-bezier(0.4,0,0.2,1);
      display:flex; align-items:center; gap:8px;
    `;
    document.body.appendChild(toast);
  }
  const icons = { success: '✅', error: '❌', info: '🔔', warn: '⚠️' };
  toast.innerHTML = `${icons[type]||'ℹ️'} ${message}`;
  toast.style.background = type==='success'?'#16a34a':type==='error'?'#ef4444':type==='warn'?'#f59e0b':'#2563eb';
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
  }, 3500);
}

// ── ANIMATE NUMBERS ──
function animateNumber(el, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  const isDecimal = String(target).includes('.');
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── ANIMATE PROGRESS BARS ──
function animateProgressBars() {
  document.querySelectorAll('.progress-bar[data-width]').forEach(bar => {
    const width = bar.dataset.width;
    setTimeout(() => { bar.style.width = width + '%'; }, 300);
  });
}

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initActiveNav();
  initBell();
  animateProgressBars();

  // Animate stat numbers
  document.querySelectorAll('[data-count]').forEach(el => {
    animateNumber(el, parseFloat(el.dataset.count));
  });
});

/* =========================================================
   PAGE-SPECIFIC FUNCTIONS
   ========================================================= */

// ── APTITUDE TIMER ──
let timerInterval, timeLeft = 1800;
function startTimer() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;
  clearInterval(timerInterval);
  timeLeft = 1800;
  timerInterval = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    display.textContent = `${m}:${s}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showToast('Time is up! Test submitted.', 'warn');
      showResults();
    }
    if (timeLeft <= 300) display.style.color = '#ef4444';
  }, 1000);
  showToast('Timer started! 30 minutes.', 'info');
}

function stopTimer() {
  clearInterval(timerInterval);
  showToast('Timer paused.', 'warn');
}

// ── MCQ SELECTION ──
function selectOption(btn, isCorrect, questionId) {
  const parent = btn.closest('.question-card');
  if (parent.dataset.answered) return;
  parent.dataset.answered = '1';
  parent.querySelectorAll('.option-item').forEach(opt => {
    const optCorrect = opt.dataset.correct === 'true';
    if (optCorrect) opt.classList.add('correct');
    else if (opt === btn) opt.classList.add('wrong');
    opt.style.pointerEvents = 'none';
  });
  if (isCorrect) {
    showToast('Correct! 🎉', 'success');
  } else {
    showToast('Wrong answer. Keep practicing!', 'error');
  }
}

// ── SHOW RESULTS ──
let testScore = 0;
function showResults() {
  const correct = document.querySelectorAll('.option-item.correct').length;
  const total = document.querySelectorAll('.question-card').length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const resultSection = document.getElementById('resultSection');
  if (resultSection) {
    resultSection.classList.remove('hidden');
    resultSection.querySelector('.result-score').textContent = `${pct}%`;
    resultSection.querySelector('.result-detail').textContent = `${correct} / ${total} correct`;
    resultSection.scrollIntoView({ behavior: 'smooth' });
  }
  showToast(`Test completed! Score: ${pct}%`, pct >= 60 ? 'success' : 'warn');
}

// ── DSA CHALLENGE EXPAND ──
function toggleChallenge(el) {
  const detail = el.querySelector('.challenge-detail');
  const isOpen = detail && detail.style.maxHeight !== '0px' && detail.style.maxHeight !== '';
  document.querySelectorAll('.challenge-detail').forEach(d => { d.style.maxHeight = '0px'; d.style.overflow = 'hidden'; });
  if (detail && !isOpen) {
    detail.style.overflow = 'visible';
    detail.style.maxHeight = detail.scrollHeight + 'px';
  }
}

// ── INTERVIEW CARD REVEAL ──
function revealAnswer(card) {
  card.classList.toggle('revealed');
}

// ── MOCK INTERVIEW VOICE UI ──
let mockActive = false;
function startMockInterview() {
  const voiceUI = document.getElementById('voiceUI');
  const startBtn = document.getElementById('startInterviewBtn');
  if (!voiceUI || !startBtn) return;
  mockActive = !mockActive;
  if (mockActive) {
    voiceUI.classList.remove('hidden');
    startBtn.textContent = '⏹ Stop Interview';
    startBtn.classList.remove('btn-green');
    startBtn.classList.add('btn-danger');
    showToast('Mock interview started! Answer confidently.', 'success');
    showNextQuestion();
  } else {
    voiceUI.classList.add('hidden');
    startBtn.textContent = '🎤 Start Mock Interview';
    startBtn.classList.add('btn-green');
    startBtn.classList.remove('btn-danger');
    showToast('Interview ended. Great practice!', 'info');
  }
}

const mockQuestions = [
  "Tell me about yourself.",
  "What are your key technical skills?",
  "Explain OOP concepts with an example.",
  "What is a REST API?",
  "Describe a challenging project you worked on.",
  "Where do you see yourself in 5 years?",
  "What do you know about ServiceNow?",
];
let currentQ = 0;
function showNextQuestion() {
  const qDisplay = document.getElementById('currentQuestion');
  if (!qDisplay || !mockActive) return;
  qDisplay.textContent = mockQuestions[currentQ % mockQuestions.length];
  currentQ++;
}

// ── RESUME BUILDER ──
function generateResume() {
  const name = document.getElementById('rb-name')?.value || '';
  const email = document.getElementById('rb-email')?.value || '';
  const phone = document.getElementById('rb-phone')?.value || '';
  const skills = document.getElementById('rb-skills')?.value || '';
  const education = document.getElementById('rb-education')?.value || '';
  const projects = document.getElementById('rb-projects')?.value || '';
  const experience = document.getElementById('rb-experience')?.value || '';
  const summary = document.getElementById('rb-summary')?.value || '';

  if (!name.trim()) { showToast('Please enter your name.', 'error'); return; }

  const preview = document.getElementById('resumePreview');
  if (!preview) return;

  preview.innerHTML = `
    <div style="text-align:center; margin-bottom:20px; border-bottom:2px solid #1a2c3d; padding-bottom:16px;">
      <h2 style="font-size:26px; color:#1a2c3d; margin-bottom:4px; font-family:Georgia,serif;">${name}</h2>
      <p style="font-size:13px; color:#64748b;">${email}${phone ? ' • ' + phone : ''}</p>
    </div>
    ${summary ? `<div class="resume-section"><h3>PROFESSIONAL SUMMARY</h3><p>${summary}</p></div>` : ''}
    ${education ? `<div class="resume-section"><h3>EDUCATION</h3><p>${education.replace(/\n/g,'<br>')}</p></div>` : ''}
    ${skills ? `<div class="resume-section"><h3>SKILLS</h3><p>${skills.replace(/\n/g,'<br>')}</p></div>` : ''}
    ${experience ? `<div class="resume-section"><h3>EXPERIENCE</h3><p>${experience.replace(/\n/g,'<br>')}</p></div>` : ''}
    ${projects ? `<div class="resume-section"><h3>PROJECTS</h3><p>${projects.replace(/\n/g,'<br>')}</p></div>` : ''}
  `;
  preview.style.animation = 'none';
  requestAnimationFrame(() => { preview.style.animation = 'fadeUp 0.4s ease'; });
  showToast('Resume generated!', 'success');
  document.getElementById('downloadResumeBtn')?.classList.remove('hidden');
}

function downloadResume() {
  const preview = document.getElementById('resumePreview');
  if (!preview) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Resume</title><style>
    body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:20px;color:#1a2c3d;}
    h3{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin:18px 0 10px;}
    p{font-size:13.5px;color:#374151;line-height:1.7;}
  </style></head><body>${preview.innerHTML}</body></html>`);
  w.document.close(); w.print();
}

// ── RESUME SCANNER ──
function simulateScan() {
  const fileInput = document.getElementById('resumeFile');
  const scanArea = document.getElementById('scanResults');
  if (!scanArea) return;

  if (!fileInput?.files?.length) {
    showToast('Please upload a resume file first.', 'error');
    return;
  }

  const btn = document.getElementById('scanBtn');
  if (btn) { btn.textContent = '⏳ Scanning...'; btn.disabled = true; }

  setTimeout(() => {
    const score = Math.floor(Math.random() * 25) + 62; // 62–87
    scanArea.classList.remove('hidden');

    // Animate circle
    const circle = document.getElementById('atsCircle');
    const scoreEl = document.getElementById('atsScore');
    const deg = Math.round((score / 100) * 360);
    if (circle) circle.style.background = `conic-gradient(${score>=75?'#16a34a':score>=60?'#f59e0b':'#ef4444'} 0deg, ${score>=75?'#16a34a':score>=60?'#f59e0b':'#ef4444'} ${deg}deg, #e2e8f0 ${deg}deg)`;
    if (scoreEl) animateNumber(scoreEl, score);

    const bar = scanArea.querySelector('.progress-bar');
    if (bar) { setTimeout(() => { bar.style.width = score + '%'; }, 400); }

    if (btn) { btn.textContent = '🔍 Scan Resume'; btn.disabled = false; }
    showToast(`ATS Score: ${score}%`, score >= 75 ? 'success' : 'warn');
    scanArea.scrollIntoView({ behavior: 'smooth' });
  }, 2000);
}

// ── AI ASSISTANT CHATBOT ──
const botResponses = {
  hello: "Hello, Student! 👋 How can I help you today? I can assist with interview tips, resume advice, DSA problems, and more!",
  hi: "Hi there! 😊 Ready to ace your next interview? Ask me anything!",
  resume: "Great question! 📄 To improve your resume:\n• Tailor it to each job description\n• Quantify achievements (e.g., 'Built a system serving 1000+ users')\n• Keep it to 1 page for freshers\n• Add a strong skills section with relevant technologies\n• Highlight projects prominently",
  interview: "For interview success: 🎯\n• Practice STAR method for behavioral questions\n• Review core CS concepts: OOP, SQL, data structures\n• Research the company before going\n• Ask good questions at the end\n• Stay calm — take 2–3 seconds before answering",
  servicenow: "ServiceNow is a cloud-based platform! ☁️\n• Used for IT Service Management (ITSM) workflows\n• Key concepts: Tables, GlideRecord, Business Rules, Client Scripts, UI Policies\n• Popular certification: ServiceNow CSA (Certified System Administrator)\n• Great career choice with high demand in 2024–25!",
  job: "Job search tips: 💼\n• Apply consistently — at least 5–10 apps per day\n• Customize your resume for each role\n• Use LinkedIn and Naukri actively\n• Build projects to showcase on GitHub\n• Practice coding on LeetCode daily\n• Network with alumni and professionals",
  dsa: "For DSA preparation: 💻\n• Start with Arrays → Strings → Linked Lists → Trees → Graphs\n• Practice on LeetCode (easy first, then medium)\n• Learn time/space complexity for every solution\n• Common patterns: Two pointers, Sliding window, BFS/DFS\n• Solve at least 1–2 problems daily",
  sql: "SQL essentials for freshers: 🗄️\n• Master SELECT, WHERE, GROUP BY, ORDER BY, HAVING\n• Learn all JOIN types: INNER, LEFT, RIGHT, FULL OUTER\n• Practice subqueries and window functions\n• Know the difference between DELETE vs TRUNCATE\n• Practice on HackerRank SQL challenges",
  oops: "OOP Concepts simplified: 🔧\n• Encapsulation: bundling data + methods, hiding internals\n• Inheritance: child class gets parent's properties\n• Polymorphism: same method, different behaviours\n• Abstraction: showing only what's necessary\n• Remember: Class is blueprint, Object is instance",
  help: "I can help with: 🤖\n• Resume tips\n• Interview preparation\n• ServiceNow concepts\n• DSA practice tips\n• SQL queries\n• OOP concepts\n• Job search strategies\n\nJust type any topic!",
  default: [
    "That's a great question! Could you rephrase it? Try keywords like: resume, interview, servicenow, dsa, sql, oops, job 😊",
    "Hmm, I'm still learning! Try asking about: interview tips, resume help, or ServiceNow concepts.",
    "Interesting! For specific guidance, try typing: 'dsa', 'sql', 'oops', 'interview', or 'job'. I'll give you detailed tips! 🚀",
  ]
};

function getBotReply(msg) {
  const lower = msg.toLowerCase().trim();
  for (const key of Object.keys(botResponses)) {
    if (key !== 'default' && lower.includes(key)) {
      return botResponses[key];
    }
  }
  const defaults = botResponses.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function initChat() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const messagesArea = document.getElementById('chatMessages');
  if (!input || !sendBtn || !messagesArea) return;

  function addMessage(text, isUser = false) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user' : 'bot'}`;
    div.innerHTML = `
      <div class="message-avatar">${isUser ? 'S' : '🤖'}</div>
      <div>
        <div class="message-bubble">${text.replace(/\n/g, '<br>')}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.id = 'typingIndicator';
    div.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div>
        <div class="message-bubble">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      </div>
    `;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, true);
    input.value = '';
    addTypingIndicator();
    setTimeout(() => {
      document.getElementById('typingIndicator')?.remove();
      addMessage(getBotReply(msg), false);
    }, 1000 + Math.random() * 600);
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  // Quick suggestions
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      sendMessage();
    });
  });
}

// ── LOGIN FORM ──
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    if (!email || !pass) { showToast('Please fill in all fields.', 'error'); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '⏳ Logging in...';
    btn.disabled = true;
    setTimeout(() => {
      localStorage.setItem('studentLoggedIn', '1');
      localStorage.setItem('studentName', email.split('@')[0]);
      window.location.href = 'index.html';
    }, 1400);
  });
}

// Initialize all page-specific functions
document.addEventListener('DOMContentLoaded', () => {
  initChat();
  initLogin();
});