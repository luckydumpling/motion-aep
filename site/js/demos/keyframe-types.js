/*
 * Demo: keyframe-types
 * Three squares with the same keyframes (1 s left, 2 s right, 3 s left):
 * Linear moves at constant speed, Easy Ease slows in and out, Hold jumps.
 */
(function () {
  'use strict';

  var css = `
.kt { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.kt-view { background: #1b1b1b; padding: 0.6em 0; }
.kt-lane { position: relative; height: 2.4em; margin: 0 0.9em; }
.kt-lane + .kt-lane { border-top: 1px dashed #2c2c2c; }
.kt-sq { position: absolute; top: 50%; width: 1.4em; height: 1.4em; margin-top: -0.7em; background: var(--ae-blue); border-radius: 2px; }
.kt-tl { display: grid; grid-template-columns: 6.5em minmax(0, 1fr); border-top: 1px solid var(--ae-line); }
.kt-names { border-right: 1px solid var(--ae-line); padding: 0.3em 0; }
.kt-names div { height: 1.9em; display: flex; align-items: center; padding: 0 0.7em; white-space: nowrap; }
.kt-tracks { position: relative; padding: 0.3em 0; margin: 0 0.9em; }
.kt-row { position: relative; height: 1.9em; }
.kt-row svg { position: absolute; top: 50%; width: 1.05em; height: 1.05em; transform: translate(-50%, -50%); overflow: visible; }
.kt-row svg path { fill: var(--ae-fg); }
.kt-head { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--ae-blue); }
.kt-ruler { position: relative; height: 1.6em; margin: 0 0.9em; }
.kt-names + .kt-tracks + div { border-right: 1px solid var(--ae-line); }
.kt-ruler span { position: absolute; top: 0.3em; transform: translateX(-50%); opacity: 0.6; }
.kt-ruler span:first-child { transform: none; }
.kt-ruler span:last-child { transform: translateX(-100%); }
`;

  // AE keyframe icons, 10 × 10 box centred on the keyframe
  var ICON = {
    linear: 'M5 0 L10 5 L5 10 L0 5 Z',
    ease: 'M0 0 H10 L5 5 L10 10 H0 L5 5 Z',
    hold: 'M5 0 L5 10 L0 5 Z M5 0 H10 V10 H5 Z'
  };
  var ROWS = [
    { key: 'linear', name: 'Linear' },
    { key: 'ease', name: 'Easy Ease' },
    { key: 'hold', name: 'Hold' }
  ];
  var DUR = 4000;              // 0–4 s on the ruler
  var KEYS = [1, 2, 3];        // seconds
  var VALUES = [0, 1, 0];      // left, right, left

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  function valueAt(type, s) {
    if (s <= KEYS[0]) return VALUES[0];
    if (s >= KEYS[KEYS.length - 1]) return VALUES[VALUES.length - 1];
    for (var i = 0; i < KEYS.length - 1; i++) {
      if (s < KEYS[i + 1]) {
        if (type === 'hold') return VALUES[i];
        var k = (s - KEYS[i]) / (KEYS[i + 1] - KEYS[i]);
        if (type === 'ease') k = ease(k);
        return VALUES[i] + (VALUES[i + 1] - VALUES[i]) * k;
      }
    }
    return 0;
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['keyframe-types'] = function (el) {
    if (!document.getElementById('demo-keyframe-types')) {
      var st = document.createElement('style');
      st.id = 'demo-keyframe-types';
      st.textContent = css;
      document.head.appendChild(st);
    }
    var lanes = '', names = '', rows = '', ruler = '';
    ROWS.forEach(function (r) {
      lanes += '<div class="kt-lane"><span class="kt-sq" data-k="' + r.key + '"></span></div>';
      names += '<div>' + r.name + '</div>';
      var icons = KEYS.map(function (k) {
        return '<svg viewBox="0 0 10 10" style="left:' + (k / 4 * 100) + '%" aria-hidden="true"><path d="' + ICON[r.key] + '"/></svg>';
      }).join('');
      rows += '<div class="kt-row">' + icons + '</div>';
    });
    for (var s = 0; s <= 4; s++) ruler += '<span style="left:' + (s / 4 * 100) + '%">' + s + 's</span>';
    el.innerHTML =
      '<div class="kt">' +
        '<div class="kt-view">' + lanes + '</div>' +
        '<div class="kt-tl"><div class="kt-names">' + names + '</div><div class="kt-tracks">' + rows + '<span class="kt-head"></span></div>' +
        '<div></div><div class="kt-ruler">' + ruler + '</div></div>' +
      '</div>';

    var squares = el.querySelectorAll('.kt-sq');
    var head = el.querySelector('.kt-head');

    function draw(t) {
      var s = t / 1000;
      squares.forEach(function (sq) {
        var v = valueAt(sq.dataset.k, s);
        sq.style.left = 'calc(' + (v * 100) + '% - ' + (v * 1.4) + 'em)';
      });
      head.style.left = (s / 4 * 100) + '%';
    }

    var t = 0, lastNow = null;
    draw(1700);
    function tick(now) {
      if (el.classList.contains('is-paused')) { lastNow = null; }
      else {
        if (lastNow !== null) t = (t + (now - lastNow)) % DUR;
        lastNow = now;
        draw(t);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
})();
