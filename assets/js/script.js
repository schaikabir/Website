(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero background: crossfading excerpts of portfolio photos
  var heroImages = [
    'assets/img/gallery/dsc06241.jpg',
    'assets/img/gallery/dsc06655.jpg',
    'assets/img/gallery/dsc07348.jpg',
    'assets/img/gallery/dsc06202.jpg',
    'assets/img/gallery/dsc07191.jpg'
  ];
  var heroBg = document.getElementById('heroBg');
  if (heroBg) {
    var slots = Array.prototype.slice.call(heroBg.querySelectorAll('.hero-bg-slot'));
    slots.forEach(function (slot, i) {
      var layers = slot.querySelectorAll('.hero-bg-layer');
      var pointer = i % heroImages.length;
      layers[0].style.backgroundImage = 'url(' + heroImages[pointer] + ')';
      slot._activeLayer = 0;
      slot._pointer = pointer;

      setTimeout(function () {
        layers[0].classList.add('is-active');
      }, 200 + i * 150);

      if (prefersReducedMotion) return;

      setInterval(function () {
        var nextLayerIndex = slot._activeLayer === 0 ? 1 : 0;
        slot._pointer = (slot._pointer + 1) % heroImages.length;
        var nextImg = heroImages[slot._pointer];
        layers[nextLayerIndex].style.backgroundImage = 'url(' + nextImg + ')';
        layers[nextLayerIndex].classList.add('is-active');
        layers[slot._activeLayer].classList.remove('is-active');
        slot._activeLayer = nextLayerIndex;
      }, 6000 + i * 1400);
    });
  }

  // Video cards: play a muted preview on hover (pointer devices only)
  var canHoverPreview = window.matchMedia('(hover: hover)').matches && !prefersReducedMotion;
  if (canHoverPreview) {
    document.querySelectorAll('.video-card').forEach(function (card) {
      var preview = card.querySelector('.video-card-preview');
      if (!preview) return;

      card.addEventListener('mouseenter', function () {
        if (!preview.getAttribute('src')) {
          preview.setAttribute('src', preview.getAttribute('data-src'));
        }
        card.classList.add('is-previewing');
        var playPromise = preview.play();
        if (playPromise && playPromise.catch) playPromise.catch(function () {});
      });

      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-previewing');
        preview.pause();
        preview.currentTime = 0;
      });
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow/background on scroll
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  navToggle.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
  });
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Menü öffnen');
    });
  });

  // Video lightbox
  var lightbox = document.getElementById('lightbox');
  var lightboxVideo = document.getElementById('lightboxVideo');
  var lightboxTitle = document.getElementById('lightboxTitle');
  var lightboxDownload = document.getElementById('lightboxDownload');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastFocused = null;

  function openLightbox(src, title) {
    lastFocused = document.activeElement;
    lightboxVideo.setAttribute('src', src);
    lightboxTitle.textContent = title || '';
    lightboxDownload.setAttribute('href', src);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('.video-card').forEach(function (card) {
    card.addEventListener('click', function () {
      openLightbox(card.getAttribute('data-video'), card.getAttribute('data-title'));
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
    // simple focus trap while lightbox is open
    if (e.key === 'Tab' && lightbox.classList.contains('is-open')) {
      var focusable = lightbox.querySelectorAll('button, a[href], video');
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
