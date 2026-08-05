/* ==========================================================================
   LAUZON MUSIC — Direction D: HOUSE STYLE
   Motion dial: MEDIUM-LOW, matching the live site: GSAP + ScrollTrigger
   fade-up reveals, the word-by-word heritage statement scrub, continuous
   brand/ticker/heritage marquees, card hover lifts. All motion is
   transform/opacity/color only and fully disabled for prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Plain-JS UI (works without GSAP) ---------- */

  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Newsletter (inert prototype: confirm inline, no network)
  var signupForm = document.querySelector('.signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = signupForm.querySelector('.signup-note');
      var btn = signupForm.querySelector('button[type="submit"]');
      if (note) note.textContent = 'You are on the list. First Access starts with the next drop.';
      if (btn) { btn.textContent = 'Subscribed'; btn.setAttribute('disabled', ''); }
    });
  }

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Collection filter tray (styled UI, inert filtering)
  var trays = document.querySelectorAll('.filter-tray');
  document.querySelectorAll('.filter-chip[aria-controls]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var tray = document.getElementById(chip.getAttribute('aria-controls'));
      if (!tray) return;
      var isOpen = tray.classList.contains('is-open');
      trays.forEach(function (t) { t.classList.remove('is-open'); });
      document.querySelectorAll('.filter-chip[aria-controls]').forEach(function (c) {
        c.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        tray.classList.add('is-open');
        chip.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.querySelectorAll('.option-chip, .filter-chip--toggle').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    });
  });

  // Product gallery: thumbnail swap (crossfade via GSAP when available)
  var mainImg = document.querySelector('.gallery-main img');
  var thumbs = document.querySelectorAll('.thumb[data-full]');
  if (mainImg && thumbs.length) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var full = thumb.getAttribute('data-full');
        if (!full || full === mainImg.getAttribute('src')) return;
        thumbs.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
        thumb.setAttribute('aria-pressed', 'true');
        var alt = thumb.querySelector('img');
        var swap = function () {
          mainImg.setAttribute('src', full);
          if (alt) mainImg.setAttribute('alt', alt.getAttribute('alt') || mainImg.getAttribute('alt'));
        };
        if (window.gsap && !reducedMotion()) {
          window.gsap.to(mainImg, {
            autoAlpha: 0.25, duration: 0.14, ease: 'power1.out',
            onComplete: function () {
              swap();
              window.gsap.to(mainImg, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
            }
          });
        } else {
          swap();
        }
      });
    });
  }

  // Podcast wave bars (deterministic heights, no Math.random)
  var wave = document.querySelector('.podcast-wave');
  if (wave && !wave.childElementCount) {
    var heights = [12, 26, 40, 18, 34, 22, 44, 14, 30, 38, 20, 42, 16, 28, 36, 24, 40, 12, 32, 44, 18, 26, 38, 14];
    heights.forEach(function (h) {
      var bar = document.createElement('span');
      bar.style.height = h + 'px';
      wave.appendChild(bar);
    });
  }

  /* ---------- GSAP motion (skipped entirely without the CDN) ---------- */
  if (!window.gsap || !window.ScrollTrigger) return;
  if (document.hidden) {
    /* Loaded in a background tab: rAF is frozen and entrance tweens would
       strand content invisible. Stay fully static; reload clean when shown. */
    document.addEventListener('visibilitychange', function once() {
      if (!document.hidden) { document.removeEventListener('visibilitychange', once); window.location.reload(); }
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Sticky header compacts on scroll (class toggle; CSS handles the transition)
  ScrollTrigger.create({
    start: 60,
    end: 'max',
    toggleClass: { targets: '.site-header', className: 'is-compact' }
  });

  var mm = gsap.matchMedia();

  mm.add(
    {
      motionOK: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)'
    },
    function (context) {
      if (context.conditions.reduce) {
        // Static site. Everything stays visible; no tweens are created.
        return;
      }

      // Hero entrance: quick, quiet stagger on load
      var heroEls = gsap.utils.toArray('[data-hero]');
      if (heroEls.length) {
        gsap.set(heroEls, { autoAlpha: 0, y: 24 });
        gsap.to(heroEls, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.09,
          delay: 0.05,
          clearProps: 'transform'
        });
      }

      // Scroll reveals: fade-up, 70ms stagger, once
      var reveals = gsap.utils.toArray('[data-reveal]');
      if (reveals.length) {
        gsap.set(reveals, { autoAlpha: 0, y: 26 });
        ScrollTrigger.batch(reveals, {
          start: 'top 88%',
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.07,
              overwrite: true,
              clearProps: 'transform'
            });
          }
        });
        // Anything already past its trigger on load (e.g. deep-link) shows immediately
        ScrollTrigger.refresh();
      }

      // Continuous loops: scene ticker + brand rail (ticker duplicated in
      // markup, brands cloned here; -50% wrap for the seamless loop)
      function loop(trackSel, seconds) {
        var track = document.querySelector(trackSel);
        if (!track) return;
        var tween = gsap.to(track, { xPercent: -50, duration: seconds, ease: 'none', repeat: -1 });
        var host = track.parentElement;
        host.addEventListener('mouseenter', function () { tween.pause(); });
        host.addEventListener('mouseleave', function () { tween.play(); });
        return tween;
      }
      var brandsTrack = document.querySelector('.brands-track');
      if (brandsTrack && !brandsTrack.dataset.cloned) {
        brandsTrack.dataset.cloned = '1';
        Array.prototype.slice.call(brandsTrack.children).forEach(function (el) {
          var clone = el.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          brandsTrack.appendChild(clone);
        });
      }
      loop('.ticker-track', 26);
      loop('.brands-track', 36);

      // Heritage marquee: opposing continuous drift, matching the live site's
      // autoplay marquee (one row LTR / one RTL). Track content x3 in markup
      // + cloned once here for the seamless -50% wrap.
      document.querySelectorAll('.hm-track[data-marquee]').forEach(function (track) {
        if (!track.dataset.cloned) {
          track.dataset.cloned = '1';
          Array.prototype.slice.call(track.children).forEach(function (el) {
            track.appendChild(el.cloneNode(true));
          });
        }
        var dir = parseFloat(track.getAttribute('data-marquee')) || -1;
        if (dir > 0) {
          gsap.set(track, { xPercent: -50 });
          gsap.to(track, { xPercent: 0, duration: 48, ease: 'none', repeat: -1 });
        } else {
          gsap.to(track, { xPercent: -50, duration: 48, ease: 'none', repeat: -1 });
        }
      });

      // Heritage statement: word-by-word colour reveal on scroll — the live
      // site's signature move. Words start pale (data-bg-color) and fill to
      // ink (data-fg-color), scrubbed from top 80% -> top 30%.
      document.querySelectorAll('[data-reveal-type]').forEach(function (el) {
        if (!el.dataset.split) {
          el.dataset.split = '1';
          Array.prototype.slice.call(el.childNodes).forEach(function (node) {
            if (node.nodeType !== 3 || !node.textContent.trim()) return;
            var frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span');
              w.className = 'rv-word';
              w.textContent = part;
              frag.appendChild(w);
            });
            el.replaceChild(frag, node);
          });
        }
        gsap.fromTo(el.querySelectorAll('.rv-word'),
          { color: el.dataset.bgColor || '#D5DAE1' },
          {
            color: el.dataset.fgColor || '#272F3A',
            duration: 0.3,
            stagger: 0.02,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'top 30%',
              scrub: true
            }
          }
        );
      });

      return function () {
        gsap.set('[data-hero], [data-reveal]', { clearProps: 'all' });
      };
    }
  );

  // Card hover: lift -6px, image scale 1.03 (pointer: fine only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion()) {
    document.querySelectorAll('.card, .cat-card').forEach(function (card) {
      var lift = card.querySelector('.card-lift') || card;
      var img = card.querySelector('.card-media img, .cat-media img');
      card.addEventListener('mouseenter', function () {
        gsap.to(lift, { y: -6, duration: 0.25, ease: 'power2.out' });
        if (img) gsap.to(img, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(lift, { y: 0, duration: 0.3, ease: 'power2.out' });
        if (img) gsap.to(img, { scale: 1, duration: 0.35, ease: 'power2.out' });
      });
    });
  }
})();

/* Failsafe: never let entrance/reveal states strand content invisible
   (throttled rAF in hidden/background tabs freezes tweens mid-run). */
(function () {
  var SEL = '[data-hero],[data-reveal]';
  function rescue() {
    if (!window.gsap) return;
    document.querySelectorAll(SEL).forEach(function (el) {
      var cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.99) {
        gsap.set(el, { clearProps: 'all' });
      }
    });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  window.setTimeout(rescue, 3000);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') window.setTimeout(rescue, 1200);
  });
})();
