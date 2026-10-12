/*
 * Demo: trim-paths
 * A simplified After Effects view: the End value of Trim Paths runs from
 * 0% to 100%, the playhead moves and the circle stroke draws on.
 * Stops while the figure has .is-paused.
 */
(function () {
  'use strict';

  var css = `
.tp-screen { aspect-ratio: 16 / 10; max-width: 100%; background: var(--ae-bg); border-radius: var(--radius);
  overflow: hidden; display: grid; grid-template-rows: minmax(0, 1fr) auto; }
.tp-viewer { display: grid; place-items: center; background: #1b1b1b; min-height: 0; }
.tp-viewer svg { width: 34%; height: auto; transform: rotate(-90deg); overflow: visible; }
.tp-viewer circle { fill: none; stroke: var(--ae-blue); stroke-width: 7; stroke-linecap: round; stroke-dasharray: 252; }
.tp-timeline { border-top: 1px solid var(--ae-line); font-family: var(--font-mono); font-size: 0.6875rem; color: var(--ae-fg); }
.tp-row { display: grid; grid-template-columns: 6.5em 4.5em minmax(0, 1fr); align-items: center; gap: 0.5rem;
  padding: 0.3rem 0.6rem; border-bottom: 1px solid var(--ae-line); }
.tp-row:last-child { border-bottom: 0; }
.tp-val { color: var(--ae-blue); font-variant-numeric: tabular-nums; }
.tp-track { position: relative; height: 0.9rem; }
.tp-key { position: absolute; top: 50%; width: 7px; height: 7px; background: var(--ae-fg); transform: translate(-50%, -50%) rotate(45deg); }
.tp-key.k1 { left: 0; } .tp-key.k2 { left: 80%; }
.tp-head { position: absolute; top: -0.3rem; bottom: -0.3rem; width: 1px; background: var(--ae-blue); left: 0; }
`;

  var DUR = 4000;

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['trim-paths'] = function (el) {
    if (!document.getElementById('demo-trim-paths')) {
      var s = document.createElement('style');
      s.id = 'demo-trim-paths';
      s.textContent = css;
      document.head.appendChild(s);
    }
    el.innerHTML =
      '<div class="tp-screen">' +
        '<div class="tp-viewer"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40"/></svg></div>' +
        '<div class="tp-timeline" aria-hidden="true">' +
          '<div class="tp-row"><span>Trim Paths 1</span><span></span><span></span></div>' +
          '<div class="tp-row"><span>End</span><span class="tp-val">0.0%</span>' +
            '<span class="tp-track"><i class="tp-key k1"></i><i class="tp-key k2"></i><i class="tp-head"></i></span></div>' +
        '</div>' +
      '</div>';

    var val = el.querySelector('.tp-val');
    var head = el.querySelector('.tp-head');
    var circle = el.querySelector('circle');
    var elapsed = 0, last = null;

    function draw(t) {
      var p = Math.min(t / (DUR * 0.8), 1);
      var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      val.textContent = (eased * 100).toFixed(1) + '%';
      head.style.left = (t / DUR * 100) + '%';
      circle.style.strokeDashoffset = String(252 * (1 - eased));
    }
    function tick(now) {
      if (el.classList.contains('is-paused')) { last = null; }
      else {
        if (last !== null) elapsed = (elapsed + (now - last)) % DUR;
        last = now;
        draw(elapsed);
      }
      requestAnimationFrame(tick);
    }
    draw(DUR * 0.8);
    requestAnimationFrame(tick);
  };
})();
