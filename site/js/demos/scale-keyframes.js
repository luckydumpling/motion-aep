/*
 * Demo: scale-keyframes
 * Play the animation, Alt-drag the last keyframe to halve the spacing,
 * play again: same playhead speed, the square arrives in half the time.
 */
(function () {
  'use strict';

  var css = `
.sk { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.sk-view { position: relative; height: 5.5em; background: #1b1b1b; }
.sk-sq { position: absolute; top: 50%; width: 1.6em; height: 1.6em; margin-top: -0.8em; background: var(--ae-blue); border-radius: 2px; }
.sk-bar { display: flex; align-items: center; gap: 0.75em; padding: 0.45em 0.7em; border-top: 1px solid var(--ae-line); }
.sk-status { flex: 1; min-width: 0; }
.sk-alt { border: 1px solid var(--ae-line); border-bottom-width: 2px; border-radius: 3px; padding: 0 0.4em; opacity: 0.35; transition: opacity .15s, background .15s; }
.sk-alt.is-on { opacity: 1; background: var(--ae-blue); border-color: var(--ae-blue); color: #fff; }
.sk-tl { position: relative; height: 3.4em; margin: 0 0.7em 0.6em; border-top: 1px solid var(--ae-line);
  background: repeating-linear-gradient(90deg, var(--ae-line) 0 1px, transparent 1px 10%) 0 0 / 100% 0.45em no-repeat; }
.sk-row { position: absolute; left: 0; right: 0; top: 1.6em; height: 1px; background: var(--ae-line); }
.sk-key { position: absolute; top: 1.6em; width: 0.7em; height: 0.7em; background: var(--ae-fg); transform: translate(-50%, -50%) rotate(45deg); }
.sk-key.is-drag { background: var(--ae-blue); box-shadow: 0 0 0 2px #1b1b1b, 0 0 0 3px var(--ae-blue); }
.sk-head { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--ae-blue); }
.sk-head::before { content: ""; position: absolute; top: 0; left: -0.35em; border: 0.35em solid transparent; border-top-color: var(--ae-blue); }
`;

  var DUR = 7000;
  var BASE = [0.04, 0.24, 0.44, 0.64, 0.84];

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['scale-keyframes'] = function (el) {
    if (!document.getElementById('demo-scale-keyframes')) {
      var s = document.createElement('style');
      s.id = 'demo-scale-keyframes';
      s.textContent = css;
      document.head.appendChild(s);
    }
    var keys = BASE.map(function (_, i) { return '<i class="sk-key' + (i === BASE.length - 1 ? ' sk-last' : '') + '"></i>'; }).join('');
    el.innerHTML =
      '<div class="sk">' +
        '<div class="sk-view"><span class="sk-sq"></span></div>' +
        '<div class="sk-bar"><span class="sk-status"></span><span class="sk-alt">⌥ Alt</span></div>' +
        '<div class="sk-tl"><span class="sk-row"></span>' + keys + '<span class="sk-head"></span></div>' +
      '</div>';

    var sq = el.querySelector('.sk-sq');
    var status = el.querySelector('.sk-status');
    var alt = el.querySelector('.sk-alt');
    var keyEls = el.querySelectorAll('.sk-key');
    var head = el.querySelector('.sk-head');

    function draw(t) {
      var scale, p, text, altOn = false;
      if (t < 2400) { scale = 1; p = t / 2400; text = 'Original timing'; }
      else if (t < 3600) { scale = 1 - 0.5 * ease((t - 2400) / 1200); p = 0; text = 'Alt-drag the last keyframe'; altOn = true; }
      else if (t < 6000) { scale = 0.5; p = (t - 3600) / 2400; text = 'Twice as fast'; }
      else { scale = 0.5 + 0.5 * ease((t - 6000) / 1000); p = 0; text = ''; }

      var k0 = BASE[0];
      var pos = BASE.map(function (b) { return k0 + (b - k0) * scale; });
      keyEls.forEach(function (k, i) {
        k.style.left = (pos[i] * 100) + '%';
        k.classList.toggle('is-drag', altOn && i === pos.length - 1);
      });
      var last = pos[pos.length - 1];
      var q = clamp((p - k0) / (last - k0));
      sq.style.left = 'calc(' + (6 + q * 84) + '% - 0.8em)';
      head.style.left = (p * 100) + '%';
      status.textContent = text;
      alt.classList.toggle('is-on', altOn);
    }

    var t = 0, lastNow = null;
    draw(4800);
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
