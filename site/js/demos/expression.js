/*
 * Demo: expression
 *   demo:expression/time    time * N on Rotation        (N editable)
 *   demo:expression/wiggle  wiggle(freq, amp) on Position (both editable)
 *   demo:expression/loop    loopOut("cycle") on a Scale pulse (switch on/off)
 *   demo:expression/all     the three shapes from the exercise, side by side
 * The viewer stands for a 1920 × 1080 comp, so pixel values match After Effects.
 */
(function () {
  'use strict';

  var VW = 320, VH = 110, SCALE = VW / 1920;   // viewer units per comp pixel
  var FPS = 25;

  var css = `
.ex { background: var(--ae-bg); border-radius: var(--radius); overflow: hidden; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); }
.ex svg { display: block; width: 100%; height: auto; background: #1b1b1b; }
.ex-shape { fill: var(--ae-blue); }
.ex-tag { fill: var(--ae-fg); font-family: var(--font-mono); font-size: 8px; text-anchor: middle; opacity: .8; }
.ex-code { padding: 0.55em 0.7em; border-top: 1px solid var(--ae-line); color: #e8e8e8; display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.15em; }
.ex-code .ex-prop { color: var(--ae-fg); margin-right: 0.6em; }
.ex-in { width: 4.2ch; font: inherit; color: var(--ae-blue); background: transparent; border: 0; border-bottom: 1px dashed var(--ae-blue);
  padding: 0; text-align: center; -moz-appearance: textfield; }
.ex-in::-webkit-outer-spin-button, .ex-in::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ex-in:focus { outline: 1px solid var(--ae-blue); outline-offset: 2px; }
.ex-toggle { display: inline-flex; align-items: center; gap: 0.45em; cursor: pointer; }
.ex-toggle input { accent-color: var(--ae-blue); margin: 0; }
.ex-toggle.is-off span { opacity: .4; text-decoration: line-through; }
.ex-bar { padding: 0.4em 0.7em; border-top: 1px solid var(--ae-line); font-variant-numeric: tabular-nums; }
.ex-bar b { color: var(--ae-blue); font-weight: 500; }
.ex-tl { position: relative; height: 1.9em; margin: 0 0.7em 0.5em; border-top: 1px solid var(--ae-line); }
.ex-key { position: absolute; top: 50%; width: 0.6em; height: 0.6em; background: var(--ae-fg); transform: translate(-50%, -50%) rotate(45deg); }
.ex-key.is-ghost { background: transparent; border: 1px solid var(--ae-fg); opacity: .5; }
.ex-head { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--ae-blue); }
.ex-ruler { position: relative; height: 1.3em; margin: 0 0.7em 0.3em; opacity: .6; }
.ex-ruler span { position: absolute; transform: translateX(-50%); }
.ex-ruler span:first-child { transform: none; }
.ex-ruler span:last-child { transform: translateX(-100%); }
`;

  /* ---------- the three expressions ---------- */

  function rotationAt(sec, perSec) { return sec * perSec; }

  // Smooth random noise (-1 … 1), like wiggle: a new random target `freq` times per second.
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
  function noise(seed, x) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    var a = hash(i + seed * 1000), b = hash(i + 1 + seed * 1000);
    return a + (b - a) * u;
  }
  function wiggleAt(sec, freq, amp) { return { x: noise(1, sec * freq) * amp, y: noise(2, sec * freq) * amp }; }

  // Scale keyframes: 100 % → 50 % → 100 % over 6 frames (3 + 3).
  var PULSE = 6 / FPS;
  function scaleAt(sec, loop) {
    var s = loop ? sec % PULSE : Math.min(sec, PULSE);
    var half = PULSE / 2;
    return s < half ? 100 - 50 * (s / half) : 50 + 50 * ((s - half) / half);
  }

  function fmtRotation(a) {
    var turns = a < 0 ? Math.ceil(a / 360) : Math.floor(a / 360);
    return turns + 'x' + (a - turns * 360 >= 0 ? '+' : '') + (a - turns * 360).toFixed(1) + '°';
  }
  function num(input, min, max, fallback) {
    var v = parseFloat(input.value);
    if (isNaN(v)) return fallback;
    return Math.max(min, Math.min(max, v));
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['expression'] = function (el) {
    var kind = el.dataset.variant || 'time';
    if (!document.getElementById('demo-expression')) {
      var st = document.createElement('style');
      st.id = 'demo-expression';
      st.textContent = css;
      document.head.appendChild(st);
    }
    if (kind !== 'all') { el.setAttribute('role', 'group'); }

    var cx = VW / 2, cy = VH / 2, html = '';
    if (kind === 'time') {
      html = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true"><rect class="ex-shape ex-a" x="-16" y="-16" width="32" height="32"/></svg>' +
        '<div class="ex-code"><span class="ex-prop">Rotation</span>time * <input class="ex-in ex-n" type="number" value="90" step="10" aria-label="Degrees per second"></div>' +
        '<div class="ex-bar">Rotation <b class="ex-out"></b></div>';
    } else if (kind === 'wiggle') {
      html = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true"><circle class="ex-shape ex-a" r="9"/></svg>' +
        '<div class="ex-code"><span class="ex-prop">Position</span>wiggle(<input class="ex-in ex-f" type="number" value="2" step="1" aria-label="How often per second">, <input class="ex-in ex-m" type="number" value="50" step="10" aria-label="How far in pixels">)</div>' +
        '<div class="ex-bar">Position <b class="ex-out"></b></div>';
    } else if (kind === 'loop') {
      html = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true"><circle class="ex-shape ex-a" r="20"/></svg>' +
        '<div class="ex-code"><span class="ex-prop">Scale</span><label class="ex-toggle"><input type="checkbox" class="ex-loop" checked><span>loopOut("cycle")</span></label></div>' +
        '<div class="ex-bar">Scale <b class="ex-out"></b></div>' +
        '<div class="ex-tl"><span class="ex-keys"></span><span class="ex-head"></span></div>' +
        '<div class="ex-ruler"><span style="left:0">0s</span><span style="left:50%">0.5s</span><span style="left:100%">1s</span></div>';
    } else {
      html = '<svg viewBox="0 0 ' + VW + ' ' + VH + '" aria-hidden="true">' +
        '<rect class="ex-shape ex-a" x="-12" y="-12" width="24" height="24"/>' +
        '<circle class="ex-shape ex-b" r="10"/>' +
        '<circle class="ex-shape ex-c" r="13"/>' +
        '<text class="ex-tag" x="60" y="100">time*90</text><text class="ex-tag" x="160" y="100">wiggle(2, 50)</text><text class="ex-tag" x="260" y="100">loopOut("cycle")</text>' +
        '</svg>';
    }
    el.innerHTML = '<div class="ex">' + html + '</div>';

    var a = el.querySelector('.ex-a'), b = el.querySelector('.ex-b'), c = el.querySelector('.ex-c');
    var out = el.querySelector('.ex-out');
    var inN = el.querySelector('.ex-n'), inF = el.querySelector('.ex-f'), inM = el.querySelector('.ex-m');
    var loopBox = el.querySelector('.ex-loop');
    var keys = el.querySelector('.ex-keys'), head = el.querySelector('.ex-head');

    function drawKeys() {
      if (!keys) return;
      var on = loopBox.checked, h = '';
      for (var k = 0; k * PULSE / 2 <= 1.0001; k++) {
        var real = k <= 2;
        if (!real && !on) break;
        h += '<i class="ex-key' + (real ? '' : ' is-ghost') + '" style="left:' + (k * PULSE / 2 * 100) + '%"></i>';
      }
      keys.innerHTML = h;
      loopBox.closest('.ex-toggle').classList.toggle('is-off', !on);
    }
    if (loopBox) { loopBox.addEventListener('change', drawKeys); drawKeys(); }

    function draw(sec) {
      if (kind === 'time') {
        var rot = rotationAt(sec, num(inN, -720, 720, 90));
        a.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') rotate(' + rot.toFixed(2) + ')');
        out.textContent = fmtRotation(rot);
      } else if (kind === 'wiggle') {
        var w = wiggleAt(sec, num(inF, 0, 10, 2), num(inM, 0, 300, 50));
        a.setAttribute('transform', 'translate(' + (cx + w.x * SCALE).toFixed(2) + ' ' + (cy + w.y * SCALE).toFixed(2) + ')');
        out.textContent = (960 + w.x).toFixed(1) + ', ' + (540 + w.y).toFixed(1);
      } else if (kind === 'loop') {
        var t1 = sec % 1, sc = scaleAt(t1, loopBox.checked);
        a.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') scale(' + (sc / 100).toFixed(3) + ')');
        out.textContent = sc.toFixed(1) + ' %';
        head.style.left = (t1 * 100) + '%';
      } else {
        a.setAttribute('transform', 'translate(60 48) rotate(' + rotationAt(sec, 90).toFixed(2) + ')');
        var w2 = wiggleAt(sec, 2, 50);
        b.setAttribute('transform', 'translate(' + (160 + w2.x * SCALE).toFixed(2) + ' ' + (48 + w2.y * SCALE).toFixed(2) + ')');
        c.setAttribute('transform', 'translate(260 48) scale(' + (scaleAt(sec, true) / 100).toFixed(3) + ')');
      }
    }

    var t = 0, lastNow = null;
    draw(0.62);
    function tick(now) {
      if (el.classList.contains('is-paused')) { lastNow = null; }
      else {
        if (lastNow !== null) t += (now - lastNow) / 1000;
        lastNow = now;
        draw(t);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    // While paused, editing a value still updates the frame.
    el.addEventListener('input', function () { if (el.classList.contains('is-paused')) draw(t || 0.62); });
  };
})();
