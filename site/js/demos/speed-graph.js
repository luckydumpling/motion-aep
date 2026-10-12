/*
 * Demo: speed-graph
 * A square moves between two keyframes. Below it, the speed graph.
 * Drag a handle (or use the arrow keys on it): the curve changes and so does the motion.
 * Influence 0% = linear (flat line), 33% = Easy Ease, more = faster in the middle.
 */
(function () {
  'use strict';

  var css = `
.sg { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.sg-view { position: relative; height: 3.6em; background: #1b1b1b; margin: 0; }
.sg-sq { position: absolute; top: 50%; width: 1.4em; height: 1.4em; margin-top: -0.7em; background: var(--ae-blue); border-radius: 2px; }
.sg-bar { display: flex; gap: 1em; align-items: center; padding: 0.45em 0.7em; border-top: 1px solid var(--ae-line); flex-wrap: wrap; }
.sg-bar span:first-child { flex: 1; min-width: 0; }
.sg-inf { color: var(--ae-blue); font-variant-numeric: tabular-nums; }
.sg-graph { display: block; width: 100%; height: auto; touch-action: none; }
.sg-grid { stroke: #2f2f2f; stroke-width: 1; }
.sg-curve { fill: none; stroke: var(--ae-blue); stroke-width: 2; }
.sg-fill { fill: rgba(58,143,255,.12); }
.sg-handle-line { stroke: #e8e8e8; stroke-width: 1.2; }
.sg-key { fill: #e8e8e8; }
.sg-dot { fill: #1b1b1b; stroke: #ffd24a; stroke-width: 2; cursor: ew-resize; }
.sg-dot:focus { outline: none; stroke-width: 3; }
.sg-dot:focus-visible { stroke: #fff; }
.sg-head { stroke: var(--ae-blue); stroke-width: 1; }
.sg-label { fill: var(--ae-fg); font-family: var(--font-mono); font-size: 10px; opacity: .7; }
`;

  var W = 400, H = 150, PAD = 18;          // graph box in SVG units
  var GX0 = PAD, GX1 = W - PAD, GY0 = H - 22, GY1 = 16;
  var SMAX = 4;                            // top of the speed axis (× average speed)
  var MOVE = 2000, REST = 700, DUR = MOVE + REST;

  function bez(a, b, u) { var v = 1 - u; return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u; }
  function dbez(a, b, u) { var v = 1 - u; return 3 * v * v * a + 6 * v * u * (b - a) + 3 * u * u * (1 - b); }
  // progress (0–1) at time x (0–1) for an ease with influence inf on both keyframes
  function progressAt(inf, x) {
    var x1 = inf, x2 = 1 - inf, lo = 0, hi = 1, u = x;
    for (var i = 0; i < 30; i++) { u = (lo + hi) / 2; if (bez(x1, x2, u) < x) lo = u; else hi = u; }
    return bez(0, 1, u);
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['speed-graph'] = function (el) {
    if (!document.getElementById('demo-speed-graph')) {
      var st = document.createElement('style');
      st.id = 'demo-speed-graph';
      st.textContent = css;
      document.head.appendChild(st);
    }
    // Interactive: not a picture for screen readers, the sliders inside must stay reachable.
    el.removeAttribute('role');
    el.setAttribute('role', 'group');
    el.innerHTML =
      '<div class="sg">' +
        '<div class="sg-view"><span class="sg-sq"></span></div>' +
        '<div class="sg-bar"><span>Drag a yellow handle</span><span>Influence <b class="sg-inf"></b></span></div>' +
        '<svg class="sg-graph" viewBox="0 0 ' + W + ' ' + H + '">' +
          '<line class="sg-grid" x1="' + GX0 + '" y1="' + GY0 + '" x2="' + GX1 + '" y2="' + GY0 + '"/>' +
          '<line class="sg-grid" x1="' + GX0 + '" y1="' + yOf(1) + '" x2="' + GX1 + '" y2="' + yOf(1) + '" stroke-dasharray="3 4"/>' +
          '<text class="sg-label" x="' + GX0 + '" y="' + (H - 6) + '">speed</text>' +
          '<path class="sg-fill"/><path class="sg-curve"/>' +
          '<line class="sg-head" y1="' + GY1 + '" y2="' + GY0 + '"/>' +
          '<line class="sg-handle-line sg-hl0"/><line class="sg-handle-line sg-hl1"/>' +
          '<rect class="sg-key" width="8" height="8" transform="translate(' + (GX0 - 4) + ',' + (GY0 - 4) + ')"/>' +
          '<rect class="sg-key" width="8" height="8" transform="translate(' + (GX1 - 4) + ',' + (GY0 - 4) + ')"/>' +
          '<circle class="sg-dot sg-d0" r="6" tabindex="0" role="slider" aria-label="Influence, first keyframe" aria-valuemin="0" aria-valuemax="75"/>' +
          '<circle class="sg-dot sg-d1" r="6" tabindex="0" role="slider" aria-label="Influence, last keyframe" aria-valuemin="0" aria-valuemax="75"/>' +
        '</svg>' +
      '</div>';

    function yOf(speed) { return GY0 - (GY0 - GY1) * Math.min(speed, SMAX) / SMAX; }
    function xOf(x) { return GX0 + (GX1 - GX0) * x; }

    var svg = el.querySelector('svg');
    var sq = el.querySelector('.sg-sq');
    var curve = el.querySelector('.sg-curve');
    var fill = el.querySelector('.sg-fill');
    var head = el.querySelector('.sg-head');
    var infOut = el.querySelector('.sg-inf');
    var d0 = el.querySelector('.sg-d0'), d1 = el.querySelector('.sg-d1');
    var hl0 = el.querySelector('.sg-hl0'), hl1 = el.querySelector('.sg-hl1');

    var inf = 1 / 3; // Easy Ease

    function drawGraph() {
      var x1 = inf, x2 = 1 - inf, pts = [];
      for (var i = 0; i <= 80; i++) {
        var u = i / 80;
        var dx = dbez(x1, x2, u), dy = dbez(0, 1, u);
        var sp = dx < 1e-4 ? 0 : dy / dx;
        pts.push(xOf(bez(x1, x2, u)).toFixed(1) + ',' + yOf(sp).toFixed(1));
      }
      curve.setAttribute('d', 'M' + pts.join(' L'));
      fill.setAttribute('d', 'M' + xOf(0) + ',' + GY0 + ' L' + pts.join(' L') + ' L' + xOf(1) + ',' + GY0 + ' Z');
      var ax = xOf(inf), bx = xOf(1 - inf);
      d0.setAttribute('cx', ax); d0.setAttribute('cy', GY0);
      d1.setAttribute('cx', bx); d1.setAttribute('cy', GY0);
      hl0.setAttribute('x1', GX0); hl0.setAttribute('y1', GY0); hl0.setAttribute('x2', ax); hl0.setAttribute('y2', GY0);
      hl1.setAttribute('x1', GX1); hl1.setAttribute('y1', GY0); hl1.setAttribute('x2', bx); hl1.setAttribute('y2', GY0);
      var pct = Math.round(inf * 100);
      infOut.textContent = pct + '%' + (pct === 0 ? ' · linear' : pct === 33 ? ' · Easy Ease' : '');
      d0.setAttribute('aria-valuenow', pct); d1.setAttribute('aria-valuenow', pct);
    }

    function setInf(v) { inf = Math.max(0, Math.min(0.75, v)); drawGraph(); }

    // Dragging: the handle's distance from its keyframe sets the influence (both sides stay equal).
    var dragging = null;
    function toGraphX(evt) {
      var r = svg.getBoundingClientRect();
      return ((evt.clientX - r.left) / r.width * W - GX0) / (GX1 - GX0);
    }
    [d0, d1].forEach(function (d, i) {
      d.addEventListener('pointerdown', function (e) { dragging = i; d.setPointerCapture(e.pointerId); e.preventDefault(); });
      d.addEventListener('pointermove', function (e) {
        if (dragging !== i) return;
        var x = toGraphX(e);
        setInf(i === 0 ? x : 1 - x);
      });
      d.addEventListener('pointerup', function () { dragging = null; });
      d.addEventListener('keydown', function (e) {
        var step = e.shiftKey ? 0.1 : 0.01;
        var dir = (e.key === 'ArrowRight' || e.key === 'ArrowUp') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        setInf(inf + (i === 0 ? dir : -dir) * step);
      });
    });

    function draw(t) {
      var x = Math.min(t / MOVE, 1);
      var p = progressAt(inf, x);
      sq.style.left = 'calc(' + (5 + p * 88) + '% - 0.7em)';
      var hx = xOf(x);
      head.setAttribute('x1', hx); head.setAttribute('x2', hx);
    }

    drawGraph();
    var t = 0, lastNow = null;
    draw(MOVE * 0.5);
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
