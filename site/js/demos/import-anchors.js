/*
 * Demo: import-anchors
 * The same three shapes rotate in two comps.
 * Composition: every layer is as big as the comp, so all anchor points sit in the middle of the comp.
 * Composition – Retain Layer Sizes: every layer is as big as its shape, so it turns around itself.
 */
(function () {
  'use strict';

  var SHAPES = [
    { kind: 'circle', x: 38, y: 34 },
    { kind: 'square', x: 82, y: 60 },
    { kind: 'tri', x: 124, y: 32 }
  ];
  var CX = 80, CY = 45;          // comp centre in a 160 × 90 frame
  var DUR = 4000;

  var css = `
.ia { background: #1b1b1b; border-radius: var(--radius); padding: 0.9em; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13em), 1fr)); gap: 0.9em; }
.ia-item { display: grid; gap: 0.5em; }
.ia-item svg { display: block; width: 100%; height: auto; background: #000; outline: 1px solid var(--ae-line); }
.ia-shape { fill: var(--ae-blue); }
.ia-anchor { fill: none; stroke: #ffd24a; stroke-width: 1; }
.ia-label b { color: #fff; font-weight: 600; display: block; }
.ia-label span { opacity: 0.7; }
`;

  function shapeSvg(s) {
    if (s.kind === 'circle') return '<circle class="ia-shape" cx="' + s.x + '" cy="' + s.y + '" r="9"/>';
    if (s.kind === 'square') return '<rect class="ia-shape" x="' + (s.x - 8) + '" y="' + (s.y - 8) + '" width="16" height="16"/>';
    return '<polygon class="ia-shape" points="' + s.x + ',' + (s.y - 10) + ' ' + (s.x + 10) + ',' + (s.y + 8) + ' ' + (s.x - 10) + ',' + (s.y + 8) + '"/>';
  }
  function anchor(x, y) {
    return '<g class="ia-anchor"><circle cx="' + x + '" cy="' + y + '" r="3"/><path d="M' + (x - 6) + ' ' + y + 'H' + (x + 6) + 'M' + x + ' ' + (y - 6) + 'V' + (y + 6) + '"/></g>';
  }
  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['import-anchors'] = function (el) {
    if (!document.getElementById('demo-import-anchors')) {
      var st = document.createElement('style');
      st.id = 'demo-import-anchors';
      st.textContent = css;
      document.head.appendChild(st);
    }
    function comp(retain) {
      var groups = SHAPES.map(function (s) {
        var px = retain ? s.x : CX, py = retain ? s.y : CY;
        return '<g class="ia-g" data-px="' + px + '" data-py="' + py + '">' + shapeSvg(s) + '</g>';
      }).join('');
      var anchors = retain ? SHAPES.map(function (s) { return anchor(s.x, s.y); }).join('') : anchor(CX, CY);
      return '<svg viewBox="0 0 160 90" aria-hidden="true">' + groups + anchors + '</svg>';
    }
    el.innerHTML = '<div class="ia">' +
      '<div class="ia-item">' + comp(false) + '<div class="ia-label"><b>Composition</b><span>Anchor points in the middle of the comp</span></div></div>' +
      '<div class="ia-item">' + comp(true) + '<div class="ia-label"><b>Composition – Retain Layer Sizes</b><span>Anchor point in the middle of each shape</span></div></div>' +
      '</div>';

    var groups = el.querySelectorAll('.ia-g');
    function draw(t) {
      var k = t / DUR;
      var a = 90 * ease(k < 0.5 ? k * 2 : 2 - k * 2);
      groups.forEach(function (g) {
        g.setAttribute('transform', 'rotate(' + a.toFixed(2) + ' ' + g.dataset.px + ' ' + g.dataset.py + ')');
      });
    }

    var t = 0, lastNow = null;
    draw(DUR * 0.3);
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
