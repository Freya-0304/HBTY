/* ============================================================
   《小羊老师向前冲》交互脚本
   导航 / 档案 / 学习提分 / 猜单词 / 岔路口 / 弹窗
   ============================================================ */

const ORDER = [
  'cover',
  'profile',
  'l1-title',
  'l1-story1',
  'l1-game',
  'l1-achieve',
  'l1-story2',
  'l2-title',
  'l2-story1',
  'l2-game',
  'l2-korean',
  'l2-story2',
  'l3-title',
  'l3-story1',
  'l3-game',
  'l3-poem-en',
  'l3-poem-cn',
  'final'
];

let current = 0;
const screens = {};
ORDER.forEach(k => { screens[k] = document.querySelector('.screen[data-screen="'+k+'"]'); });

function showScreen(i){
  document.querySelectorAll('.screen.is-active').forEach(s => {
    s.classList.remove('is-active');
  });
  current = Math.max(0, Math.min(i, ORDER.length-1));
  const el = screens[ORDER[current]];
  if(el) el.classList.add('is-active');
}

function next(){ showScreen(current + 1); }

/* ---------- 弹窗 ---------- */
function openModal(id){
  const m = document.getElementById(id);
  if(m) m.classList.add('is-open');
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m) m.classList.remove('is-open');
}
document.querySelectorAll('.modal [data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const m = btn.closest('.modal');
    if(m) m.classList.remove('is-open');
    next();
  });
});
// 点遮罩也可关闭（但不推进，避免误触跳关）
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if(e.target === m) m.classList.remove('is-open'); });
});

/* ---------- 导航按钮 ---------- */
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => {
    const scr = btn.closest('.screen');
    const key = scr ? scr.dataset.screen : '';
    if(key === 'l1-story2'){ openModal('modalL1'); return; }
    if(key === 'l2-story2'){ openModal('modalL2'); return; }
    if(key === 'l3-poem-cn'){ openModal('modalL3'); return; }
    if(key === 'l1-game'){ if(studyTotal >= 380) openModal('modalExam'); else shakeTotal(); return; }
    next();
  });
});

/* ---------- 档案编辑 ---------- */
document.querySelectorAll('[data-edit]').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.profile__row');
    const val = row.querySelector('.profile__value');
    const cur = val.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = cur;
    input.className = 'profile__input';
    val.replaceWith(input);
    input.focus();
    const commit = () => {
      const span = document.createElement('span');
      span.className = 'profile__value';
      span.dataset.field = btn.dataset.edit;
      span.textContent = input.value.trim() || cur;
      input.replaceWith(span);
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => { if(e.key === 'Enter'){ commit(); } });
  });
});

/* ============================================================
   游戏一 · 学习提分
   ============================================================ */
const studyScores = [80, 80, 80];
let studyTotal = 240;
let examPopped = false;

function refreshStudy(){
  studyTotal = studyScores.reduce((a,b)=>a+b, 0);
  document.querySelectorAll('.study__card').forEach((card, i) => {
    card.querySelector('.study__num').textContent = studyScores[i];
  });
  document.getElementById('studyTotal').textContent = studyTotal + ' / 450';
  const pct = Math.min(100, studyTotal / 450 * 100);
  document.getElementById('studyFill').style.width = pct + '%';
}

document.querySelectorAll('[data-study]').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.study__card');
    const i = +card.dataset.subject;
    const gain = 8 + Math.floor(Math.random() * 8); // 8~15
    studyScores[i] = Math.min(150, studyScores[i] + gain);
    refreshStudy();
    // 数字跳动
    const num = card.querySelector('.study__num');
    num.style.transform = 'scale(1.25)';
    setTimeout(() => num.style.transform = '', 160);

    if(!examPopped && studyTotal >= 380){
      examPopped = true;
      setTimeout(() => openModal('modalExam'), 420);
    }
  });
});

function shakeTotal(){
  const t = document.querySelector('.study__total');
  t.classList.add('shake');
  document.getElementById('studyTotal').textContent = '还不够哦，再刷几分！总分需 380/450';
  setTimeout(() => {
    t.classList.remove('shake');
    refreshStudy();
  }, 1400);
}

/* ============================================================
   游戏二 · 猜单词（选择题）
   ============================================================ */
const WORDS = [
  { ko:'최상의',   a:'最好' },
  { ko:'여정',     a:'旅程' },
  { ko:'성장하는', a:'成长' },
  { ko:'포옹',     a:'拥抱' },
  { ko:'고향',     a:'故乡' },
  { ko:'미래',     a:'未来' },
  { ko:'멋진',     a:'精彩' },
  { ko:'믿다',     a:'相信' }
];
let quizIdx = 0;
const quizOptionsEl = document.getElementById('quizOptions');
const quizWordEl = document.getElementById('quizWord');
const quizProgressEl = document.getElementById('quizProgress');
const quizDoneBtn = document.getElementById('quizDone');

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function buildQuiz(){
  const w = WORDS[quizIdx];
  quizWordEl.textContent = w.ko;
  quizProgressEl.textContent = (quizIdx+1) + ' / ' + WORDS.length;
  quizOptionsEl.innerHTML = '';
  // 干扰项：从其它词的答案里抽 3 个
  const others = WORDS.filter(x => x.ko !== w.ko).map(x => x.a);
  const opts = shuffle([w.a, ...shuffle(others).slice(0,3)]);
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'quiz__opt';
    b.textContent = o;
    b.addEventListener('click', () => onQuizPick(b, o, w));
    quizOptionsEl.appendChild(b);
  });
}

