/*
 * Demo: separate-dimensions
 * Position splits into X Position and Y Position. X moves the whole time,
 * Y only in the first half: the square draws a curve instead of a straight line.
 */
(function () {
  'use strict';

  var css = `
.sd { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.sd-view { background: #1b1b1b; }
.sd-view svg { display: block; width: 100%; height: auto; }
.sd-trail { fill: none; stroke: var(--ae-blue); stroke-width: 1.5; stroke-dasharray: 3 4; opacity: 0.7; }
.sd-sq { fill: var(--ae-blue); }
.sd-bar { padding: 0.45em 0.7em; border-top: 1px solid var(--ae-line); min-height: 2.1em; }
.sd-rows { position: relative; padding: 0.3em 0 0.5em; }
.sd-row { display: grid; grid-template-columns: 7.5em 6.5em minmax(0, 1fr); align-items: center; gap: 0.6em;
  padding: 0 0.7em; height: 1.9em; overflow: hidden; }
.sd-val { color: var(--ae-blue); font-variant-numeric: tabular-nums; }
.sd-track { position: relative; height: 100%; border-left: 1px solid var(--ae-line); }
.sd-key { position: absolute; top: 50%; width: 0.65em; height: 0.65em; background: var(--ae-fg); transform: translate(-50%, -50%) rotate(45deg); }
.sd-head { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--ae-blue); }
.sd-headwrap { position: absolute; top: 0; bottom: 0; left: calc(0.7em + 7.5em + 6.5em + 1.2em); right: 0.7em; pointer-events: none; }
`;

  var DUR = 7000;
  // Keyframe times on the track (0–1)
  var X0 = 0.05, X1 = 0.9, Y0 = 0.05, Y1 = 0.45;

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function xAt(p) { return ease(clamp((p - X0) / (X1 - X0))); }
  function yAt(p) { return ease(clamp((p - Y0) / (Y1 - Y0))); }
  function px(x) { return 25 + 250 * x; }
  function py(y) { return 95 - 65 * y; }

  // Follows the Mac/Win switch in the header
  function isMac() {
    var b = document.querySelector('[data-os][aria-pressed="true"]');
    if (b) return b.dataset.os === 'mac';
    return /mac|iphone|ipad/i.test(navigator.platform || '');
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['separate-dimensions'] = function (el) {
    if (!document.getElementById('demo-separate-dimensions')) {
      var s = document.createElement('style');
      s.id = 'demo-separate-dimensions';
      s.textContent = css;
      document.head.appendChild(s);
    }
    function key(at) { return '<i class="sd-key" style="left:' + (at * 100) + '%"></i>'; }
    el.innerHTML =
      '<div class="sd">' +
        '<div class="sd-view"><svg viewBox="0 0 300 120" aria-hidden="true"><polyline class="sd-trail" points=""/><rect class="sd-sq" width="12" height="12"/></svg></div>' +
        '<div class="sd-bar"><span class="sd-status"></span></div>' +
        '<div class="sd-rows">' +
          '<div class="sd-row sd-pos"><span>Position</span><span class="sd-val">160.0, 900.0</span><span class="sd-track"></span></div>' +
          '<div class="sd-row sd-x"><span>X Position</span><span class="sd-val sd-xv"></span><span class="sd-track">' + key(X0) + key(X1) + '</span></div>' +
          '<div class="sd-row sd-y"><span>Y Position</span><span class="sd-val sd-yv"></span><span class="sd-track">' + key(Y0) + key(Y1) + '</span></div>' +
          '<div class="sd-headwrap"><span class="sd-head"></span></div>' +
        '</div>' +
      '</div>';

    var trail = el.querySelector('.sd-trail');
    var sq = el.querySelector('.sd-sq');
    var status = el.querySelector('.sd-status');
    var rowPos = el.querySelector('.sd-pos');
    var rowX = el.querySelector('.sd-x');
    var rowY = el.querySelector('.sd-y');
    var xv = el.querySelector('.sd-xv');
    var yv = el.querySelector('.sd-yv');
    var head = el.querySelector('.sd-head');

    function draw(t) {
      var split, p, text;
      if (t < 1300) { split = 0; p = 0; text = (isMac() ? 'Ctrl-click' : 'Right-click') + ' Position > Separate Dimensions'; }
      else if (t < 2100) { split = ease((t - 1300) / 800); p = 0; text = 'X and Y get their own keyframes'; }
      else if (t < 5600) { split = 1; p = (t - 2100) / 3500; text = 'X moves the whole time, Y only at the start'; }
      else { split = 1; p = 1; text = 'Different timing makes a curve'; }

      rowPos.style.height = (1.9 * (1 - split)) + 'em';
      rowPos.style.opacity = String(1 - split);
      rowX.style.height = rowY.style.height = (1.9 * split) + 'em';
      rowX.style.opacity = rowY.style.opacity = String(split);
      head.style.opacity = String(split);
      head.style.left = (p * 100) + '%';

      var x = xAt(p), y = yAt(p);
      sq.setAttribute('x', String(px(x) - 6));
      sq.setAttribute('y', String(py(y) - 6));
      var pts = [];
      for (var i = 0; i <= 40; i++) {
        var pi = p * i / 40;
        pts.push(px(xAt(pi)).toFixed(1) + ',' + py(yAt(pi)).toFixed(1));
      }
      trail.setAttribute('points', pts.join(' '));
      xv.textContent = (160 + 1600 * x).toFixed(1);
      yv.textContent = (900 - 700 * y).toFixed(1);
      status.textContent = text;
    }

    var t = 0, lastNow = null;
    draw(6000);
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
