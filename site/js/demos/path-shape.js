/*
 * Demo: path-shape
 * A motion path with three keyframes. First straight lines with a hard corner.
 * The Convert Vertex tool drags handles out of the middle keyframe: the corner turns into a curve.
 * Then the Selection tool moves the keyframe itself. The ball follows the path the whole time.
 */
(function () {
  'use strict';

  var DUR = 9000;
  var P0 = { x: 50, y: 112 }, P2 = { x: 270, y: 112 };
  var P1A = { x: 160, y: 40 }, P1B = { x: 185, y: 58 };   // middle keyframe before / after moving it
  var HMAX = 62;                                          // handle length when fully pulled out

  var css = `
.ps { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.ps svg { display: block; width: 100%; height: auto; background: #1b1b1b; }
.ps-path { fill: none; stroke: var(--ae-fg); stroke-width: 1; stroke-dasharray: 1.5 3; opacity: .8; }
.ps-key { fill: #1b1b1b; stroke: var(--ae-fg); stroke-width: 1; }
.ps-key.is-sel { fill: var(--ae-fg); }
.ps-handle { stroke: var(--ae-blue); stroke-width: 1; }
.ps-hdot { fill: var(--ae-blue); }
.ps-ball { fill: var(--ae-blue); }
.ps-cursor path { fill: #fff; stroke: #000; stroke-width: 0.8; stroke-linejoin: round; }
.ps-ring { fill: none; stroke: #fff; stroke-width: 1; }
.ps-bar { padding: 0.45em 0.7em; border-top: 1px solid var(--ae-line); min-height: 1.5em; }
.ps-bar b { color: #e8e8e8; font-weight: 500; }
`;

  // Cursor shapes, tip at 0 0
  var CONVERT = '<path d="M0 0 L5 10 L3.2 10 L0 3.6 L-3.2 10 L-5 10 Z"/>';          // the inverted V of the tool
  var ARROW = '<path d="M0 0 L0 12 L3 9 L5.2 13.5 L7 12.6 L4.9 8.3 L8.6 8.3 Z"/>';

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function seg(t, a, b) { return ease(Math.max(0, Math.min(1, (t - a) / (b - a)))); }
  function lerp(a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
  function f(n) { return n.toFixed(1); }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['path-shape'] = function (el) {
    if (!document.getElementById('demo-path-shape')) {
      var st = document.createElement('style');
      st.id = 'demo-path-shape';
      st.textContent = css;
      document.head.appendChild(st);
    }
    el.innerHTML = '<div class="ps">' +
      '<svg viewBox="0 0 320 150" aria-hidden="true">' +
        '<path class="ps-path"/>' +
        '<line class="ps-handle ps-h1"/><line class="ps-handle ps-h2"/>' +
        '<circle class="ps-hdot ps-d1" r="2.2"/><circle class="ps-hdot ps-d2" r="2.2"/>' +
        '<rect class="ps-key ps-k0" width="5" height="5"/><rect class="ps-key ps-k1" width="5" height="5"/><rect class="ps-key ps-k2" width="5" height="5"/>' +
        '<circle class="ps-ball" r="7"/>' +
        '<circle class="ps-ring" r="0" opacity="0"/>' +
        '<g class="ps-cursor"></g>' +
      '</svg>' +
      '<div class="ps-bar"></div>' +
      '</div>';

    var q = function (s) { return el.querySelector(s); };
    var path = q('.ps-path'), ball = q('.ps-ball'), cursor = q('.ps-cursor'), ring = q('.ps-ring'), bar = q('.ps-bar');
    var h1 = q('.ps-h1'), h2 = q('.ps-h2'), d1 = q('.ps-d1'), d2 = q('.ps-d2');
    var keys = [q('.ps-k0'), q('.ps-k1'), q('.ps-k2')];
    var tool = '';

    function setKey(k, p) { k.setAttribute('x', f(p.x - 2.5)); k.setAttribute('y', f(p.y - 2.5)); }
    function setLine(l, a, b) { l.setAttribute('x1', f(a.x)); l.setAttribute('y1', f(a.y)); l.setAttribute('x2', f(b.x)); l.setAttribute('y2', f(b.y)); }
    function setTool(name) {
      if (tool === name) return;
      tool = name;
      cursor.innerHTML = name === 'convert' ? CONVERT : name === 'select' ? ARROW : '';
    }

    function draw(t) {
      // 0 – 1.4 s   straight lines, hard corner
      // 1.4 – 2.2   Convert Vertex tool moves to the middle keyframe
      // 2.4 – 3.8   drags the handles out: the corner turns into a curve
      // 4.6 – 5.4   Selection tool moves to the keyframe
      // 5.6 – 6.8   moves the keyframe, the curve follows
      // 7.8 – 8.6   back to the start
      var reset = seg(t, 7800, 8600);
      var h = HMAX * seg(t, 2400, 3800) * (1 - reset);
      var P1 = lerp(P1A, P1B, seg(t, 5600, 6800) * (1 - reset));
      var hin = { x: P1.x - h, y: P1.y }, hout = { x: P1.x + h, y: P1.y };

      path.setAttribute('d', 'M' + f(P0.x) + ' ' + f(P0.y) +
        ' C' + f(P0.x) + ' ' + f(P0.y) + ' ' + f(hin.x) + ' ' + f(hin.y) + ' ' + f(P1.x) + ' ' + f(P1.y) +
        ' C' + f(hout.x) + ' ' + f(hout.y) + ' ' + f(P2.x) + ' ' + f(P2.y) + ' ' + f(P2.x) + ' ' + f(P2.y));
      setKey(keys[0], P0); setKey(keys[1], P1); setKey(keys[2], P2);

      var showH = h > 0.5;
      [h1, h2, d1, d2].forEach(function (n) { n.style.display = showH ? '' : 'none'; });
      if (showH) {
        setLine(h1, P1, hin); setLine(h2, P1, hout);
        d1.setAttribute('cx', f(hin.x)); d1.setAttribute('cy', f(hin.y));
        d2.setAttribute('cx', f(hout.x)); d2.setAttribute('cy', f(hout.y));
      }
      keys[1].classList.toggle('is-sel', t > 2300 && t < 7800);

      // the ball rides the current path, back and forth
      var L = path.getTotalLength(), ph = (t % 3000) / 3000;
      var p = path.getPointAtLength(L * ease(ph < 0.5 ? ph * 2 : 2 - ph * 2));
      ball.setAttribute('cx', f(p.x)); ball.setAttribute('cy', f(p.y));

      // cursor
      var c, press = -1;
      if (t < 1400 || t > 8600) { setTool(''); c = null; }
      else if (t < 4400) {
        setTool('convert');
        var start = { x: 230, y: 30 };
        c = t < 2400 ? lerp(start, P1, seg(t, 1400, 2200)) : hout;
        if (t >= 2400 && t < 3800) press = t - 2400;
      } else if (t < 7600) {
        setTool('select');
        var from = { x: 240, y: 135 };
        c = t < 5600 ? lerp(from, P1A, seg(t, 4600, 5400)) : P1;
        if (t >= 5600 && t < 6800) press = t - 5600;
      } else { setTool(''); c = null; }

      cursor.style.display = c ? '' : 'none';
      if (c) cursor.setAttribute('transform', 'translate(' + f(c.x) + ' ' + f(c.y) + ')');
      if (press >= 0 && press < 400) {
        var k = press / 400;
        ring.setAttribute('cx', f(c.x)); ring.setAttribute('cy', f(c.y));
        ring.setAttribute('r', f(3 + 9 * k)); ring.setAttribute('opacity', f(1 - k));
      } else ring.setAttribute('opacity', 0);

      bar.innerHTML = t < 1400 ? 'Keyframes only: hard corner'
        : t < 4400 ? '<b>Convert Vertex tool</b> · drag out of the keyframe'
        : t < 7800 ? '<b>Selection tool</b> · move the keyframe'
        : '';
    }

    var t = 3900, lastNow = null;
    draw(t);
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
