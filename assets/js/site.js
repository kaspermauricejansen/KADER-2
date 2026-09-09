/* =========================================================================
   Studio Kader — gedeelde site-scripts
   Wordt door elke pagina ingeladen. Alle gedrag is generiek en wordt
   aangestuurd via data-attributen in de HTML, zodat er per pagina geen
   losse scripts nodig zijn.
   ========================================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     E-mailadres waar offerteaanvragen naartoe gaan.
     De verzendknop opent nu de mailprogramma van de bezoeker (mailto).

     WIL JE AANVRAGEN LIEVER DIRECT IN JE MAILBOX ZONDER DAT DE BEZOEKER
     ZELF HOEFT TE VERSTUREN? Zet dan hieronder FORM_ENDPOINT op de URL van
     bijvoorbeeld Formspree ('https://formspree.io/f/JOUW_ID'). Zodra hier
     een URL staat, verstuurt het formulier automatisch en is mailto alleen
     nog de reservevariant als dat mislukt.
     ----------------------------------------------------------------------- */
  var CONTACT_EMAIL = 'hallo@studiokader.nl';
  var FORM_ENDPOINT = null;

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ================= SCROLL VERGRENDELEN ================= */
  var scrollLocks = 0;
  function lockScroll() {
    if (scrollLocks === 0) document.body.style.overflow = 'hidden';
    scrollLocks++;
  }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) document.body.style.overflow = '';
  }

  /* ================= FOCUS VASTHOUDEN IN OVERLAYS ================= */
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var items = $$(FOCUSABLE, container).filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0;
    });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ================= MOBIEL MENU ================= */
  (function initDrawer() {
    var drawer = $('#mobileDrawer');
    var panel = $('#drawerPanel');
    var openBtn = $('#mobileMenuBtn');
    if (!drawer || !panel || !openBtn) return;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.classList.remove('pointer-events-none', 'opacity-0');
      drawer.classList.add('pointer-events-auto', 'opacity-100');
      panel.classList.remove('translate-x-full');
      openBtn.setAttribute('aria-expanded', 'true');
      lockScroll();
      var close = $('#drawerClose');
      if (close) close.focus();
    }

    function close() {
      if (drawer.classList.contains('opacity-0')) return;
      drawer.classList.add('pointer-events-none', 'opacity-0');
      drawer.classList.remove('pointer-events-auto', 'opacity-100');
      panel.classList.add('translate-x-full');
      openBtn.setAttribute('aria-expanded', 'false');
      unlockScroll();
      if (lastFocus) lastFocus.focus();
    }

    openBtn.addEventListener('click', open);
    var closeBtn = $('#drawerClose');
    if (closeBtn) closeBtn.addEventListener('click', close);
    var backdrop = $('#drawerBackdrop');
    if (backdrop) backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (drawer.classList.contains('opacity-0')) return;
      if (e.key === 'Escape') close();
      else trapFocus(panel, e);
    });
  })();

  /* ================= MELDING (TOAST) ================= */
  function showToast(msg) {
    var t = $('#toast');
    var txt = $('#toastText');
    if (!t || !txt) return;
    txt.textContent = msg;
    t.classList.remove('translate-y-28', 'opacity-0');
    t.classList.add('translate-y-0', 'opacity-100');
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () {
      t.classList.add('translate-y-28', 'opacity-0');
      t.classList.remove('translate-y-0', 'opacity-100');
    }, 4000);
  }

  /* ================= FAQ ================= */
  (function initFaq() {
    var items = $$('.faq-item');
    if (!items.length) return;

    function closeItem(item) {
      var answer = $('.faq-answer', item);
      var btn = $('button', item);
      item.classList.remove('open');
      if (answer) answer.style.maxHeight = '';
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    items.forEach(function (item) {
      var btn = $('button', item);
      var answer = $('.faq-answer', item);
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        items.forEach(closeItem);
        if (!wasOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          // echte hoogte, zodat lange antwoorden volledig zichtbaar blijven
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    // Bij het wijzigen van de venstergrootte kan de hoogte veranderen
    window.addEventListener('resize', function () {
      var open = $('.faq-item.open');
      if (!open) return;
      var answer = $('.faq-answer', open);
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  })();

  /* ================= SCÈNE-SPELER (walkthrough-preview) =================
     Laat precies één .kb-scene tegelijk zien en loopt ze synchroon met de
     voortgangsbalk door. In de oude versie kregen alle scènes tegelijk de
     class 'active', waardoor er nooit iets wisselde.
     ===================================================================== */
  function ScenePlayer(opts) {
    this.container = opts.container;
    this.progressEl = opts.progressEl || null;
    this.timeEl = opts.timeEl || null;
    this.iconEl = opts.iconEl || null;
    this.button = opts.button || null;
    this.duration = opts.duration || 24;
    this.progress = 0;
    this.timer = null;
    this.playing = false;
    this.scenes = $$('.kb-scene', this.container);
    this.showScene(0);
    this.render();
  }

  ScenePlayer.PLAY_ICON = '<path d="M8 5v14l11-7z"/>';
  ScenePlayer.PAUSE_ICON = '<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>';

  ScenePlayer.prototype.showScene = function (idx) {
    if (!this.scenes.length) return;
    var target = ((idx % this.scenes.length) + this.scenes.length) % this.scenes.length;
    for (var i = 0; i < this.scenes.length; i++) {
      this.scenes[i].classList.toggle('active', i === target);
    }
    this.sceneIdx = target;
  };

  ScenePlayer.prototype.render = function () {
    if (this.progressEl) this.progressEl.style.width = this.progress + '%';
    if (this.timeEl) {
      var total = this.duration;
      var cur = Math.min(total, Math.floor(this.progress / 100 * total));
      this.timeEl.textContent = '0:' + String(cur).padStart(2, '0') + ' / 0:' + String(total).padStart(2, '0');
    }
    if (this.scenes.length) {
      var idx = Math.min(this.scenes.length - 1, Math.floor(this.progress / 100 * this.scenes.length));
      if (idx !== this.sceneIdx) this.showScene(idx);
    }
    if (this.iconEl) this.iconEl.innerHTML = this.playing ? ScenePlayer.PAUSE_ICON : ScenePlayer.PLAY_ICON;
    if (this.button) this.button.setAttribute('aria-label', this.playing ? 'Pauzeren' : 'Afspelen');
  };

  ScenePlayer.prototype.play = function () {
    if (this.playing) return;
    this.playing = true;
    var self = this;
    var step = 100 / (this.duration * 10); // tick van 100ms
    this.timer = window.setInterval(function () {
      self.progress += step;
      if (self.progress >= 100) self.progress = 0;
      self.render();
    }, 100);
    this.render();
  };

  ScenePlayer.prototype.pause = function () {
    window.clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    this.render();
  };

  ScenePlayer.prototype.toggle = function () { this.playing ? this.pause() : this.play(); };

  ScenePlayer.prototype.reset = function () {
    this.pause();
    this.progress = 0;
    this.showScene(0);
    this.render();
  };

  function sceneMarkup(scenes) {
    var fx = ['zoom', 'pan', 'tilt'];
    return scenes.map(function (src, i) {
      return '<div class="kb-scene' + (i === 0 ? ' active' : '') + '" data-fx="' + fx[i % fx.length] + '">' +
        '<img src="' + src + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover">' +
        '</div>';
    }).join('');
  }

  /* ================= WALKTHROUGH-VENSTER ================= */
  (function initWalkthroughModal() {
    var modal = $('#walkthroughModal');
    if (!modal) return;

    var scenesWrap = $('#modalScenes');
    var titleEl = $('#modalTitle');
    var player = null;
    var lastFocus = null;

    function open(title, scenes) {
      lastFocus = document.activeElement;
      if (titleEl) titleEl.textContent = title || 'Walkthrough-preview';
      scenesWrap.innerHTML = sceneMarkup(scenes);
      modal.classList.remove('hidden');
      lockScroll();
      player = new ScenePlayer({
        container: scenesWrap,
        progressEl: $('#modalProgress'),
        timeEl: $('#modalTime'),
        iconEl: $('#modalPlayIcon'),
        button: $('#modalPlayBtn'),
      });
      player.play();
      var closeBtn = $('[data-modal-close]', modal);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (modal.classList.contains('hidden')) return;
      modal.classList.add('hidden');
      if (player) { player.pause(); player = null; }
      scenesWrap.innerHTML = '';
      unlockScroll();
      if (lastFocus) lastFocus.focus();
    }

    $$('[data-modal-close]', modal).forEach(function (el) {
      el.addEventListener('click', close);
    });

    var playBtn = $('#modalPlayBtn');
    if (playBtn) playBtn.addEventListener('click', function () { if (player) player.toggle(); });

    document.addEventListener('keydown', function (e) {
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      else trapFocus(modal, e);
    });

    // Alles met data-walkthrough opent het venster
    $$('[data-walkthrough]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var scenes;
        try { scenes = JSON.parse(trigger.getAttribute('data-scenes') || '[]'); }
        catch (err) { scenes = []; }
        if (!scenes.length) return;
        open(trigger.getAttribute('data-title') || '', scenes);
      });
    });
  })();

  /* ================= LICHTBAK ================= */
  (function initLightbox() {
    var box = $('#lightbox');
    if (!box) return;

    var imgEl = $('#lightboxImg');
    var counter = $('#lightboxCounter');
    var gallery = [];
    var index = 0;
    var lastFocus = null;

    function render() {
      var item = gallery[index];
      if (!item) return;
      imgEl.src = item.src;
      imgEl.alt = item.alt || '';
      if (counter) counter.textContent = (index + 1) + ' / ' + gallery.length;
    }

    function open(items, startIndex) {
      lastFocus = document.activeElement;
      gallery = items;
      index = startIndex || 0;
      box.classList.remove('hidden');
      lockScroll();
      render();
      var closeBtn = $('[data-lightbox-close]', box);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (box.classList.contains('hidden')) return;
      box.classList.add('hidden');
      unlockScroll();
      if (lastFocus) lastFocus.focus();
    }

    function nav(dir) {
      if (!gallery.length) return;
      index = (index + dir + gallery.length) % gallery.length;
      render();
    }

    $$('[data-lightbox-close]', box).forEach(function (el) { el.addEventListener('click', close); });
    $$('[data-lightbox-prev]', box).forEach(function (el) { el.addEventListener('click', function () { nav(-1); }); });
    $$('[data-lightbox-next]', box).forEach(function (el) { el.addEventListener('click', function () { nav(1); }); });

    document.addEventListener('keydown', function (e) {
      if (box.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
      else trapFocus(box, e);
    });

    // Elke galerij op de pagina levert zijn eigen reeks
    $$('[data-gallery]').forEach(function (group) {
      var thumbs = $$('[data-lightbox-item]', group);
      var items = thumbs.map(function (t) {
        var img = $('img', t);
        return {
          src: t.getAttribute('data-full') || (img ? img.src : ''),
          alt: img ? img.alt : '',
        };
      });
      thumbs.forEach(function (t, i) {
        t.addEventListener('click', function () { open(items, i); });
      });
    });
  })();

  /* ================= LOSSE SPELER OP PROJECTPAGINA ================= */
  (function initDetailPlayer() {
    var wrap = $('#detailScenes');
    if (!wrap) return;

    // De scènes stonden in de oude versie nooit in de HTML, waardoor de
    // speler een leeg zwart vlak was. Ze komen nu uit data-scenes.
    var scenes;
    try { scenes = JSON.parse(wrap.getAttribute('data-scenes') || '[]'); }
    catch (err) { scenes = []; }
    if (scenes.length) wrap.innerHTML = sceneMarkup(scenes);

    var player = new ScenePlayer({
      container: wrap,
      progressEl: $('#detailProgress'),
      timeEl: $('#detailTime'),
      iconEl: $('#detailPlayIcon'),
      button: $('#detailPlayBtn'),
    });

    var btn = $('#detailPlayBtn');
    if (btn) btn.addEventListener('click', function () { player.toggle(); });

    // Pauzeer zodra de speler uit beeld is of het tabblad inactief wordt
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) player.pause();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (!entry.isIntersecting) player.pause(); });
      }, { threshold: 0 }).observe(wrap);
    }

    /* Formaat-tabs (16:9 / 9:16 / 1:1) */
    var playerWrap = $('#detailPlayerWrap');
    var ratios = {
      landscape: { ratio: '16/9', max: '100%' },
      vertical: { ratio: '9/16', max: '320px' },
      square: { ratio: '1/1', max: '480px' },
    };
    $$('#formatTabs .tab-btn').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('#formatTabs .tab-btn').forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var cfg = ratios[tab.getAttribute('data-format')];
        if (cfg && playerWrap) {
          playerWrap.style.aspectRatio = cfg.ratio;
          playerWrap.style.maxWidth = cfg.max;
        }
      });
    });
  })();

  /* ================= VERGELIJK-SCHUIVERS ================= */
  (function initCompareSliders() {
    $$('[data-compare]').forEach(function (box) {
      var handle = $('[data-compare-handle]', box);
      var side = $('[data-compare-side]', box);
      if (!handle || !side) return;

      var dragging = false;

      function setPct(pct) {
        pct = Math.max(5, Math.min(95, pct));
        handle.style.left = pct + '%';
        side.style.width = pct + '%';
        handle.setAttribute('aria-valuenow', Math.round(pct));
      }

      function setFromX(x) {
        var rect = box.getBoundingClientRect();
        setPct(((x - rect.left) / rect.width) * 100);
      }

      box.addEventListener('mousedown', function (e) { dragging = true; setFromX(e.clientX); });
      window.addEventListener('mousemove', function (e) { if (dragging) setFromX(e.clientX); });
      window.addEventListener('mouseup', function () { dragging = false; });

      box.addEventListener('touchstart', function (e) { dragging = true; setFromX(e.touches[0].clientX); }, { passive: true });
      box.addEventListener('touchmove', function (e) { if (dragging) setFromX(e.touches[0].clientX); }, { passive: true });
      window.addEventListener('touchend', function () { dragging = false; });

      // Bedienbaar met het toetsenbord
      handle.addEventListener('keydown', function (e) {
        var cur = parseFloat(handle.style.left) || 50;
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPct(cur - 5); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setPct(cur + 5); }
        else if (e.key === 'Home') { e.preventDefault(); setPct(5); }
        else if (e.key === 'End') { e.preventDefault(); setPct(95); }
      });
    });
  })();

  /* ================= PORTFOLIOFILTER =================
     Werkt alleen binnen de eigen groep. In de oude versie filterde dit
     ook de kaarten op de homepage en onder 'andere projecten' weg.
     ================================================== */
  (function initFilter() {
    $$('[data-filter-group]').forEach(function (group) {
      var buttons = $$('[data-filter]', group);
      var itemsWrap = $(group.getAttribute('data-filter-group'));
      if (!itemsWrap || !buttons.length) return;
      var items = $$('[data-category]', itemsWrap);

      function apply(filter) {
        items.forEach(function (item) {
          var show = filter === 'all' || item.getAttribute('data-category') === filter;
          item.hidden = !show;
        });
        buttons.forEach(function (btn) {
          var on = btn.getAttribute('data-filter') === filter;
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
          btn.classList.toggle('bg-ink', on);
          btn.classList.toggle('text-cream', on);
          btn.classList.toggle('bg-sand', !on);
          btn.classList.toggle('text-ink', !on);
        });
      }

      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () { apply(btn.getAttribute('data-filter')); });
      });
      apply('all');
    });
  })();

  /* ================= SCÈNEROTATIE IN DE HERO ================= */
  (function initRotator() {
    $$('[data-scene-rotator]').forEach(function (rot) {
      var scenes = $$('.kb-scene', rot);
      if (scenes.length < 2) return;
      var labelEl = $(rot.getAttribute('data-label-target') || '');
      var labels;
      try { labels = JSON.parse(rot.getAttribute('data-labels') || '[]'); }
      catch (err) { labels = []; }

      var idx = 0;
      var timer = null;

      function tick() {
        idx = (idx + 1) % scenes.length;
        scenes.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
        if (labelEl && labels[idx]) labelEl.textContent = labels[idx];
      }

      function start() { if (!timer) timer = window.setInterval(tick, 5000); }
      function stop() { window.clearInterval(timer); timer = null; }

      // Niet laten draaien in een inactief tabblad of buiten beeld
      document.addEventListener('visibilitychange', function () {
        document.hidden ? stop() : start();
      });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { entry.isIntersecting ? start() : stop(); });
        }, { threshold: 0.15 }).observe(rot);
      } else {
        start();
      }
    });
  })();

  /* ================= CONTACTFORMULIER =================
     De oude versie deed niets met de ingevulde gegevens: er werd alleen
     een melding getoond en het formulier geleegd. Elke aanvraag was weg.
     ================================================== */
  (function initContactForm() {
    var form = $('#contactForm');
    if (!form) return;

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    function fieldError(input) {
      var holder = input.closest('[data-field]');
      return holder ? $('.field-error', holder) : null;
    }

    function setInvalid(input, message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      var err = fieldError(input);
      if (err) { err.textContent = message; err.classList.add('show'); }
    }

    function clearInvalid(input) {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
      var err = fieldError(input);
      if (err) err.classList.remove('show');
    }

    function validate() {
      var problems = [];
      var naam = form.elements.naam;
      var email = form.elements.email;

      [naam, email].forEach(clearInvalid);

      if (!naam.value.trim()) {
        setInvalid(naam, 'Vul je naam in.');
        problems.push(naam);
      }
      if (!email.value.trim()) {
        setInvalid(email, 'Vul je e-mailadres in.');
        problems.push(email);
      } else if (!EMAIL_RE.test(email.value.trim())) {
        setInvalid(email, 'Dit e-mailadres lijkt niet te kloppen.');
        problems.push(email);
      }
      return problems;
    }

    ['naam', 'email'].forEach(function (name) {
      var input = form.elements[name];
      if (input) input.addEventListener('input', function () { clearInvalid(input); });
    });

    function buildMailto() {
      var v = function (n) { return form.elements[n] ? form.elements[n].value.trim() : ''; };
      var subject = 'Offerteaanvraag — ' + (v('naam') || 'website');
      var body = [
        'Naam: ' + v('naam'),
        'E-mail: ' + v('email'),
        'Telefoon: ' + (v('telefoon') || '—'),
        'Type object: ' + v('type'),
        'Gewenst pakket: ' + v('pakket'),
        '',
        'Bericht:',
        v('bericht') || '—',
        '',
        '— Verzonden via studiokader.nl',
      ].join('\n');
      return 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var problems = validate();
      if (problems.length) {
        problems[0].focus();
        showToast('Controleer de gemarkeerde velden.');
        return;
      }

      if (FORM_ENDPOINT) {
        var btn = $('button[type="submit"]', form);
        if (btn) btn.disabled = true;
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        }).then(function (res) {
          if (!res.ok) throw new Error('verzenden mislukt');
          showToast('Bedankt! We reageren binnen 2 uur op werkdagen.');
          form.reset();
        }).catch(function () {
          showToast('Verzenden lukte niet — we openen je mailprogramma.');
          window.location.href = buildMailto();
        }).then(function () {
          if (btn) btn.disabled = false;
        });
        return;
      }

      // Zonder endpoint: open de mailprogramma met alles ingevuld
      window.location.href = buildMailto();
      showToast('Je mailprogramma opent met de aanvraag — klik daar op verzenden.');
    });
  })();

  /* ================= JAARTAL IN DE VOETTEKST ================= */
  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
