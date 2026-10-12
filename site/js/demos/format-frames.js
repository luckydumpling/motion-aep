/*
 * Demo: format-frames
 * Four common formats side by side at the same height. The same circle moves
 * across each one: the space you animate in changes with the format.
 */
(function () {
  'use strict';

  var FORMATS = [
    { r: '16:9', w: 1920, h: 1080, use: 'Screens, YouTube' },
    { r: '9:16', w: 1080, h: 1920, use: 'Stories, Reels' },
    { r: '1:1', w: 1080, h: 1080, use: 'Feed' },
    { r: '4:5', w: 1080, h: 1350, use: 'Feed portrait' }
  ];
  var DUR = 3200;

  var css = `
.ff { background: #1b1b1b; border-radius: var(--radius); padding: 1em 0.9em 0.8em; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none;
  display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; gap: 1em 1.2em; }
.ff-item { display: grid; gap: 0.5em; justify-items: center; }
.ff-frame { position: relative; height: 8.5em; background: #000; outline: 1px solid var(--ae-line); overflow: hidden; }
.ff-dot { position: absolute; top: 50%; width: 1.3em; height: 1.3em; margin: -0.65em 0 0 -0.65em; border-radius: 50%; background: var(--ae-blue); }
.ff-label { text-align: center; line-height: 1.4; }
.ff-label b { color: #fff; font-weight: 600; }
.ff-label span { display: block; opacity: 0.65; }
`;

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['format-frames'] = function (el) {
    if (!document.getElementById('demo-format-frames')) {
      var st = document.createElement('style');
      st.id = 'demo-format-frames';
      st.textContent = css;
      document.head.appendChild(st);
    }
    el.innerHTML = '<div class="ff">' + FORMATS.map(function (f) {
      return '<div class="ff-item"><div class="ff-frame" style="aspect-ratio:' + f.w + ' / ' + f.h + '"><span class="ff-dot"></span></div>' +
        '<div class="ff-label"><b>' + f.r + '</b> · ' + f.w + '×' + f.h + '<span>' + f.use + '</span></div></div>';
    }).join('') + '</div>';

    var dots = el.querySelectorAll('.ff-dot');
    function draw(t) {
      var k = t / DUR;
      var p = ease(k < 0.5 ? k * 2 : 2 - k * 2);   // there and back
      dots.forEach(function (d) { d.style.left = (15 + 70 * p) + '%'; });
    }

    var t = 0, lastNow = null;
    draw(DUR * 0.25);
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
