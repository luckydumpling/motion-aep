/*
 * Demo: parenting
 * The circle is the parent, the square its child. Move, scale and rotate the
 * circle: the square follows everything.
 */
(function () {
  'use strict';

  var DUR = 8000;
  var css = `
.pa { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.pa svg { display: block; width: 100%; height: auto; background: #1b1b1b; }
.pa-parent { fill: var(--ae-blue); }
.pa-child { fill: #e8e8e8; }
.pa-link { stroke: #ffd24a; stroke-width: 1; stroke-dasharray: 2 3; }
.pa-tag { fill: var(--ae-fg); font-family: var(--font-mono); font-size: 8px; }
.pa-bar { display: flex; gap: 0.75em; align-items: center; padding: 0.45em 0.7em; border-top: 1px solid var(--ae-line); }
.pa-bar span:first-child { flex: 1; min-width: 0; }
.pa-key { display: inline-block; width: 0.7em; height: 0.7em; border-radius: 50%; background: var(--ae-blue); vertical-align: -0.05em; margin-right: 0.3em; }
.pa-key.is-child { border-radius: 1px; background: #e8e8e8; }
`;

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function seg(t, a, b) { return ease(Math.max(0, Math.min(1, (t - a) / (b - a)))); }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['parenting'] = function (el) {
    if (!document.getElementById('demo-parenting')) {
      var st = document.createElement('style');
      st.id = 'demo-parenting';
      st.textContent = css;
      document.head.appendChild(st);
    }
    el.innerHTML =
      '<div class="pa">' +
        '<svg viewBox="0 0 320 130" aria-hidden="true"><g class="pa-g">' +
          '<line class="pa-link" x1="0" y1="0" x2="42" y2="0"/>' +
          '<circle class="pa-parent" r="14"/>' +
          '<rect class="pa-child" x="36" y="-6" width="12" height="12"/>' +
        '</g></svg>' +
        '<div class="pa-bar"><span class="pa-status"></span><span><i class="pa-key"></i>Parent <i class="pa-key is-child"></i>Child</span></div>' +
      '</div>';

    var g = el.querySelector('.pa-g');
    var status = el.querySelector('.pa-status');

    function draw(t) {
      // move 0.4–1.8 s · scale 2.2–3.4 s · rotate 3.8–5.6 s · back 6.4–7.6 s
      var back = seg(t, 6400, 7600);
      var x = 80 + 150 * seg(t, 400, 1800) * (1 - back);
      var s = 1 + 0.5 * seg(t, 2200, 3400) * (1 - back);
      var r = 180 * seg(t, 3800, 5600) * (1 - back);
      g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 65) rotate(' + r.toFixed(1) + ') scale(' + s.toFixed(3) + ')');
      status.textContent = t < 2000 ? 'Move the parent: the child follows'
        : t < 3600 ? 'Scale the parent: the child scales too'
        : t < 6200 ? 'Rotate the parent: the child turns around it'
        : '';
    }

    var t = 0, lastNow = null;
    draw(5000);
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
