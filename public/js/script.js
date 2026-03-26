/* ============================================
   TCC TEXAS — script.js
   ============================================ */

/* ── NAV: scroll shrink + mobile burger ── */
const navbar   = document.getElementById('navbar');
const burger   = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ── SCROLL REVEAL ─────────────────────── */
const reveals  = document.querySelectorAll('.reveal');
const revealOb = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      revealOb.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealOb.observe(el));

document.querySelectorAll('.service-card').forEach((card, i) => {
  card.style.transitionDelay = (i * 0.07) + 's';
});

/* ── QUOTE FORM SUBMISSION ─────────────── */
const form      = document.getElementById('quoteForm');
const submitBtn = document.getElementById('formSubmitBtn');
const btnText   = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const formMsg   = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = form.firstName.value.trim();
  const phone     = form.phone.value.trim();
  const service   = form.service.value;

  if (!firstName || !phone || !service) {
    showMsg('Please fill in all required fields.', 'error');
    return;
  }

  setLoading(true);
  hideMsg();

  const payload = {
    firstName,
    lastName : form.lastName.value.trim(),
    phone,
    email   : form.email.value.trim(),
    service,
    message : form.message.value.trim(),
  };

  try {
    const res  = await fetch('/api/quote', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showMsg("✅ Quote request sent! We'll call you within 24 hours.", 'success');
      form.reset();
    } else {
      showMsg(data.message || 'Something went wrong. Please call us directly.', 'error');
    }
  } catch (err) {
    showMsg('Network error. Please call us at (817) 925-3642.', 'error');
  } finally {
    setLoading(false);
  }
});

function setLoading(on) {
  submitBtn.disabled = on;
  btnText.hidden     = on;
  btnLoader.hidden   = !on;
}
function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className   = 'form-msg ' + type;
  formMsg.hidden      = false;
}
function hideMsg() { formMsg.hidden = true; }

/* ── SMOOTH SCROLL ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
