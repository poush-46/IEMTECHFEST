/* 
  ==============================================================
   TechNova 2026 - script.js
   Vanilla JS only (no libraries)
   --------------------------------------------------------------
   TABLE OF CONTENTS
   1. Config & Helpers
   2. Preloader
   3. Custom Cursor + Magnetic Buttons
   4. Scroll Progress & Navbar
   5. Mobile Menu & Theme Toggle
   6. Digital Clocks
   7. Countdown Timer
   8. Scroll Reveal (IntersectionObserver)
   9. Parallax
   10. Animated Counters
   11. 3D Tilt + Ripple Effects
   12. Events Filter
   13. Schedule Tabs
   14. Gallery Lightbox
   15. FAQ Accordion
   16. Registration Form (validation + localStorage)
   17. Auth Modal (Login/Signup flip, strength, localStorage)
   18. Contact & Newsletter
   19. Back-to-Top + Toasts + Success Popup
   20. Particle Canvas
   21. Init
  ==============================================================
   HOW TO EDIT:
   - Change fest date: edit FEST_START_DATE below (ISO format)
   - Change fest name: HTML already has it; also update document.title if needed
   - Colors: style.css :root variables
  ==============================================================
*/

// ==================== 1. CONFIG & HELPERS ====================
/* ---- Fest Config: CHANGE THESE TO YOUR DATES ---- */
// Fest start: 12 Dec 2026, 09:00 AM IST — change this one line to update the countdown everywhere
const FEST_START_DATE = new Date('2026-12-12T09:00:00+05:30'); // IST
// If you want to test countdown ending soon, uncomment next line:
// const FEST_START_DATE = new Date(Date.now() + 1000*60*60*24*5 + 1000*60*31); // 5 days 31 mins from now

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* Throttle: limits function calls during scroll/mousemove for performance */
function throttle(fn, wait = 16) {
  let ticking = false, lastArgs;
  return function(...args) {
    lastArgs = args;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        fn.apply(this, lastArgs);
        ticking = false;
      });
    }
  };
}

/* Check prefers-reduced-motion */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;

/* Storage helpers (demo only, no backend) */
const STORAGE_KEYS = {
  theme: 'technova-theme',
  user: 'technova-user', // {name,email, remembered}
  registrations: 'technova-registrations' // array
};

// ==================== 2. PRELOADER ====================
window.addEventListener('load', () => {
  const preloader = $('#preloader');
  // Keep preloader visible at least 900ms for nice effect
  const minTime = 900;
  const start = performance.now();
  const elapsed = performance.now() - start;
  const delay = Math.max(0, minTime - elapsed);
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
    // Trigger hero 3D entrance after load
    document.body.classList.add('loaded');
  }, delay);
  // Allow scroll after load
  document.body.style.overflow = 'hidden';
  // Fallback: hide after 2.5s even if load stalls
  setTimeout(() => preloader.classList.add('hidden'), 2500);
});

// ==================== 3. CUSTOM CURSOR + MAGNETIC ====================
(function customCursor() {
  if (prefersReducedMotion || isTouchDevice) return; // off for a11y / touch

  const dot = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  document.addEventListener('mousemove', throttle((e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }, 8));

  // Smooth lag for ring
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state on interactive elements
  const hoverables = 'a, button, .event-card, .gallery-item, .faq-q, input, select, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover');
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
})();

// Magnetic hover for buttons with .magnetic
(function magneticButtons() {
  if (prefersReducedMotion || isTouchDevice) return;
  const magnetics = $$('.magnetic');
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Move button slightly toward cursor (magnetic)
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
})();

// Ripple effect on buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height) * 1.15;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

// ==================== 4. SCROLL PROGRESS & NAVBAR ====================
const navbar = $('#navbar');
const progressBar = $('#progress-bar');

function onScrollProgress() {
  const scrollY = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? (scrollY / docH) * 100 : 0;
  progressBar.style.width = pct + '%';

  // Navbar scrolled style
  if (scrollY > 10) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  // Back to top visibility
  const btt = $('#back-to-top');
  if (scrollY > 500) btt.classList.add('visible');
  else btt.classList.remove('visible');
}
window.addEventListener('scroll', throttle(onScrollProgress, 12), { passive: true });
onScrollProgress(); // initial

