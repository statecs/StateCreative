/* State Creative — site.js
   Smooth scroll, entrance timeline, scroll reveals, statement word fill,
   marquee, header behaviour, page colour shift and the Stockholm clock. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Entrance: wait for fonts so lines don't reflow mid-animation ---------- */
  function ready() {
    void root.offsetWidth; // commit the hidden start state, then animate
    root.classList.add('is-ready');
  }
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1200); })]).then(ready);

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, // expo-out
      smoothWheel: true
    });
  }

  // Anchor links glide instead of jumping
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else if (target === 0) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Scroll reveals ---------- */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Page colour shift when contact takes over ---------- */
  var contact = $('#contact');
  if (contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        document.body.classList.toggle('is-dark', en.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -45% 0px' }).observe(contact);
  }

  /* ---------- Statement: split into words, fill as you scroll ---------- */
  var statement = $('.statement');
  var words = [];
  if (statement) {
    var text = statement.textContent.trim().split(/\s+/);
    statement.setAttribute('aria-label', text.join(' '));
    statement.innerHTML = text.map(function (w) {
      return '<span class="w" aria-hidden="true">' + w + '</span>';
    }).join(' ');
    words = $$('.w', statement);
  }

  /* ---------- Clock ---------- */
  var clock = $('.clock time');
  if (clock) {
    var fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm'
    });
    var tick = function () {
      var now = new Date();
      clock.textContent = fmt.format(now);
      clock.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 15000);
  }

  var year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Per-frame scroll effects ---------- */
  var header = $('.site-header');
  var hero = $('.hero');
  var heroEmblem = $('.hero-emblem');
  var rays = $('.emblem .rays');
  var track = $('.marquee-track');

  var lastY = window.scrollY;
  var marqueeX = 0;
  var marqueeW = 0;
  var velocity = 0;

  function measure() {
    if (track) marqueeW = track.scrollWidth / 2;
  }
  measure();
  window.addEventListener('resize', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  function frame(time) {
    if (lenis) lenis.raf(time);

    var y = lenis ? lenis.scroll : window.scrollY;
    var vh = window.innerHeight;
    var dy = y - lastY;
    lastY = y;
    velocity += (dy - velocity) * 0.1;

    // Header hides going down, returns going up
    if (header) {
      if (y > 120 && dy > 2) header.classList.add('is-hidden');
      else if (dy < -2 || y <= 120) header.classList.remove('is-hidden');
    }

    if (!reduceMotion) {
      // Hero emblem: gentle parallax + slow ray rotation
      if (hero && heroEmblem && y < vh * 1.2) {
        heroEmblem.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(2) + 'px,0)';
      }
      if (rays) rays.style.setProperty('--spin', (y * 0.04).toFixed(2) + 'deg');

      // Marquee drifts, speeds up with scroll velocity
      if (track && marqueeW) {
        marqueeX -= 0.5 + Math.min(Math.abs(velocity) * 0.35, 14);
        if (marqueeX <= -marqueeW) marqueeX += marqueeW;
        track.style.transform = 'translate3d(' + marqueeX.toFixed(2) + 'px,0,0)';
      }
    }

    // Statement fills word by word as it moves through the viewport
    if (words.length) {
      var r = statement.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      var lit = reduceMotion ? words.length : Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) {
        var on = i < lit;
        if (words[i]._on !== on) {
          words[i]._on = on;
          words[i].classList.toggle('on', on);
        }
      }
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
