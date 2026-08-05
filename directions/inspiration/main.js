/* Lauzon Music — Direction: Inspiration
   GSAP + ScrollTrigger. All motion disabled under prefers-reduced-motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined';

  if (hasGsap && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Header: compact on scroll ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-compact', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      if (open) {
        mobileNav.removeAttribute('data-open');
        mobileNav.hidden = true;
      } else {
        mobileNav.hidden = false;
        mobileNav.setAttribute('data-open', '');
      }
    });
  }

  /* ---------- Mega menu (Brands) ---------- */
  var megaWrap = document.querySelector('[data-mega]');
  if (megaWrap) {
    var megaBtn = megaWrap.querySelector('.nav-mega-btn');
    var megaPanel = megaWrap.querySelector('.mega');
    var closeTimer = null;

    var openMega = function () {
      clearTimeout(closeTimer);
      megaPanel.hidden = false;
      megaBtn.setAttribute('aria-expanded', 'true');
      if (hasGsap && !reduceMotion) {
        gsap.fromTo(megaPanel, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power3.out' });
      }
    };
    var closeMega = function () {
      megaBtn.setAttribute('aria-expanded', 'false');
      if (hasGsap && !reduceMotion) {
        gsap.to(megaPanel, {
          autoAlpha: 0, y: -8, duration: 0.18, ease: 'power2.in',
          onComplete: function () { megaPanel.hidden = true; gsap.set(megaPanel, { clearProps: 'all' }); }
        });
      } else {
        megaPanel.hidden = true;
      }
    };

    megaBtn.addEventListener('click', function () {
      var open = megaBtn.getAttribute('aria-expanded') === 'true';
      if (open) { closeMega(); } else { openMega(); }
    });
    megaWrap.addEventListener('mouseenter', openMega);
    megaWrap.addEventListener('mouseleave', function () {
      closeTimer = setTimeout(closeMega, 180);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && megaBtn.getAttribute('aria-expanded') === 'true') {
        closeMega();
        megaBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (megaBtn.getAttribute('aria-expanded') === 'true' && !megaWrap.contains(e.target)) {
        closeMega();
      }
    });
  }

  /* ---------- Hotspot pins ---------- */
  var pins = document.querySelectorAll('.pin');
  pins.forEach(function (pin) {
    var card = document.getElementById(pin.getAttribute('aria-controls'));
    if (!card) return;

    var showCard = function () {
      pin.setAttribute('aria-expanded', 'true');
      card.hidden = false;
      if (hasGsap && !reduceMotion) {
        gsap.fromTo(card, { autoAlpha: 0, scale: 0.95, y: 6 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.28, ease: 'power3.out' });
      }
    };
    var hideCard = function () {
      pin.setAttribute('aria-expanded', 'false');
      if (hasGsap && !reduceMotion) {
        gsap.to(card, {
          autoAlpha: 0, scale: 0.97, duration: 0.16, ease: 'power2.in',
          onComplete: function () { card.hidden = true; gsap.set(card, { clearProps: 'all' }); }
        });
      } else {
        card.hidden = true;
      }
    };

    pin.addEventListener('click', function () {
      var open = pin.getAttribute('aria-expanded') === 'true';
      // Close any other open pin card first
      pins.forEach(function (other) {
        if (other !== pin && other.getAttribute('aria-expanded') === 'true') {
          var otherCard = document.getElementById(other.getAttribute('aria-controls'));
          other.setAttribute('aria-expanded', 'false');
          if (otherCard) otherCard.hidden = true;
        }
      });
      if (open) { hideCard(); } else { showCard(); }
    });
  });

  /* ---------- Category tabber ---------- */
  var tabber = document.querySelector('[data-tabber]');
  if (tabber) {
    var tabs = Array.prototype.slice.call(tabber.querySelectorAll('.tabber-tab'));
    var panels = Array.prototype.slice.call(tabber.querySelectorAll('.tabber-panel'));

    var activate = function (tab) {
      var targetPanel = document.getElementById(tab.getAttribute('aria-controls'));
      if (!targetPanel || targetPanel.classList.contains('is-active')) return;
      var current = tabber.querySelector('.tabber-panel.is-active');

      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      });

      var reveal = function () {
        panels.forEach(function (p) {
          var active = p === targetPanel;
          p.classList.toggle('is-active', active);
          p.hidden = !active;
        });
        if (hasGsap && !reduceMotion) {
          gsap.fromTo(targetPanel.querySelector('.tabber-media'),
            { autoAlpha: 0, scale: 1.02 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
          gsap.fromTo(targetPanel.querySelectorAll('.tabber-side > *'),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.07, delay: 0.08,
              onComplete: function () { gsap.set(targetPanel.querySelectorAll('.tabber-side > *'), { clearProps: 'all' }); } });
        }
      };

      if (hasGsap && !reduceMotion && current) {
        gsap.to(current, { autoAlpha: 0, duration: 0.15, ease: 'power2.in',
          onComplete: function () { gsap.set(current, { clearProps: 'all' }); reveal(); } });
      } else {
        reveal();
      }
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(tab); });
      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 :
                  e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        activate(next);
      });
    });
  }

  /* ---------- PDP: gallery thumbs ---------- */
  var mainImg = document.querySelector('.gallery-main img');
  var thumbs = document.querySelectorAll('.thumb[data-full]');
  if (mainImg && thumbs.length) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
        thumb.setAttribute('aria-pressed', 'true');
        var swap = function () {
          mainImg.src = thumb.getAttribute('data-full');
          var thumbImg = thumb.querySelector('img');
          if (thumbImg) mainImg.alt = thumbImg.alt;
        };
        if (hasGsap && !reduceMotion) {
          gsap.to(mainImg, { autoAlpha: 0, duration: 0.14, ease: 'power2.in', onComplete: function () {
            swap();
            gsap.to(mainImg, { autoAlpha: 1, duration: 0.3, ease: 'power3.out' });
          }});
        } else {
          swap();
        }
      });
    });
  }

  /* ---------- PDP: buy-box accordions ---------- */
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      var mark = btn.querySelector('.acc-mark');
      if (mark) mark.textContent = open ? '+' : '−';
      if (open) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
        if (hasGsap && !reduceMotion) {
          gsap.fromTo(panel.querySelector('.acc-panel-inner'),
            { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power3.out' });
        }
      }
    });
  });

  /* ---------- PDP: read more ---------- */
  var provToggle = document.querySelector('.prov-toggle');
  var provMore = document.getElementById('prov-more');
  if (provToggle && provMore) {
    provToggle.addEventListener('click', function () {
      var open = provToggle.getAttribute('aria-expanded') === 'true';
      provToggle.setAttribute('aria-expanded', String(!open));
      provMore.hidden = open;
      provToggle.querySelector('.text-link-label').textContent = open ? 'Read the full story' : 'Read less';
      if (!open && hasGsap && !reduceMotion) {
        gsap.fromTo(provMore, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
      }
    });
  }

  /* ---------- Collection: filter tray + chips (visual only) ---------- */
  var filterOpen = document.querySelector('.filter-open');
  var filterTray = document.getElementById('filter-tray');
  if (filterOpen && filterTray) {
    filterOpen.addEventListener('click', function () {
      var open = filterOpen.getAttribute('aria-expanded') === 'true';
      filterOpen.setAttribute('aria-expanded', String(!open));
      filterTray.hidden = open;
      if (!open && hasGsap && !reduceMotion) {
        gsap.fromTo(filterTray.querySelectorAll('.tray-group'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out', stagger: 0.05,
            onComplete: function () { gsap.set(filterTray.querySelectorAll('.tray-group'), { clearProps: 'all' }); } });
      }
    });
  }
  document.querySelectorAll('.chip-toggle').forEach(function (chip) {
    chip.addEventListener('click', function () {
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ---------- Signup: prevent demo submit ---------- */
  document.querySelectorAll('.signup-form').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  /* ---------- Motion (GSAP) ---------- */
  if (!hasGsap || reduceMotion) return;

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    /* Hero entrance (homepage) */
    if (document.querySelector('.hero')) {
      var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-line', { yPercent: 60, autoAlpha: 0, duration: 0.7, stagger: 0.09 });
      tl.from('.hero .eyebrow, .hero .lede, .hero .hero-ctas', {
        y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08
      }, '-=0.35');
      tl.from('.hero-figure', { autoAlpha: 0, scale: 0.985, duration: 0.8 }, 0.15);
      tl.from('.trustline', { autoAlpha: 0, y: 10, duration: 0.5 }, '-=0.3');
    }

    /* Entrance (PDP): gallery + buybox */
    if (document.querySelector('.pdp')) {
      gsap.from('.pdp [data-hero]', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' });
    }

    /* Entrance (collection): header block */
    if (document.querySelector('.coll-head')) {
      gsap.from('.coll-head > .wrap > *', { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.09, ease: 'power3.out' });
    }

    /* Scroll reveals */
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 86%',
      once: true,
      onEnter: function (els) {
        gsap.fromTo(els, { y: 26, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power3.out', stagger: 0.07, overwrite: true,
            onComplete: function () { gsap.set(els, { clearProps: 'transform,opacity,visibility' }); } });
      }
    });
    gsap.set('[data-reveal]', { autoAlpha: 0 });
    ScrollTrigger.refresh();

    /* Hero image slow parallax */
    var heroMediaImg = document.querySelector('.hero-media img');
    if (heroMediaImg) {
      gsap.to(heroMediaImg, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    /* Card hover: lift + image scale */
    document.querySelectorAll('.card').forEach(function (card) {
      var img = card.querySelector('.card-media img');
      card.addEventListener('mouseenter', function () {
        gsap.to(card, { y: -6, duration: 0.3, ease: 'power2.out' });
        if (img) gsap.to(img, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
        if (img) gsap.to(img, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

    /* Pin idle pulse (subtle, transform-only) */
    document.querySelectorAll('.pin').forEach(function (pin, i) {
      gsap.to(pin, {
        scale: 1.08, duration: 1.2, yoyo: true, repeat: -1,
        ease: 'sine.inOut', delay: i * 0.2
      });
    });

    return function () {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    };
  });

})();