// Active link highlight via IntersectionObserver (observe sections)
(function activeNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();

// Smooth scroll for anchor links (native scroll-behavior does it, but we add close mobile menu)
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = $(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        closeMobileMenu();
      }
    }
  });
});

// ==================== 5. MOBILE MENU & THEME TOGGLE ====================
const hamburger = $('#hamburger');
const mobileMenu = $('#mobile-menu');
function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
}
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}
hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});
$$('.mobile-link').forEach(l => l.addEventListener('click', closeMobileMenu));
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target) && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  }
});

// Theme toggle (dark <-> light)
const themeBtn = $('#theme-toggle');
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
}
const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
if (savedTheme) applyTheme(savedTheme);
// also respect system preference on first visit
else if (window.matchMedia('(prefers-color-scheme: light)').matches) applyTheme('light');

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEYS.theme, next);
  showToast(`Switched to ${next} mode`, 'info');
});

// ==================== 6. DIGITAL CLOCKS ====================
/* Two clocks: navbar small + hero glass. Both update every second in IST */
function formatTime(date) {
  // Use IST (Asia/Kolkata) even if user is elsewhere, for fest consistency
  const optsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
  const optsDate = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' };
  // long date for hero
  const optsDateLong = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' };
  return {
    time: new Intl.DateTimeFormat('en-IN', optsTime).format(date),
    dateShort: new Intl.DateTimeFormat('en-IN', optsDate).format(date),
    dateLong: new Intl.DateTimeFormat('en-IN', optsDateLong).format(date)
  };
}
function tickClocks() {
  const now = new Date();
  const { time, dateShort, dateLong } = formatTime(now);
  const navTime = $('#clock-time');
  const navDate = $('#clock-date');
  const heroTime = $('#hero-clock-time');
  const heroDate = $('#hero-clock-date');
  if (navTime) navTime.textContent = time;
  if (navDate) navDate.textContent = dateShort;
  if (heroTime) heroTime.textContent = time;
  if (heroDate) heroDate.textContent = dateLong;
}
tickClocks();
setInterval(tickClocks, 1000);

// ==================== 7. COUNTDOWN TIMER ====================
/* Live countdown to FEST_START_DATE - updates every second */
function updateCountdown() {
  const now = new Date();
  let diff = FEST_START_DATE - now;

  const els = {
    days: $('#cd-days'),
    hours: $('#cd-hours'),
    mins: $('#cd-mins'),
    secs: $('#cd-secs')
  };
  if (!els.days) return;

  if (diff <= 0) {
    // Fest started!
    els.days.textContent = '00';
    els.hours.textContent = '00';
    els.mins.textContent = '00';
    els.secs.textContent = '00';
    const label = $('.countdown-label');
    if (label) label.innerHTML = '<i class="fas fa-rocket"></i> TechNova is LIVE!';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 1000 * 60 * 60;
  const mins = Math.floor(diff / (1000 * 60));
  diff -= mins * 1000 * 60;
  const secs = Math.floor(diff / 1000);

  els.days.textContent = String(days).padStart(2, '0');
  els.hours.textContent = String(hours).padStart(2, '0');
  els.mins.textContent = String(mins).padStart(2, '0');
  els.secs.textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ==================== 8. SCROLL REVEAL ====================
/* Reveal on scroll using IntersectionObserver - fade/slide/scale/flip classes */
(function scrollReveal() {
  if (prefersReducedMotion) {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
})();

// ==================== 9. PARALLAX ====================
/* Slow parallax on background orbs when scrolling */
(function parallax() {
  if (prefersReducedMotion || isTouchDevice) return;
  const orbs = $$('.orb');
  const heroVisual = $('.hero-visual');
  window.addEventListener('scroll', throttle(() => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.05 + i * 0.02;
      orb.style.transform = `translateY(${y * speed}px)`;
    });
    if (heroVisual) {
      heroVisual.style.transform = `translateY(${y * 0.06}px)`;
    }
  }, 20), { passive: true });
})();

