/* ===========================
   PORTFOLIO JS — Khairunnisa
   =========================== */

// ─── TYPED TEXT ───────────────────────────────────


function typeLoop() {
  const current = phrases[phraseIdx];
  const speed = isDeleting ? 55 : 110;

  typedEl.textContent = isDeleting
    ? current.slice(0, charIdx--)
    : current.slice(0, ++charIdx);

  if (!isDeleting && charIdx === current.length) {
    setTimeout(() => { isDeleting = true; }, 1600);
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
  setTimeout(typeLoop, speed);
}
typeLoop();


// ─── NAVBAR SCROLL ────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('scroll-top').classList.toggle('visible', window.scrollY > 400);
});


// ─── HAMBURGER MENU ───────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});


// ─── PROJECT FILTER ───────────────────────────────
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? 'block' : 'none';
      if (show) {
        card.style.animation = 'fadeInUp 0.4s ease forwards';
      }
    });
  });
});


// ─── SCROLL REVEAL ────────────────────────────────
const revealEls = document.querySelectorAll(
  '.skill-category, .project-card, .timeline-item, .cert-card, .about-info-card, .contact-item'
);
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('reveal', 'revealed');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);
revealEls.forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});


// ─── SCROLL TO TOP ────────────────────────────────
document.getElementById('scroll-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ─── CUSTOM CURSOR ────────────────────────────────
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animCursor() {
    dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    requestAnimationFrame(animCursor);
  }
  animCursor();

  document.querySelectorAll('a, button, .project-card, .skill-category').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = ring.style.height = '50px';
      ring.style.borderColor = 'rgba(200,169,126,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = ring.style.height = '32px';
      ring.style.borderColor = 'rgba(200,169,126,0.5)';
    });
  });
}


// ─── CONTACT FORM (connects to backend API) ───────
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('submit-btn');
const btnText    = document.getElementById('btn-text');
const formStatus = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  btnText.textContent = '⏳ Mengirim...';
  submitBtn.disabled = true;
  formStatus.className = 'form-status';
  formStatus.style.display = 'none';

  const payload = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const res = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      formStatus.textContent = '✅ Pesan berhasil dikirim! Saya akan segera membalas.';
      formStatus.className   = 'form-status success';
      form.reset();
    } else {
      throw new Error(data.message || 'Server error');
    }
  } catch (err) {
    formStatus.textContent = `❌ Gagal mengirim: ${err.message}. Silakan hubungi via email langsung.`;
    formStatus.className   = 'form-status error';
  } finally {
    formStatus.style.display = 'block';
    btnText.textContent = 'Kirim Pesan 🚀';
    submitBtn.disabled = false;
  }
});


// ─── ACTIVE NAV LINK ON SCROLL ────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}`
      ? 'var(--accent)'
      : '';
  });
});


// ─── PARALLAX BG TEXT ─────────────────────────────
const bgText = document.querySelector('.hero-bg-text');
if (bgText) {
  window.addEventListener('scroll', () => {
    bgText.style.transform = `translate(-50%, calc(-50% + ${window.scrollY * 0.15}px))`;
  });
}


console.log('%c✨ Khairunnisa Portfolio', 'color: #c8a97e; font-size: 1.2rem; font-weight: bold;');
console.log('%cDibuat dengan HTML, CSS, JS + Node.js + MySQL', 'color: #7a7a99; font-size: 0.9rem;');
