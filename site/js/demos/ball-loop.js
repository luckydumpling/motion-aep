/*
 * Demo: ball-loop
 *   demo:ball-loop        the exercise result: the ball rides the loop with Orient Along Path and even speed
 *   demo:ball-loop/rove   switch Rove Across Time on and off. The frame dots on the path and the
 *                         keyframes in the timeline show how the speed changes.
 * Artwork follows loop.ai (2000 × 1132): bg, loop, ball.
 */
(function () {
  'use strict';

  var W = 2000, H = 1132;
  var GROUND = 1062, R_OUT = 560, R_IN = 361, BALL = 65;
  var C = { x: 1043, y: GROUND - R_IN };      // inner edge of the loop sits on the ground: no bump
  var RIDE = R_IN - BALL;                      // ball centre on the inner edge of the loop
  var BOTTOM = C.y + RIDE, TOP = C.y - RIDE;
  var PATH =
    'M112 ' + BOTTOM + ' H' + C.x + ' ' +
    'A' + RIDE + ' ' + RIDE + ' 0 0 0 ' + C.x + ' ' + TOP + ' ' +
    'A' + RIDE + ' ' + RIDE + ' 0 0 0 ' + C.x + ' ' + BOTTOM + ' ' +
    'H1900';
  var FOOT = Math.sqrt(R_OUT * R_OUT - R_IN * R_IN);   // where the loop meets the ground

  // Keyframes as a student might set them: evenly spaced in time, unevenly along the path.
  var KEYS = [0, 0.3, 0.42, 0.55, 0.64, 0.74, 0.86, 1];
  var MOVE = 4.2, HOLD = 0.8, DUR = MOVE + HOLD;   // seconds
  var FRAMES = 40;                                 // frame dots on the path
  var EASE = 0.14;                                 // Easy Ease on the first and last keyframe (share of the move)

  var css = `
.bl { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.bl svg { display: block; width: 100%; height: auto; }
.bl-trail { fill: none; stroke: #1b1b1b; stroke-width: 4; stroke-dasharray: 2 14; opacity: .55; }
.bl-dot { fill: #1b1b1b; opacity: .6; transition: cx .5s ease, cy .5s ease; }
.bl-code { padding: 0.55em 0.7em; border-top: 1px solid var(--ae-line); display: flex; flex-wrap: wrap; gap: 0.4em 1em; align-items: center; }
.bl-toggle { display: inline-flex; align-items: center; gap: 0.45em; cursor: pointer; color: #e8e8e8; }
.bl-toggle input { accent-color: var(--ae-blue); margin: 0; }
.bl-status { opacity: .75; }
.bl-tl { position: relative; height: 1.9em; margin: 0 0.7em 0.6em; border-top: 1px solid var(--ae-line); }
.bl-key { position: absolute; top: 50%; width: 0.6em; height: 0.6em; background: var(--ae-fg);
  transform: translate(-50%, -50%) rotate(45deg); transition: left .5s ease, border-radius .3s; }
.bl-key.is-rove { width: 0.4em; height: 0.4em; border-radius: 50%; background: var(--ae-blue); }
.bl-head { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--ae-blue); }
`;

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  // Rove on: even speed in the middle, Easy Ease on the first and last keyframe.
  var V = 1 / (1 - EASE), dE = V * EASE / 2;
  function roveDist(u) {
    if (u < EASE) return V * u * u / (2 * EASE);
    if (u > 1 - EASE) return 1 - V * (1 - u) * (1 - u) / (2 * EASE);
    return V * (u - EASE / 2);
  }
  function roveTime(d) {                         // inverse of roveDist
    if (d < dE) return Math.sqrt(d * 2 * EASE / V);
    if (d > 1 - dE) return 1 - Math.sqrt((1 - d) * 2 * EASE / V);
    return d / V + EASE / 2;
  }
  // Rove off: keyframes evenly spaced in time, linear in between (first segment eased).
  function setDist(u) {
    var n = KEYS.length - 1, seg = Math.min(n - 1, Math.floor(u * n)), f = u * n - seg;
    if (seg === 0) f = f * f;                   // Easy Ease on the first keyframe
    else if (seg === n - 1) f = 1 - (1 - f) * (1 - f);   // … and on the last
    return KEYS[seg] + (KEYS[seg + 1] - KEYS[seg]) * f;
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['ball-loop'] = function (el) {
    var rove = el.dataset.variant === 'rove';
    if (rove) el.setAttribute('role', 'group');   // has a switch, so not a plain image
    if (!document.getElementById('demo-ball-loop')) {
      var st = document.createElement('style');
      st.id = 'demo-ball-loop';
      st.textContent = css;
      document.head.appendChild(st);
    }

    var dots = '';
    if (rove) for (var i = 0; i < FRAMES; i++) dots += '<circle class="bl-dot" r="9"/>';

    el.innerHTML = '<div class="bl">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
        '<rect width="' + W + '" height="' + H + '" fill="#55a8dd"/>' +
        '<circle cx="' + C.x + '" cy="' + C.y + '" r="' + R_OUT + '" fill="#cccccc"/>' +
        '<circle cx="' + C.x + '" cy="' + C.y + '" r="' + R_IN + '" fill="#55a8dd" stroke="#000" stroke-width="3"/>' +
        '<rect y="' + GROUND + '" width="' + W + '" height="' + (H - GROUND) + '" fill="#cccccc"/>' +
        '<path d="M0 ' + GROUND + ' H' + (C.x - FOOT).toFixed(0) + ' M' + (C.x + FOOT).toFixed(0) + ' ' + GROUND + ' H' + W + '" stroke="#000" stroke-width="3"/>' +
        '<path class="bl-path" d="' + PATH + '" fill="none" stroke="none"/>' +
        (rove ? '<path class="bl-trail" d="' + PATH + '"/>' + dots : '') +
        '<g class="bl-ball"><circle r="' + BALL + '" fill="#f8ec5a"/>' +
          '<circle cx="33" cy="-34" r="9" fill="none" stroke="#000" stroke-width="3"/>' +
          '<path d="M0 0 H68" stroke="#000" stroke-width="3"/></g>' +
      '</svg>' +
      (rove
        ? '<div class="bl-code"><label class="bl-toggle"><input type="checkbox" class="bl-rove" checked><span>Rove Across Time</span></label>' +
          '<span class="bl-status"></span></div>' +
          '<div class="bl-tl"><span class="bl-keys"></span><span class="bl-head"></span></div>'
        : '') +
      '</div>';

    var path = el.querySelector('.bl-path'), L = path.getTotalLength();
    var ball = el.querySelector('.bl-ball');
    var box = el.querySelector('.bl-rove'), status = el.querySelector('.bl-status');
    var head = el.querySelector('.bl-head'), keysEl = el.querySelector('.bl-keys');
    var dotEls = el.querySelectorAll('.bl-dot');

    function isRove() { return !box || box.checked; }
    function dist(u) { return isRove() ? roveDist(u) : setDist(u); }

    function place(d) {
      var l = clamp01(d) * L;
      var p = path.getPointAtLength(l);
      var a = path.getPointAtLength(Math.max(0, l - 4)), b = path.getPointAtLength(Math.min(L, l + 4));
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;   // Orient Along Path
      ball.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    }

    function layout() {
      if (!rove) return;
      var on = isRove();
      // frame dots: one per frame, closer together where the ball is slow
      dotEls.forEach(function (d, i) {
        var p = path.getPointAtLength(clamp01(dist(i / (FRAMES - 1))) * L);
        d.setAttribute('cx', p.x.toFixed(1)); d.setAttribute('cy', p.y.toFixed(1));
      });
      var h = '';
      KEYS.forEach(function (k, i) {
        var u = on ? roveTime(k) : i / (KEYS.length - 1);
        var mid = i > 0 && i < KEYS.length - 1;
        h += '<i class="bl-key' + (on && mid ? ' is-rove' : '') + '" style="left:' + (u * MOVE / DUR * 100).toFixed(2) + '%"></i>';
      });
      keysEl.innerHTML = h;
      status.textContent = on ? 'Even speed' : 'Keyframes as set: the speed jumps';
    }
    if (box) {
      box.addEventListener('change', function () { layout(); if (el.classList.contains('is-paused')) draw(t); });
      layout();
    }

    function draw(sec) {
      place(dist(clamp01(sec / MOVE)));
      if (head) head.style.left = (sec / DUR * 100) + '%';
    }

    var t = 2.4, lastNow = null;
    draw(t);
    function tick(now) {
      if (el.classList.contains('is-paused')) { lastNow = null; }
      else {
        if (lastNow !== null) t = (t + (now - lastNow) / 1000) % DUR;
        lastNow = now;
        draw(t);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
})();