// ==================== 10. ANIMATED COUNTERS ====================
/* Count up when scrolled into view - uses data-target, data-prefix, data-suffix */
(function counters() {
  const counters = $$('.stat-number');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString('en-IN') + suffix;
    };
    requestAnimationFrame(tick);
  };

  if (prefersReducedMotion) {
    counters.forEach(el => {
      const t = el.dataset.target, p = el.dataset.prefix||'', s = el.dataset.suffix||'';
      el.textContent = p + t + s;
    });
    return;
  }

  const ob = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        ob.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => ob.observe(c));
})();

// ==================== 11. 3D TILT + HOVER ====================
/* Tilt effect on cards that follows mouse - vanilla JS */
(function tiltCards() {
  if (prefersReducedMotion || isTouchDevice) return;
  const cards = $$('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = (x - centerX) / 14; // max ~14deg
      const rotateX = (centerY - y) / 14;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // Hero title 3D follow
  const title = $('.hero-title');
  if (title) {
    document.addEventListener('mousemove', throttle((e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10; // -5 to 5
      const y = (e.clientY / window.innerHeight - 0.5) * -8;
      title.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    }, 20));
  }
})();

// ==================== 12. EVENTS FILTER ====================
(function eventFilter() {
  const buttons = $$('.filter-btn');
  const cards = $$('.event-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('hidden', !show);
        // small stagger reveal
        if (show && !prefersReducedMotion) {
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        }
      });
    });
  });
})();

// ==================== 13. SCHEDULE TABS ====================
(function scheduleTabs() {
  const tabs = $$('.tab-btn');
  const timelines = $$('.timeline');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const day = tab.dataset.day;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
      timelines.forEach(tl => tl.classList.toggle('active', tl.id === 'timeline-' + day));
    });
  });
})();

