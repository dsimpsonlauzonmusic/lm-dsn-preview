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

  // PROTOTYPE-ONLY: accent palette switcher (design exploration; removed at
  // theme port). Persists the pick across pages via localStorage.
  (function () {
    var KEY = 'lauzon-accent';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) document.documentElement.setAttribute('data-accent', saved);
    var host = document.createElement('div');
    host.className = 'pal-switch';
    host.innerHTML = '<span>Accent</span>' +
      '<button class="pal-btn pal-btn--none" type="button" data-pal="" title="Lauzon only (no accent)" aria-label="No accent"></button>' +
      '<button class="pal-btn pal-btn--magenta" type="button" data-pal="magenta" title="Magenta" aria-label="Magenta accent"></button>' +
      '<button class="pal-btn pal-btn--teal" type="button" data-pal="teal" title="Teal" aria-label="Teal accent"></button>' +
      '<button class="pal-btn pal-btn--duo" type="button" data-pal="duo" title="Magenta + Teal" aria-label="Magenta and teal accents"></button>' +
      '<button class="pal-btn pal-btn--amber" type="button" data-pal="amber" title="Amber" aria-label="Amber accent"></button>';
    document.body.appendChild(host);
    var mark = function () {
      var cur = document.documentElement.getAttribute('data-accent') || '';
      host.querySelectorAll('.pal-btn').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-pal') === cur);
      });
    };
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.pal-btn');
      if (!b) return;
      var v = b.getAttribute('data-pal');
      if (v) document.documentElement.setAttribute('data-accent', v);
      else document.documentElement.removeAttribute('data-accent');
      try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e2) {}
      mark();
    });
    mark();
  })();

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

  // Collection filter sidebar: FILTER button slides the facet rail in beside
  // the grid (inert filtering)
  var collBody = document.querySelector('[data-collection-body]');
  document.querySelectorAll('.filter-chip[aria-controls]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (!collBody) return;
      var open = collBody.classList.toggle('filters-open');
      chip.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.querySelectorAll('.option-chip, .filter-chip--toggle, .facet-opt').forEach(function (chip) {
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
        if (!full) return;
        thumbs.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
        thumb.setAttribute('aria-pressed', 'true');
        if (full === mainImg.getAttribute('src')) return;
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

  // Category highlights (OKA collection-highlights mechanic): hover/focus a
  // category name to swap the flanking image sets; crossfade via GSAP when
  // available, plain class toggle otherwise.
  var cathi = document.querySelector('[data-cathi]');
  if (cathi) {
    var cathiLinks = cathi.querySelectorAll('[data-cathi-link]');
    var setsFor = function (idx) {
      return cathi.querySelectorAll('.cathi-set[data-set="' + idx + '"]');
    };
    var activeIdx = '0';
    var activate = function (idx) {
      if (idx === activeIdx) return;
      var prev = activeIdx; activeIdx = idx;
      cathiLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('data-cathi-link') === idx);
      });
      var showEls = setsFor(idx), hideEls = setsFor(prev);
      // Class toggles are synchronous so a frozen/hidden tab can never strand
      // two sets visible; GSAP only animates the incoming set.
      hideEls.forEach(function (el) { el.classList.remove('is-active'); gsap && gsap.set(el, { clearProps: 'all' }); });
      showEls.forEach(function (el) {
        el.classList.add('is-active');
        if (window.gsap && !reducedMotion()) {
          gsap.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: true, clearProps: 'all' });
        }
      });
    };
    cathiLinks.forEach(function (link) {
      var idx = link.getAttribute('data-cathi-link');
      link.addEventListener('mouseenter', function () { activate(idx); });
      link.addEventListener('focus', function () { activate(idx); });
    });
  }

  // Carousel rails: arrows step one visible page, snap does the rest
  document.querySelectorAll('[data-rail-prev], [data-rail-next]').forEach(function (btn) {
    var id = btn.getAttribute('data-rail-prev') || btn.getAttribute('data-rail-next');
    var rail = document.getElementById(id);
    if (!rail) return;
    var dir = btn.hasAttribute('data-rail-next') ? 1 : -1;
    btn.addEventListener('click', function () {
      rail.scrollBy({ left: dir * rail.clientWidth, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
  });

  // PDP gallery arrows: cycle through the thumbnail set
  var galPrev = document.querySelector('[data-gal-prev]');
  var galNext = document.querySelector('[data-gal-next]');
  if (galPrev && galNext) {
    var galThumbs = Array.prototype.slice.call(document.querySelectorAll('.thumb[data-full]'));
    var galStep = function (dir) {
      var cur = galThumbs.findIndex(function (t) { return t.getAttribute('aria-pressed') === 'true'; });
      var next = (cur + dir + galThumbs.length) % galThumbs.length;
      galThumbs[next].click();
    };
    galPrev.addEventListener('click', function () { galStep(-1); });
    galNext.addEventListener('click', function () { galStep(1); });
  }

  // PDP sticky mini add-to-cart bar: visible once the buy box CTAs scroll
  // above the viewport (plain scroll check; IO can stall in throttled tabs)
  var minibar = document.querySelector('[data-minibar]');
  var buyCtas = document.querySelector('.buybox-ctas');
  if (minibar && buyCtas) {
    var mbUpdate = function () {
      var show = buyCtas.getBoundingClientRect().bottom < 0;
      minibar.classList.toggle('is-visible', show);
      minibar.setAttribute('aria-hidden', show ? 'false' : 'true');
    };
    window.addEventListener('scroll', mbUpdate, { passive: true });
    window.addEventListener('resize', mbUpdate);
    mbUpdate();
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

      loop('.ticker-track', 26);

      // Podcast wave: bars breathe like live audio
      var waveBars = gsap.utils.toArray('.podcast-wave span');
      if (waveBars.length) {
        waveBars.forEach(function (bar, i) {
          gsap.to(bar, {
            scaleY: 0.35 + ((i * 7) % 10) / 18,
            duration: 0.5 + ((i * 3) % 7) / 10,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: (i % 5) * 0.09
          });
        });
      }

      // Sell/Build panels: cut-outs drift gently
      gsap.utils.toArray('[data-float]').forEach(function (el, i) {
        gsap.to(el, { y: -12, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });

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
            color: (document.documentElement.hasAttribute('data-accent')
              ? getComputedStyle(document.documentElement).getPropertyValue('--accent-strong').trim() || el.dataset.fgColor
              : el.dataset.fgColor) || '#272F3A',
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

  // Brands rail: chevrons step a page; dashes track scroll position
  var brandsRail = document.querySelector('.brands-rail');
  if (brandsRail) {
    var bPrev = document.querySelector('.brands-arrow--prev');
    var bNext = document.querySelector('.brands-arrow--next');
    [bPrev, bNext].forEach(function (b) {
      if (!b) return;
      b.removeAttribute('aria-hidden'); b.removeAttribute('tabindex');
      b.setAttribute('aria-label', b === bPrev ? 'Previous brands' : 'Next brands');
    });
    var step = function (dir) {
      brandsRail.scrollBy({ left: dir * brandsRail.clientWidth * 0.8, behavior: reducedMotion() ? 'auto' : 'smooth' });
    };
    if (bPrev) bPrev.addEventListener('click', function () { step(-1); });
    if (bNext) bNext.addEventListener('click', function () { step(1); });
    var dashes = document.querySelectorAll('.brands-dashes span');
    if (dashes.length) {
      brandsRail.addEventListener('scroll', function () {
        var max = brandsRail.scrollWidth - brandsRail.clientWidth;
        var idx = max > 0 ? Math.round((brandsRail.scrollLeft / max) * (dashes.length - 1)) : 0;
        dashes.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      }, { passive: true });
    }
  }

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
