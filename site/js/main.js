/*
 * Shared page script: theme, Mac/Win shortcuts, section index,
 * exercise checklist, loop controls, code demos.
 * Demos register themselves in window.AEDemos (see js/demos/).
 */
(function () {
  'use strict';

  window.AEDemos = window.AEDemos || {};

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    /* Theme: Auto → Light → Dark */
    var root = document.documentElement;
    var themes = ['auto', 'light', 'dark'];
    var theme = store.get('ae-theme') || 'auto';
    if (themes.indexOf(theme) < 0) theme = 'auto';
    function applyTheme(t) {
      if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
      document.querySelectorAll('.theme-btn').forEach(function (b) {
        b.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      });
    }
    applyTheme(theme);
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        theme = themes[(themes.indexOf(theme) + 1) % themes.length];
        applyTheme(theme);
        store.set('ae-theme', theme);
      });
    });

    /* Shortcuts: show only the visitor's platform */
    var osButtons = document.querySelectorAll('[data-os]');
    function detectOS() {
      var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
      return /mac|iphone|ipad/i.test(p) ? 'mac' : 'win';
    }
    function applyOS(os) {
      osButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.os === os)); });
      document.querySelectorAll('kbd[data-mac]').forEach(function (k) { k.textContent = k.dataset[os] || k.dataset.mac; });
      document.querySelectorAll('.os-word').forEach(function (w) { w.textContent = w.dataset[os] || w.dataset.mac; });
      document.querySelectorAll('.key-head').forEach(function (h) { h.textContent = os === 'mac' ? 'Mac' : 'Windows'; });
    }
    var os = store.get('ae-os') || detectOS();
    applyOS(os);
    osButtons.forEach(function (b) {
      b.addEventListener('click', function () { os = b.dataset.os; applyOS(os); store.set('ae-os', os); });
    });

    /* Code demos */
    document.querySelectorAll('[data-demo]').forEach(function (el) {
      var fn = window.AEDemos[el.dataset.demo];
      if (fn) fn(el);
      else el.innerHTML = '<p class="demo-missing">Demo “' + el.dataset.demo + '” not built yet</p>';
    });

    /* Loops (videos and demos): pause button, paused for reduced motion */
    document.querySelectorAll('.media-video, .media-demo').forEach(function (fig) {
      var btn = fig.querySelector('.loop-btn');
      var video = fig.querySelector('video');
      var demo = fig.querySelector('.demo');
      function set(paused) {
        if (video) { paused ? video.pause() : video.play().catch(function () {}); }
        if (demo) demo.classList.toggle('is-paused', paused);
        if (btn) { btn.textContent = paused ? 'Play' : 'Pause'; btn.setAttribute('aria-pressed', String(paused)); }
      }
      set(reduced);
      if (btn) btn.addEventListener('click', function () {
        set(video ? !video.paused : !demo.classList.contains('is-paused'));
      });
    });

    /* Sidebar ticks: a chapter gets ✓ when all its exercise steps are ticked */
    function refreshTicks() {
      document.querySelectorAll('.side-item').forEach(function (item) {
        var keys = (item.dataset.keys || '').split(' ').filter(Boolean);
        var done = keys.length > 0;
        keys.forEach(function (k) { if (store.get(k) !== '1') done = false; });
        var tick = item.querySelector('.side-done');
        if (tick) tick.hidden = !done;
      });
    }

    /* Exercise checklist, remembered per visitor */
    document.querySelectorAll('.exercise').forEach(function (ex) {
      var boxes = ex.querySelectorAll('.checklist input');
      var progress = ex.querySelector('.progress');
      function update() {
        var done = 0;
        boxes.forEach(function (b) { if (b.checked) done++; });
        if (progress) progress.textContent = done + ' of ' + boxes.length + ' done';
      }
      boxes.forEach(function (b) {
        b.checked = store.get(b.id) === '1';
        b.addEventListener('change', function () { store.set(b.id, b.checked ? '1' : '0'); update(); refreshTicks(); });
      });
      update();
    });
    refreshTicks();

    /* Sidebar: open/close on phones, close after jumping to a section */
    var sidebar = document.querySelector('.sidebar');
    var toggle = document.querySelector('.side-toggle');
    if (sidebar && toggle) {
      toggle.addEventListener('click', function () {
        var open = sidebar.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      sidebar.querySelectorAll('.side-sub a').forEach(function (a) {
        a.addEventListener('click', function () {
          sidebar.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* Highlight the current section in the sidebar */
    var links = document.querySelectorAll('.side-sub a');
    if (links.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id); });
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      links.forEach(function (l) {
        var target = document.getElementById(l.getAttribute('href').slice(1));
        if (target) io.observe(target);
      });
    }
  }

  // Wait for DOMContentLoaded so the deferred demo scripts have registered first.
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