// ==================== 14. GALLERY LIGHTBOX ====================
(function lightbox() {
  const grid = $('#gallery-grid');
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCaption = $('#lb-caption');
  const items = $$('.gallery-item');
  if (!grid || !lb || !items.length) return;

  // Build array of image data for navigation
  const galleryData = items.map(fig => {
    const img = fig.querySelector('img');
    return {
      src: img.src, // using picsum; for local files use data-src fallback
      // For real local images: use data-src if exists
      localSrc: img.getAttribute('data-src'),
      alt: img.alt,
      caption: fig.querySelector('figcaption')?.textContent.trim() || img.alt
    };
  });

  let current = 0;

  function openLightbox(index) {
    current = index;
    const data = galleryData[current];
    // Prefer local src if file exists? Use remote src for demo; swap to local if you have images
    // Try to use localSrc if you want - here we show whichever loads; we set src to remote for preview
    // To use local files, change to: lbImg.src = data.localSrc || data.src;
    lbImg.src = data.src;
    lbImg.alt = data.alt;
    lbCaption.textContent = data.caption;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function next(dir = 1) {
    current = (current + dir + galleryData.length) % galleryData.length;
    const data = galleryData[current];
    lbImg.src = data.src;
    lbImg.alt = data.alt;
    lbCaption.textContent = data.caption;
  }

  items.forEach((fig, i) => {
    fig.addEventListener('click', () => openLightbox(i));
    // keyboard accessibility
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Open image ' + (i+1));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  $('#lb-close').addEventListener('click', closeLightbox);
  $('#lb-prev').addEventListener('click', () => next(-1));
  $('#lb-next').addEventListener('click', () => next(1));
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') next(-1);
    if (e.key === 'ArrowRight') next(1);
  });

  // Touch swipe for mobile
  let startX = 0;
  lb.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) next(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

// ==================== 15. FAQ ACCORDION ====================
(function faq() {
  const items = $$('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Single open at a time (accordion)
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  // Open first by default
  if (items[0]) {
    items[0].classList.add('open');
    items[0].querySelector('.faq-q').setAttribute('aria-expanded', 'true');
  }
})();

// ==================== 16. REGISTRATION FORM ====================
(function registration() {
  const modal = $('#register-modal');
  const form = $('#register-form');
  const openBtns = [$('#btn-register-nav'), $('#btn-register-mobile'), $('#btn-hero-register'), ...$$('.event-register')];
  const successPopup = $('#success-popup');

  function openModal(prefillEvent = '') {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (prefillEvent) {
      const sel = $('#r-event');
      // Try to match option text containing event name
      [...sel.options].forEach(opt => {
        if (prefillEvent && opt.textContent.toLowerCase().includes(prefillEvent.toLowerCase())) {
          sel.value = opt.value;
        }
      });
    }
    // Focus first field
    setTimeout(() => $('#r-name')?.focus(), 100);
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const eventName = btn.dataset.event || btn.closest('[data-event]')?.dataset.event || '';
      openModal(eventName);
    });
  });
  // Event cards register buttons
  $$('.event-register').forEach(b => {
    b.addEventListener('click', () => {
      const card = b.closest('.event-card');
      openModal(card?.dataset.event || '');
    });
  });

  // Close handlers
  $$('[data-close="register"]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Validation helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  function setFieldState(group, state, msg = '') {
    // state: 'error' | 'success' | ''
    group.classList.remove('error', 'success');
    const err = group.querySelector('.error-msg');
    if (state === 'error') {
      group.classList.add('error');
      if (err) err.textContent = msg;
    } else if (state === 'success') {
      group.classList.add('success');
      if (err) err.textContent = '';
    } else {
      if (err) err.textContent = '';
    }
  }

  function validateField(input) {
    const group = input.closest('.form-group') || input.closest('.checkbox-group');
    const val = input.value.trim();
    const id = input.id;

    if (input.type === 'checkbox') {
      if (!input.checked) {
        setFieldState(group, 'error', 'You must accept the terms.');
        return false;
      } else {
        setFieldState(group, 'success');
        return true;
      }
    }

    if (input.hasAttribute('required') && !val) {
      setFieldState(group, 'error', 'This field is required.');
      return false;
    }
    if (id === 'r-name' && val.length > 0 && val.length < 3) {
      setFieldState(group, 'error', 'Name must be at least 3 characters.');
      return false;
    }
    if (id === 'r-email' && val && !emailRegex.test(val)) {
      setFieldState(group, 'error', 'Enter a valid email address.');
      return false;
    }
    if (id === 'r-phone' && val && !phoneRegex.test(val)) {
      setFieldState(group, 'error', 'Enter a valid 10-digit phone number.');
      return false;
    }
    if (id === 'r-college' && input.hasAttribute('required') && !val) {
      setFieldState(group, 'error', 'College name is required.');
      return false;
    }
    if (id === 'r-event' && input.hasAttribute('required') && !val) {
      setFieldState(group, 'error', 'Please select an event.');
      return false;
    }
    // If we reach here and field was required and filled, mark success
    if (val || input.type === 'select-one') {
      setFieldState(group, 'success');
    } else {
      setFieldState(group, '');
    }
    return true;
  }

  // Real-time validation
  const inputs = ['r-name','r-email','r-phone','r-college','r-dept','r-year','r-event','r-terms'].map(id => document.getElementById(id)).filter(Boolean);
  inputs.forEach(inp => {
    const evt = inp.type === 'checkbox' || inp.tagName === 'SELECT' ? 'change' : 'input';
    inp.addEventListener(evt, () => validateField(inp));
    // also validate on blur for better UX
    inp.addEventListener('blur', () => {
      if (inp.value.trim() !== '' || inp.type === 'checkbox' || inp.hasAttribute('required')) {
        validateField(inp);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    inputs.forEach(inp => {
      const ok = validateField(inp);
      if (!ok) valid = false;
    });

    if (!valid) {
      showToast('Please fix the highlighted fields.', 'error');
      // Shake modal slightly
      form.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 300, easing: 'ease-out' });
      return;
    }

    // Save to localStorage (demo)
    const data = {
      name: $('#r-name').value.trim(),
      email: $('#r-email').value.trim(),
      phone: $('#r-phone').value.trim(),
      college: $('#r-college').value.trim(),
      department: $('#r-dept').value,
      year: $('#r-year').value,
      event: $('#r-event').value,
      at: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.registrations) || '[]');
    existing.push(data);
    localStorage.setItem(STORAGE_KEYS.registrations, JSON.stringify(existing));

    closeModal();
    // Show success popup
    $('#success-msg').textContent = `Awesome, ${data.name}! You're registered for "${data.event}". A confirmation has been saved locally.`;
    $('#success-popup').classList.add('open');
    form.reset();
    inputs.forEach(inp => setFieldState(inp.closest('.form-group') || inp.closest('.checkbox-group'), ''));
    showToast('Registration successful! 🎉', 'success');
  });

  // Success popup close
  $('#success-close').addEventListener('click', () => {
    $('#success-popup').classList.remove('open');
  });
  $('#success-popup').addEventListener('click', (e) => {
    if (e.target === $('#success-popup')) $('#success-popup').classList.remove('open');
  });
})();

// ==================== 17. AUTH MODAL (Login / Signup) ====================
(function auth() {
  const modal = $('#auth-modal');
  const flip = $('#auth-flip');
  const loginForm = $('#login-form');
  const signupForm = $('#signup-form');

  function openAuth(mode = 'login') {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (mode === 'signup') flip.classList.add('flipped');
    else flip.classList.remove('flipped');
  }
  function closeAuth() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open buttons
  $('#btn-login')?.addEventListener('click', () => openAuth('login'));
  $('#btn-login-mobile')?.addEventListener('click', () => openAuth('login'));
  // Flip triggers
  $('#switch-to-signup')?.addEventListener('click', () => flip.classList.add('flipped'));
  $('#switch-to-login')?.addEventListener('click', () => flip.classList.remove('flipped'));

  $$('[data-close="auth"]').forEach(el => el.addEventListener('click', closeAuth));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeAuth();
  });

  // Show/hide password toggles
  $$('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = isPass ? '<i class="far fa-eye-slash"></i>' : '<i class="far fa-eye"></i>';
    });
  });

  // Password strength meter
  const sPass = $('#s-pass');
  const strengthBar = $('.strength-bar');
  const strengthLabel = $('.strength-label');
  if (sPass && strengthBar) {
    sPass.addEventListener('input', () => {
      const val = sPass.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;
      if (val.length >= 10) score++;

      strengthBar.classList.remove('weak','medium','strong');
      if (val.length === 0) {
        strengthLabel.textContent = 'Password strength';
      } else if (score <= 1) {
        strengthBar.classList.add('weak');
        strengthLabel.textContent = 'Weak';
      } else if (score === 2) {
        strengthBar.classList.add('medium');
        strengthLabel.textContent = 'Medium';
      } else {
        strengthBar.classList.add('strong');
        strengthLabel.textContent = 'Strong';
      }
    });
  }

  // Helpers for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setState(group, state, msg = '') {
    group.classList.remove('error','success');
    const err = group.querySelector('.error-msg');
    if (state === 'error') { group.classList.add('error'); if(err) err.textContent = msg; }
    else if (state === 'success') { group.classList.add('success'); if(err) err.textContent = ''; }
    else if(err) err.textContent = '';
  }

  // Login submit (demo: check localStorage if user exists, otherwise allow any valid)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#l-email');
    const pass = $('#l-pass');
    let ok = true;

    const eGroup = email.closest('.form-group');
    const pGroup = pass.closest('.form-group');

    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
      setState(eGroup, 'error', 'Enter a valid email.'); ok = false;
    } else setState(eGroup, 'success');

    if (!pass.value || pass.value.length < 6) {
      setState(pGroup, 'error', 'Password must be at least 6 characters.'); ok = false;
    } else setState(pGroup, 'success');

    if (!ok) { showToast('Fix login errors.', 'error'); return; }

    // Demo user check
    const users = JSON.parse(localStorage.getItem('technova-users') || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.value.trim().toLowerCase());
    // If found, check password; if not found, allow demo login (create session anyway)
    if (found && found.password !== pass.value) {
      setState(pGroup, 'error', 'Incorrect password.'); showToast('Incorrect password.', 'error'); return;
    }

    const name = found ? found.name : email.value.split('@')[0];
    const user = { name, email: email.value.trim(), remembered: $('#l-remember').checked };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    // Also remember email if checked
    if (user.remembered) localStorage.setItem('technova-remembered-email', user.email);
    else localStorage.removeItem('technova-remembered-email');

    updateAuthUI();
    closeAuth();
    showToast(`Welcome back, ${name}!`, 'success');
    loginForm.reset();
    // clear states
    $$('#login-form .form-group').forEach(g => setState(g, ''));
  });

  // Signup submit
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#s-name'), email = $('#s-email'), pass = $('#s-pass'), confirm = $('#s-confirm');
    let ok = true;

    const nGroup = name.closest('.form-group');
    const eGroup = email.closest('.form-group');
    const pGroup = pass.closest('.form-group');
    const cGroup = confirm.closest('.form-group');

    if (!name.value.trim() || name.value.trim().length < 3) { setState(nGroup, 'error', 'Name must be at least 3 characters.'); ok=false; } else setState(nGroup,'success');
    if (!emailRegex.test(email.value.trim())) { setState(eGroup,'error','Enter a valid email.'); ok=false; } else setState(eGroup,'success');
    if (!pass.value || pass.value.length < 6) { setState(pGroup,'error','Password must be at least 6 characters.'); ok=false; } else setState(pGroup,'success');
    if (confirm.value !== pass.value) { setState(cGroup,'error','Passwords do not match.'); ok=false; } else if (confirm.value) setState(cGroup,'success');

    // Check duplicate
    const users = JSON.parse(localStorage.getItem('technova-users') || '[]');
    if (users.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase())) {
      setState(eGroup,'error','An account with this email already exists. Try logging in.'); ok=false;
    }

    if (!ok) { showToast('Please fix signup errors.', 'error'); return; }

    const newUser = { name: name.value.trim(), email: email.value.trim().toLowerCase(), password: pass.value };
    users.push(newUser);
    localStorage.setItem('technova-users', JSON.stringify(users));

    // Auto login
    const user = { name: newUser.name, email: newUser.email, remembered: true };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    updateAuthUI();
    closeAuth();
    showToast(`Account created! Welcome, ${newUser.name}!`, 'success');
    signupForm.reset();
    strengthBar?.classList.remove('weak','medium','strong');
    if (strengthLabel) strengthLabel.textContent = 'Password strength';
    $$('#signup-form .form-group').forEach(g => setState(g, ''));
  });

  function updateAuthUI() {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    const authArea = $('#auth-area');
    const badge = $('#user-badge');
    const nameEl = $('#user-name');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        authArea.classList.add('hidden');
        badge.classList.remove('hidden');
        if (nameEl) nameEl.textContent = `Hi, ${u.name.split(' ')[0]}`;
      } catch {}
    } else {
      authArea.classList.remove('hidden');
      badge.classList.add('hidden');
    }
    // Prefill remembered email
    const remembered = localStorage.getItem('technova-remembered-email');
    if (remembered && $('#l-email')) $('#l-email').value = remembered;
  }
  updateAuthUI();

  // Logout
  $('#btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEYS.user);
    updateAuthUI();
    showToast('Logged out.', 'info');
  });

  // Expose for other modules
  window.__updateAuthUI = updateAuthUI;
})();

