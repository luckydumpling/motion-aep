/*
 * Demo: ae-panels
 * A schematic of the After Effects Default workspace. The six panels from the
 * list above light up one after another. Hover or tap a panel (or a list item)
 * to pick one. The list is linked by its bold names, so the text stays in the .md.
 */
(function () {
  'use strict';

  var PANELS = ['Toolbar', 'Project', 'Effect Controls', 'Composition', 'Effects & Presets', 'Timeline'];
  var STEP_MS = 1800;   // time per panel in the loop
  var HOLD_MS = 5000;   // after a tap, hold the choice this long

  var css = `
.ap { --hl: var(--ae-blue); aspect-ratio: 16 / 10; max-width: 100%; background: #1b1b1b; border-radius: var(--radius);
  padding: 0.35rem; display: grid; grid-template-rows: auto minmax(0, 1.55fr) minmax(0, 1fr); gap: 0.3rem;
  font-family: var(--font-mono); font-size: clamp(0.5625rem, 0.45rem + 0.45vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.ap-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.1fr) minmax(0, 0.95fr); gap: 0.3rem; min-height: 0; }
.ap-panel { position: relative; background: var(--ae-bg); border-radius: 3px; outline: 2px solid transparent; outline-offset: -2px;
  transition: outline-color .2s, background-color .2s; min-height: 0; overflow: hidden; }
.ap-panel.is-on { outline-color: var(--hl); background: #26303f; }
.ap-num { position: absolute; top: 0.3rem; right: 0.3rem; width: 1.5em; height: 1.5em; border-radius: 50%; display: grid; place-items: center;
  background: var(--ae-line); color: var(--ae-fg); font-weight: 600; font-size: 0.9em; transition: background .2s, color .2s; }
.is-on > .ap-num, .is-on .ap-num { background: var(--hl); color: #fff; }
.ap-label { position: absolute; left: 0.45rem; bottom: 0.3rem; opacity: 0.75; }
.is-on .ap-label { opacity: 1; color: #fff; }

/* Toolbar */
.ap-bar { height: 2em; display: flex; align-items: center; gap: 0.45em; padding: 0 0.6em; }
.ap-bar i { width: 0.85em; height: 0.85em; border-radius: 2px; background: var(--ae-line); flex: none; }
.ap-bar .ap-label { position: static; margin-left: 0.4em; }
.ap-bar .ap-num { top: 50%; transform: translateY(-50%); }

/* Left frame: Project / Effect Controls tabs */
.ap-left { display: grid; grid-template-rows: auto minmax(0, 1fr); }
.ap-tabs { display: flex; border-bottom: 1px solid var(--ae-line); padding-right: 2em; min-width: 0; }
.ap-tab { min-width: 0; }
.ap-tab { padding: 0.3em 0.55em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.7; cursor: pointer; }
.ap-tab.is-front { opacity: 1; box-shadow: inset 0 -2px 0 var(--ae-fg); }
.ap-left.is-on .ap-tab.is-front { box-shadow: inset 0 -2px 0 var(--hl); color: #fff; }
.ap-rows { padding: 0.45em 0.55em; display: grid; gap: 0.4em; align-content: start; }
.ap-rows i { display: block; height: 0.5em; border-radius: 2px; background: var(--ae-line); }

/* Composition */
.ap-comp { display: grid; place-items: center; cursor: pointer; }
.ap-frame { width: 62%; aspect-ratio: 16 / 9; background: #000; outline: 1px solid var(--ae-line); display: grid; place-items: center; }
.ap-frame b { width: 22%; aspect-ratio: 1; border-radius: 50%; background: var(--ae-blue); opacity: 0.85; }

/* Right column */
.ap-right { display: grid; grid-template-rows: repeat(3, minmax(0, 0.6fr)) minmax(0, 1.6fr); gap: 0.3rem; min-height: 0; }
.ap-mini { padding: 0.3em 0.5em; opacity: 0.55; }
.ap-fx { cursor: pointer; padding: 0.3em 0.5em; }
.ap-fx .ap-label { position: static; display: block; padding-right: 1.8em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Timeline */
.ap-tl { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 2fr); cursor: pointer; }
.ap-layers { border-right: 1px solid var(--ae-line); padding: 0.5em 0.55em; display: grid; gap: 0.45em; align-content: start; }
.ap-layers i { display: block; height: 0.55em; border-radius: 2px; background: var(--ae-line); }
.ap-graph { position: relative; padding: 0.5em 0.6em; display: grid; gap: 0.45em; align-content: start; }
.ap-graph i { display: block; height: 0.55em; border-radius: 2px; background: #3d4a5c; }
.ap-graph i:nth-child(2) { width: 70%; margin-left: 15%; }
.ap-graph i:nth-child(3) { width: 45%; }
.ap-head { position: absolute; top: 0; bottom: 0; left: 38%; width: 1px; background: var(--ae-blue); }

.ap-panel, .ap-tab { cursor: pointer; }
.ap-li { border-radius: var(--radius); transition: background-color .2s; cursor: pointer; }
.ap-li.is-on { background: var(--tint); }
@media (max-width: 480px) { .ap-label { display: none; } .ap-bar .ap-label, .ap-fx .ap-label { display: block; } }
`;

  function addStyle() {
    if (document.getElementById('demo-ae-panels')) return;
    var s = document.createElement('style');
    s.id = 'demo-ae-panels';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function num(n) { return '<span class="ap-num" aria-hidden="true">' + n + '</span>'; }
  function rows(n) { var h = ''; for (var i = 0; i < n; i++) h += '<i></i>'; return h; }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['ae-panels'] = function (el) {
    addStyle();
    el.innerHTML =
      '<div class="ap">' +
        '<div class="ap-panel ap-bar" data-k="Toolbar"><i></i><i></i><i></i><i></i><i></i><i></i><span class="ap-label">Toolbar</span>' + num(1) + '</div>' +
        '<div class="ap-main">' +
          '<div class="ap-panel ap-left" data-k="Project">' +
            '<div class="ap-tabs"><span class="ap-tab is-front" data-tab="Project">Project</span><span class="ap-tab" data-tab="Effect Controls">Effect Controls</span></div>' +
            '<div class="ap-rows">' + rows(5) + '</div>' + num(2) +
          '</div>' +
          '<div class="ap-panel ap-comp" data-k="Composition"><div class="ap-frame"><b></b></div><span class="ap-label">Composition</span>' + num(4) + '</div>' +
          '<div class="ap-right">' +
            '<div class="ap-panel ap-mini">Info</div>' +
            '<div class="ap-panel ap-mini">Audio</div>' +
            '<div class="ap-panel ap-mini">Preview</div>' +
            '<div class="ap-panel ap-fx" data-k="Effects & Presets"><span class="ap-label">Effects &amp; Presets</span>' + num(5) + '<div class="ap-rows" style="padding:0.45em 0 0">' + rows(3) + '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="ap-panel ap-tl" data-k="Timeline"><div class="ap-layers">' + rows(3) + '</div><div class="ap-graph"><i></i><i></i><i></i><span class="ap-head"></span></div><span class="ap-label">Timeline</span>' + num(6) + '</div>' +
      '</div>';

    var left = el.querySelector('.ap-left');
    var leftNum = left.querySelector('.ap-num');
    var tabs = el.querySelectorAll('.ap-tab');

    // Link the bold names in the list above this demo.
    var section = el.closest('section') || document;
    var items = {};
    section.querySelectorAll('li').forEach(function (li) {
      var b = li.querySelector('strong');
      if (b && PANELS.indexOf(b.textContent.trim()) >= 0) {
        li.classList.add('ap-li');
        li.dataset.k = b.textContent.trim();
        items[li.dataset.k] = li;
      }
    });

    var current = -1;
    var holdUntil = 0;

    function show(i) {
      current = i;
      var name = PANELS[i];
      // Project and Effect Controls share the left frame as tabs.
      var isLeft = name === 'Project' || name === 'Effect Controls';
      if (isLeft) {
        tabs.forEach(function (t) { t.classList.toggle('is-front', t.dataset.tab === name); });
        left.dataset.k = name;
        leftNum.textContent = name === 'Project' ? '2' : '3';
      }
      el.querySelectorAll('.ap-panel[data-k]').forEach(function (p) {
        p.classList.toggle('is-on', p.dataset.k === name);
      });
      Object.keys(items).forEach(function (k) { items[k].classList.toggle('is-on', k === name); });
    }

    function pick(name, hold) {
      var i = PANELS.indexOf(name);
      if (i < 0) return;
      holdUntil = hold ? Date.now() + HOLD_MS : Infinity;
      show(i);
    }
    function release() { holdUntil = Date.now(); }

    // Hover and tap on the drawing
    el.querySelectorAll('.ap-panel[data-k]').forEach(function (p) {
      p.addEventListener('mouseenter', function () { pick(p.dataset.k, false); });
      p.addEventListener('mouseleave', release);
      p.addEventListener('click', function () { pick(p.dataset.k, true); });
    });
    tabs.forEach(function (t) {
      t.addEventListener('mouseenter', function () { pick(t.dataset.tab, false); });
      t.addEventListener('click', function (e) { e.stopPropagation(); pick(t.dataset.tab, true); });
    });
    // Hover and tap on the list
    Object.keys(items).forEach(function (k) {
      items[k].addEventListener('mouseenter', function () { pick(k, false); });
      items[k].addEventListener('mouseleave', release);
      items[k].addEventListener('click', function () { pick(k, true); });
    });

    show(0);
    setInterval(function () {
      if (el.classList.contains('is-paused')) return;
      if (Date.now() < holdUntil) return;
      show((current + 1) % PANELS.length);
    }, STEP_MS);
  };
})();