function onQuizPick(btn, picked, w){
  if(picked === w.a){
    btn.classList.add('is-right');
    // 禁用其它选项
    quizOptionsEl.querySelectorAll('.quiz__opt').forEach(x => x.disabled = true);
    setTimeout(() => {
      quizIdx++;
      if(quizIdx >= WORDS.length){
        quizDoneBtn.classList.remove('is-hidden');
        quizWordEl.textContent = '全部答对啦！';
        quizOptionsEl.innerHTML = '';
        quizProgressEl.textContent = 'PERFECT!';
      } else {
        buildQuiz();
      }
    }, 620);
  } else {
    btn.classList.add('is-wrong');
    btn.disabled = true;
    setTimeout(() => btn.classList.remove('is-wrong'), 420);
  }
}
buildQuiz();

/* ============================================================
   游戏三 · 岔路口（人迹更少的路）
   ============================================================ */
const FORKS = [
  { q:'高考在即，你的选择是？',
    a:'走出小城', b:'留在家乡',
    r:'你选择了远方，从此故乡只剩冬夏。' },
  { q:'面对唯一的升学机会，你决定？',
    a:'放手一搏', b:'顺其自然',
    r:'你把命运的缰绳，紧紧攥在了自己手里。' },
  { q:'有机会一个人去韩国交换，你会？',
    a:'一个人出发', b:'留在熟悉的地方',
    r:'世界自此，在你脚下缓缓铺开。' },
  { q:'毕业路口，众人都在求安稳，你会？',
    a:'走人迹更少的那条路', b:'走上安稳的轨道',
    r:'你选了人迹更少的一条路，从此决定一生的道路。' }
];
let forkIdx = 0;
const forkBox = document.getElementById('forkBox');
const forkQ = document.getElementById('forkQ');
const forkBtns = document.getElementById('forkBtns');
const forkReply = document.getElementById('forkReply');

function buildFork(){
  const f = FORKS[forkIdx];
  forkQ.textContent = f.q;
  forkReply.textContent = '';
  forkReply.classList.remove('is-show');
  forkBtns.innerHTML = '';
  [f.a, f.b].forEach(txt => {
    const b = document.createElement('button');
    b.className = 'fork__btn';
    b.textContent = txt;
    b.addEventListener('click', () => pickFork(b, f));
    forkBtns.appendChild(b);
  });
}

function pickFork(btn, f){
  forkBtns.querySelectorAll('.fork__btn').forEach(x => x.disabled = true);
  btn.classList.add('is-picked');
  forkReply.textContent = f.r;
  forkReply.classList.add('is-show');
  setTimeout(() => {
    forkIdx++;
    if(forkIdx >= FORKS.length){
      // 汇聚
      forkQ.textContent = '每一条路，都是你走出来的路。';
      forkBtns.innerHTML = '';
      forkReply.textContent = '你走的是 —— 人迹更少的一条路。';
      forkReply.classList.add('is-show');
      setTimeout(() => next(), 1800);
    } else {
      buildFork();
    }
  }, 1400);
}
buildFork();

/* ============================================================
   烟花（中山大学录取屏）
   ============================================================ */
(function initFireworks(){
  const canvas = document.getElementById('fireworks');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const achv = document.querySelector('.screen[data-screen="l1-achieve"]');
  let W = 0, H = 0;
  function resize(){
    W = canvas.width = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const parts = [];
  const colors = ['#e3b02c','#c77b5e','#2e8b57','#4f90a5','#e88a6a','#d98fb0','#c0392b','#f2a541'];

  function burst(x, y){
    const n = 36 + Math.floor(Math.random() * 28);
    const color = colors[Math.floor(Math.random() * colors.length)];
    for(let i = 0; i < n; i++){
      const a = Math.random() * Math.PI * 2;
      const sp = 0.8 + Math.random() * 3.8;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        decay: 0.006 + Math.random() * 0.014,
        color
      });
    }
  }

  function frame(){
    requestAnimationFrame(frame);
    const active = achv && achv.classList.contains('is-active');
    if(active && parts.length < 320 && Math.random() < 0.12){
      burst(W * (0.16 + Math.random() * 0.68), H * (0.2 + Math.random() * 0.35));
    }
    ctx.clearRect(0, 0, W, H);
    for(let i = parts.length - 1; i >= 0; i--){
      const p = parts[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.035;
      p.vx *= 0.99; p.vy *= 0.99;
      p.life -= p.decay;
      if(p.life <= 0){ parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  frame();
})();

/* ---------- 初始刷新 ---------- */
refreshStudy();
showScreen(0);