// ==================== 18. CONTACT & NEWSLETTER ====================
(function contactForms() {
  const cForm = $('#contact-form');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setState(group, state, msg='') {
    group.classList.remove('error','success');
    const err = group.querySelector('.error-msg');
    if (state==='error') { group.classList.add('error'); if(err) err.textContent = msg; }
    else if(state==='success'){ group.classList.add('success'); if(err) err.textContent=''; }
    else if(err) err.textContent='';
  }

  cForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#c-name'), email = $('#c-email'), msg = $('#c-message');
    let ok = true;
    if (!name.value.trim() || name.value.trim().length < 2) { setState(name.closest('.form-group'),'error','Enter your name.'); ok=false; } else setState(name.closest('.form-group'),'success');
    if (!emailRegex.test(email.value.trim())) { setState(email.closest('.form-group'),'error','Enter a valid email.'); ok=false; } else setState(email.closest('.form-group'),'success');
    if (!msg.value.trim() || msg.value.trim().length < 10) { setState(msg.closest('.form-group'),'error','Message should be at least 10 characters.'); ok=false; } else setState(msg.closest('.form-group'),'success');

    if (!ok) { showToast('Please fix contact form errors.', 'error'); return; }

    showToast('Message sent! We will reply within 6 hours.', 'success');
    cForm.reset();
    $$('#contact-form .form-group').forEach(g => setState(g, ''));
  });

  // Live inline validation
  ['c-name','c-email','c-message'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      if (id==='c-email' && el.value && !emailRegex.test(el.value.trim())) setState(el.closest('.form-group'),'error','Enter a valid email.');
      else if (el.value.trim()) setState(el.closest('.form-group'),'success');
    });
  });

  // Newsletter
  const nForm = $('#newsletter-form');
  nForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletter-email');
    const msgEl = $('#newsletter-msg');
    if (!emailRegex.test(email.value.trim())) {
      msgEl.textContent = 'Enter a valid email.'; msgEl.style.color = 'var(--danger)';
      showToast('Invalid email for newsletter.', 'error');
      return;
    }
    msgEl.textContent = 'Subscribed! Check your inbox.';
    msgEl.style.color = 'var(--success)';
    showToast('Subscribed to newsletter! 🎉', 'success');
    nForm.reset();
  });

  // Footer terms / privacy placeholders
  $('#footer-privacy')?.addEventListener('click', (e) => { e.preventDefault(); showToast('Privacy Policy: Demo placeholder.', 'info'); });
  $('#footer-terms')?.addEventListener('click', (e) => { e.preventDefault(); showToast('Terms & Conditions: Demo placeholder.', 'info'); });
  $('#view-terms')?.addEventListener('click', (e) => { e.preventDefault(); showToast('Terms: Be respectful, no plagiarism, college ID required.', 'info'); });
})();

