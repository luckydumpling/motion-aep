/*
 * Demo: keyframe-click
 * One Easy Ease keyframe in the Timeline. ⌘-click (Windows: Ctrl-click) on it:
 * the keyframe gets selected and switches to linear.
 */
(function () {
  'use strict';

  var css = `
.kc { position: relative; background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none; }
.kc-ruler { position: relative; height: 2.2em; border-bottom: 1px solid var(--ae-line); }
.kc-ruler span { position: absolute; top: 0.35em; transform: translateX(-50%); }
.kc-ruler i { position: absolute; bottom: 0; width: 1px; height: 0.4em; background: var(--ae-fg); }
.kc-area { height: 0.35em; background: #2f8f3a; }
.kc-layer { height: 1.9em; background: #7a4545; border-bottom: 1px solid #1b1b1b; }
.kc-prop { position: relative; height: 3em; border-bottom: 1px solid var(--ae-line); }
.kc-empty { height: 2.2em; }
.kc-head { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--ae-blue); }
.kc-head::before { content: ""; position: absolute; top: 0.9em; left: -0.45em; width: 0.9em; height: 0.75em; background: var(--ae-blue);
  clip-path: polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%); }
.kc-key { position: absolute; top: 50%; width: 1.7em; height: 1.7em; transform: translate(-50%, -50%); overflow: visible; transition: transform .15s; }
.kc-key path { fill: #c8c8c8; stroke: transparent; stroke-width: 1.4; transition: fill .15s, stroke .15s; }
.kc-key.is-sel path { fill: #9ec4ff; stroke: var(--ae-blue); }
.kc-key.is-pop { transform: translate(-50%, -50%) scale(1.25); }
.kc-ring { position: absolute; left: 0; top: 0; width: 2.4em; height: 2.4em; margin: -1.2em 0 0 -1.2em; border-radius: 50%;
  border: 2px solid #fff; opacity: 0; pointer-events: none; }
.kc-cursor { position: absolute; left: 0; top: 0; width: 1.15em; height: 1.15em; pointer-events: none; }
.kc-cursor path { fill: #fff; stroke: #000; stroke-width: 1; }
.kc-bar { display: flex; align-items: center; gap: 0.75em; padding: 0.45em 0.7em; border-top: 1px solid var(--ae-line); }
.kc-status { flex: 1; min-width: 0; }
.kc-mod { border: 1px solid var(--ae-line); border-bottom-width: 2px; border-radius: 3px; padding: 0 0.4em; opacity: 0.35; transition: opacity .15s, background .15s; }
.kc-mod.is-on { opacity: 1; background: var(--ae-blue); border-color: var(--ae-blue); color: #fff; }
`;

  var EASE = 'M1 1 H11 L6 6 L11 11 H1 L6 6 Z';
  var LINEAR = 'M6 0.5 L11.5 6 L6 11.5 L0.5 6 Z';
  var KEY_X = 0.45;                 // keyframe position across the track
  var DUR = 5400, CLICK = 1150;

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function clamp(x) { return Math.max(0, Math.min(1, x)); }
  function isMac() {
    var b = document.querySelector('[data-os][aria-pressed="true"]');
    if (b) return b.dataset.os === 'mac';
    return /mac|iphone|ipad/i.test(navigator.platform || '');
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['keyframe-click'] = function (el) {
    if (!document.getElementById('demo-keyframe-click')) {
      var st = document.createElement('style');
      st.id = 'demo-keyframe-click';
      st.textContent = css;
      document.head.appendChild(st);
    }
    el.innerHTML =
      '<div class="kc">' +
        '<div class="kc-ruler"><span style="left:15%">10s</span><i style="left:15%"></i><span style="left:75%">12s</span><i style="left:75%"></i></div>' +
        '<div class="kc-area"></div><div class="kc-layer"></div>' +
        '<div class="kc-prop"><svg class="kc-key" viewBox="0 0 12 12" style="left:' + (KEY_X * 100) + '%" aria-hidden="true"><path d="' + EASE + '"/></svg></div>' +
        '<div class="kc-empty"></div>' +
        '<span class="kc-head" style="left:' + (KEY_X * 100) + '%"></span>' +
        '<span class="kc-ring"></span>' +
        '<svg class="kc-cursor" viewBox="0 0 12 16" aria-hidden="true"><path d="M1 1 L1 13 L4 10 L6.5 15 L8.5 14 L6 9 L10 9 Z"/></svg>' +
        '<div class="kc-bar"><span class="kc-status"></span><span class="kc-mod"></span></div>' +
      '</div>';

    var box = el.querySelector('.kc');
    var key = el.querySelector('.kc-key');
    var keyPath = key.querySelector('path');
    var ring = el.querySelector('.kc-ring');
    var cursor = el.querySelector('.kc-cursor');
    var status = el.querySelector('.kc-status');
    var mod = el.querySelector('.kc-mod');

    function points() {
      var b = box.getBoundingClientRect(), k = key.getBoundingClientRect();
      return {
        idle: { x: b.width * 0.85, y: b.height * 0.78 },
        key: { x: k.left - b.left + k.width / 2, y: k.top - b.top + k.height / 2 }
      };
    }

    function draw(t) {
      var P = points(), pos;
      if (t < 900) pos = mix(P.idle, P.key, ease(t / 900));
      else if (t < 3900) pos = P.key;
      else pos = mix(P.key, P.idle, ease(clamp((t - 3900) / 800)));

      var linear = t >= CLICK && t < 4900;
      keyPath.setAttribute('d', linear ? LINEAR : EASE);
      key.classList.toggle('is-sel', linear);
      key.classList.toggle('is-pop', t >= CLICK && t < CLICK + 150);

      var r = t >= CLICK && t < CLICK + 400 ? (t - CLICK) / 400 : -1;
      ring.style.opacity = r < 0 ? '0' : String(1 - r);
      ring.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px) scale(' + (0.4 + Math.max(r, 0) * 0.9) + ')';
      cursor.style.transform = 'translate(' + (pos.x + 2) + 'px,' + (pos.y + 2) + 'px)';

      var mac = isMac();
      mod.textContent = mac ? '⌘' : 'Ctrl';
      mod.classList.toggle('is-on', t >= 800 && t < 1500);
      status.textContent = t < 800 ? 'Easy Ease keyframe'
        : t < CLICK ? (mac ? '⌘-click the keyframe' : 'Ctrl-click the keyframe')
        : t < 4900 ? 'Linear keyframe' : '';
    }
    function mix(a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }

    var t = 0, lastNow = null;
    function still() { draw(2500); }
    still();
    window.addEventListener('resize', function () { if (el.classList.contains('is-paused')) still(); });
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
