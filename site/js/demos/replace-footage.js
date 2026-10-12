/*
 * Demo: replace-footage
 *   demo:replace-footage/one  select a layer, Alt-drag Blue onto it: only that layer changes
 *   demo:replace-footage/all  Alt-drag Blue onto Orange in the Project panel: every Orange layer changes
 */
(function () {
  'use strict';

  var NEW = { name: 'Blue', color: '#3a8fff' };
  var OLD = { name: 'Orange', color: '#ff9f45' };
  var ROWS = 5;
  var ONE = 2; // the layer replaced on its own

  var css = `
.rf-wrap { font-family: var(--font-mono); font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.rf { position: relative; background: #1b1b1b; border-radius: var(--radius) var(--radius) 0 0; padding: 0.35rem; overflow: hidden;
  display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.3fr); gap: 0.3rem; }
.rf-panel { background: var(--ae-bg); border-radius: 3px; min-width: 0; }
.rf-head { padding: 0.4em 0.6em; border-bottom: 1px solid var(--ae-line); }
.rf-list { padding: 0.3em 0; }
.rf-item, .rf-row { display: flex; align-items: center; gap: 0.5em; padding: 0.3em 0.6em; white-space: nowrap; transition: background-color .15s; }
.rf-item.is-sub { padding-left: 1.6em; }
.rf-row { border-bottom: 1px solid #2c2c2c; }
.rf-n { width: 1.2em; opacity: 0.6; }
.rf-sw { width: 0.85em; height: 0.85em; border-radius: 2px; flex: none; transition: background-color .25s; }
.rf-sel { background: #3a4558; color: #fff; }
.rf-target { box-shadow: inset 0 0 0 1px var(--ae-blue); background: #26303f; }
.rf-cursor { position: absolute; left: 0; top: 0; width: 1.15em; height: 1.15em; pointer-events: none; z-index: 3; }
.rf-cursor path { fill: #fff; stroke: #000; stroke-width: 1; }
.rf-ghost { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 0.4em; padding: 0.15em 0.45em;
  border-radius: 3px; background: rgba(58,143,255,.18); border: 1px solid var(--ae-blue); color: #fff; opacity: 0; pointer-events: none; z-index: 2; }
.rf-ring { position: absolute; left: 0; top: 0; width: 2.2em; height: 2.2em; margin: -1.1em 0 0 -1.1em; border-radius: 50%;
  border: 2px solid #fff; opacity: 0; pointer-events: none; z-index: 2; }
.rf-bar { display: flex; align-items: center; gap: 0.75em; padding: 0.45em 0.7em; background: var(--ae-bg);
  border-radius: 0 0 var(--radius) var(--radius); margin-top: 1px; }
.rf-status { flex: 1; min-width: 0; }
.rf-alt { border: 1px solid var(--ae-line); border-bottom-width: 2px; border-radius: 3px; padding: 0 0.4em; opacity: 0.35; transition: opacity .15s, background .15s; }
.rf-alt.is-on { opacity: 1; background: var(--ae-blue); border-color: var(--ae-blue); color: #fff; }
`;

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function seg(t, a, b) { return ease(clamp((t - a) / (b - a))); }

  /* Each script is a list of moments. Times in ms.
     move: [from, to, start, end]   clicks: times of a press/release ring */
  var SCRIPTS = {
    one: {
      dur: 7600, still: 4200,
      path: [['idle', 'row', 0, 700], ['row', 'new', 900, 1600], ['new', 'row', 1800, 3000], ['row', 'idle', 5600, 6600]],
      clicks: [700, 1800, 3000],
      selRow: [700, 7000], selNew: [1800, 3000], drag: [1800, 3000], target: [1800, 3000], alt: [1800, 3000],
      changeOne: [3000, 7000], changeAll: null,
      status: [[0, 'Select the layer in the Timeline'], [1800, 'Alt-drag Blue onto it'], [3000, 'Only this layer is replaced'], [6600, '']]
    },
    all: {
      dur: 6800, still: 3600,
      path: [['idle', 'new', 0, 800], ['new', 'old', 1000, 2200], ['old', 'idle', 4800, 5800]],
      clicks: [1000, 2200],
      selRow: null, selNew: [1000, 2200], drag: [1000, 2200], target: [1000, 2200], alt: [1000, 2200],
      changeOne: [2200, 6200], changeAll: [2200, 6200],
      status: [[0, 'Alt-drag Blue…'], [1000, '…onto Orange in the Project panel'], [2200, 'Every layer using Orange is replaced'], [5800, '']]
    }
  };

  function inRange(t, r) { return !!r && t >= r[0] && t < r[1]; }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['replace-footage'] = function (el) {
    var S = SCRIPTS[el.dataset.variant] || SCRIPTS.one;
    if (!document.getElementById('demo-replace-footage')) {
      var st = document.createElement('style');
      st.id = 'demo-replace-footage';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var rows = '';
    for (var i = 0; i < ROWS; i++) {
      rows += '<div class="rf-row"><span class="rf-n">' + (i + 1) + '</span><span class="rf-sw"></span><span class="rf-name"></span></div>';
    }
    el.innerHTML =
      '<div class="rf-wrap">' +
        '<div class="rf">' +
          '<div class="rf-panel"><div class="rf-head">Project</div><div class="rf-list">' +
            '<div class="rf-item">▾ Solids</div>' +
            '<div class="rf-item is-sub rf-new"><span class="rf-sw" style="background:' + NEW.color + '"></span>' + NEW.name + '</div>' +
            '<div class="rf-item is-sub rf-old"><span class="rf-sw" style="background:' + OLD.color + '"></span>' + OLD.name + '</div>' +
            '<div class="rf-item">▣ Comp 1</div>' +
          '</div></div>' +
          '<div class="rf-panel"><div class="rf-head">Comp 1</div><div class="rf-list">' + rows + '</div></div>' +
          '<span class="rf-ring"></span>' +
          '<span class="rf-ghost"><span class="rf-sw" style="background:' + NEW.color + '"></span>' + NEW.name + '</span>' +
          '<svg class="rf-cursor" viewBox="0 0 12 16" aria-hidden="true"><path d="M1 1 L1 13 L4 10 L6.5 15 L8.5 14 L6 9 L10 9 Z"/></svg>' +
        '</div>' +
        '<div class="rf-bar"><span class="rf-status"></span><span class="rf-alt">⌥ Alt</span></div>' +
      '</div>';

    var box = el.querySelector('.rf');
    var cursor = el.querySelector('.rf-cursor');
    var ghost = el.querySelector('.rf-ghost');
    var ring = el.querySelector('.rf-ring');
    var status = el.querySelector('.rf-status');
    var alt = el.querySelector('.rf-alt');
    var newItem = el.querySelector('.rf-new');
    var oldItem = el.querySelector('.rf-old');
    var rowEls = el.querySelectorAll('.rf-row');
    var targetEl = el.dataset.variant === 'all' ? oldItem : rowEls[ONE];

    function center(node) {
      var b = box.getBoundingClientRect(), r = node.getBoundingClientRect();
      return { x: r.left - b.left + Math.min(r.width * 0.45, 60), y: r.top - b.top + r.height / 2 };
    }
    function points() {
      var b = box.getBoundingClientRect();
      return { idle: { x: b.width - 28, y: b.height - 18 }, row: center(rowEls[ONE]), new: center(newItem), old: center(oldItem) };
    }

    function draw(t) {
      var P = points();
      var pos = P[S.path[0][0]];
      S.path.forEach(function (m) {
        if (t < m[2]) return;
        var a = P[m[0]], b = P[m[1]], k = seg(t, m[2], m[3]);
        pos = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      });

      // Click ring: grows and fades 400 ms after each press or release
      var ringK = -1;
      S.clicks.forEach(function (c) { if (t >= c && t < c + 400) ringK = (t - c) / 400; });
      ring.style.opacity = ringK < 0 ? '0' : String(1 - ringK);
      ring.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px) scale(' + (0.4 + ringK * 0.9) + ')';

      var dragging = inRange(t, S.drag);
      cursor.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
      ghost.style.transform = 'translate(' + (pos.x + 14) + 'px,' + (pos.y + 6) + 'px)';
      ghost.style.opacity = dragging ? '1' : '0';

      rowEls[ONE].classList.toggle('rf-sel', inRange(t, S.selRow));
      newItem.classList.toggle('rf-sel', inRange(t, S.selNew));
      targetEl.classList.toggle('rf-target', inRange(t, S.target) && t > S.target[0] + 500);
      alt.classList.toggle('is-on', inRange(t, S.alt));

      var one = inRange(t, S.changeOne), all = inRange(t, S.changeAll);
      rowEls.forEach(function (r, i) {
        var swap = i === ONE ? one : all;
        var it = swap ? NEW : OLD;
        r.querySelector('.rf-sw').style.backgroundColor = it.color;
        r.querySelector('.rf-name').textContent = it.name;
      });

      var text = '';
      S.status.forEach(function (s) { if (t >= s[0]) text = s[1]; });
      status.textContent = text;
    }

    var t = 0, lastNow = null;
    function still() { draw(S.still); }
    still();
    window.addEventListener('resize', function () { if (el.classList.contains('is-paused')) still(); });
    function tick(now) {
      if (el.classList.contains('is-paused')) { lastNow = null; }
      else {
        if (lastNow !== null) t = (t + (now - lastNow)) % S.dur;
        lastNow = now;
        draw(t);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
})();