// ==================== 19. BACK-TO-TOP + TOASTS + SUCCESS ====================
$('#back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

function showToast(message, type = 'info') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  // Auto remove after 3.5s
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, 3400);
}
window.showToast = showToast; // expose for inline use

// ==================== 20. PARTICLE CANVAS ====================
/* Lightweight particle field - vanilla canvas, no library. Respects reduced motion */
(function particles() {
  if (prefersReducedMotion) return;
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particlesArr = [];
  const COUNT = Math.min(90, Math.floor(window.innerWidth / 18)); // responsive count

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create particles
  for (let i = 0; i < COUNT; i++) {
    particlesArr.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.25
    });
  }

  let raf;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    // draw particles
    particlesArr.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      // wrap around
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      // subtle glow with shadow
      ctx.shadowColor = p.alpha > 0.5 ? 'rgba(139,92,246,0.6)' : 'rgba(6,182,214,0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    // draw faint connections
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particlesArr.length; i++) {
      for (let j = i + 1; j < particlesArr.length; j++) {
        const dx = particlesArr[i].x - particlesArr[j].x;
        const dy = particlesArr[i].y - particlesArr[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.globalAlpha = (1 - dist / 120) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particlesArr[i].x, particlesArr[i].y);
          ctx.lineTo(particlesArr[j].x, particlesArr[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }
  draw();

  // Pause when tab hidden for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });
})();

// ==================== 21. INIT & MISC ====================
// Lazy-load fallback: if browser doesn't support loading="lazy", IntersectionObserver could load, but modern browsers do.
// Keyboard: trap focus in modals could be added for stricter a11y - simplified here.

// Expose countdown update for manual date testing
window.__FEST_START_DATE = FEST_START_DATE;

// Log helpful hint for students in console
console.log(
  '%c🚀 TechNova 2026 - Dev Hints',
  'font-size:14px; font-weight:800; color:#8B5CF6;'
);
console.log('Change fest date in script.js -> FEST_START_DATE');
console.log('Change colors in style.css -> :root variables');
console.log('Images: replace /images/gallery1.jpg etc. and update <img> src in index.html');
console.log('GitHub Pages: Settings -> Pages -> Deploy from branch -> main / root');

