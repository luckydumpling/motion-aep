/*
 * Demo: alpha
 * The same render placed over other footage in an editing program.
 * RGB: the black background covers everything below.
 * RGB + Alpha: only the shape covers, the rest stays transparent.
 */
(function () {
  'use strict';

  var DUR = 3600;
  var css = `
.al { background: #1b1b1b; border-radius: var(--radius); padding: 0.9em; font-family: var(--font-mono);
  font-size: clamp(0.625rem, 0.5rem + 0.4vw, 0.75rem); color: var(--ae-fg); user-select: none;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13em), 1fr)); gap: 0.9em; }
.al-item { display: grid; gap: 0.5em; }
.al-item svg { display: block; width: 100%; height: auto; outline: 1px solid var(--ae-line); }
.al-shape { fill: var(--ae-blue); }
.al-label b { color: #fff; font-weight: 600; display: block; }
.al-label span { opacity: 0.7; }
`;

  // Footage underneath: simple stripes in the site's colours
  var BELOW =
    '<rect width="160" height="90" fill="#ff9f45"/>' +
    '<rect y="30" width="160" height="30" fill="#e8e8e8"/>' +
    '<rect y="60" width="160" height="30" fill="#5c6370"/>';

  function ease(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['alpha'] = function (el) {
    if (!document.getElementById('demo-alpha')) {
      var st = document.createElement('style');
      st.id = 'demo-alpha';
      st.textContent = css;
      document.head.appendChild(st);
    }
    el.innerHTML = '<div class="al">' +
      '<div class="al-item"><svg viewBox="0 0 160 90" aria-hidden="true">' + BELOW +
        '<rect x="30" y="15" width="100" height="60" fill="#000"/><circle class="al-shape" cy="45" r="11"/></svg>' +
        '<div class="al-label"><b>RGB</b><span>The black background covers the footage below</span></div></div>' +
      '<div class="al-item"><svg viewBox="0 0 160 90" aria-hidden="true">' + BELOW +
        '<rect x="30" y="15" width="100" height="60" fill="none" stroke="#000" stroke-dasharray="3 3" stroke-width="0.8"/><circle class="al-shape" cy="45" r="11"/></svg>' +
        '<div class="al-label"><b>RGB + Alpha</b><span>Only the shape covers, the rest stays transparent</span></div></div>' +
      '</div>';

    var dots = el.querySelectorAll('.al-shape');
    function draw(t) {
      var k = t / DUR, p = ease(k < 0.5 ? k * 2 : 2 - k * 2);
      dots.forEach(function (d) { d.setAttribute('cx', (44 + 72 * p).toFixed(2)); });
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
