/*
 * Demo: masking-set
 * One circle, four techniques: Mask, Track Matte, Linear Wipe, Trim Paths.
 * Pure CSS animation; the page pauses it by adding .is-paused.
 */
(function () {
  'use strict';

  var css = `
.ms-stage { background: var(--bg); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 1.25rem 1rem 0.9rem; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
@media (max-width: 480px) { .ms-stage { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 1.25rem; } }
.ms-item { margin: 0; display: grid; gap: 0.6rem; justify-items: center; }
.ms-item figcaption { font-family: var(--font-mono); font-size: var(--tiny); color: var(--muted); text-align: center; }
.ms-cell { width: min(100%, 7rem); aspect-ratio: 1; position: relative; }
.ms-disc { position: absolute; inset: 8%; border-radius: 50%; background: var(--shape); }
.ms-mask .ms-disc { animation: ms-mask 3s ease-in-out infinite alternate; }
@keyframes ms-mask { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 50% 0 0); } }
.ms-matte .ms-window { position: absolute; inset: 0; border: 1.5px dashed var(--shape-2); opacity: 0.35;
  animation: ms-slide 3s ease-in-out infinite alternate; }
.ms-matte .ms-disc { animation: ms-slide 3s ease-in-out infinite alternate; }
@keyframes ms-slide { from { clip-path: inset(0 100% 0 -40%); } to { clip-path: inset(0 -40% 0 100%); } }
.ms-wipe .ms-disc { animation: ms-wipe 3s ease-in-out infinite alternate; }
@keyframes ms-wipe { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(0 0 0 100%); } }
.ms-trim svg { position: absolute; inset: 8%; width: 84%; height: 84%; transform: rotate(-90deg); overflow: visible; }
.ms-trim circle { fill: none; stroke: var(--shape); stroke-width: 9; stroke-linecap: round; stroke-dasharray: 252;
  animation: ms-trim 3s ease-in-out infinite alternate; }
@keyframes ms-trim { from { stroke-dashoffset: 252; } to { stroke-dashoffset: 0; } }
`;

  function addStyle() {
    if (document.getElementById('demo-masking-set')) return;
    var s = document.createElement('style');
    s.id = 'demo-masking-set';
    s.textContent = css;
    document.head.appendChild(s);
  }

  window.AEDemos = window.AEDemos || {};
  window.AEDemos['masking-set'] = function (el) {
    addStyle();
    el.innerHTML =
      '<div class="ms-stage">' +
        '<figure class="ms-item ms-mask"><div class="ms-cell"><div class="ms-disc"></div></div><figcaption>Mask</figcaption></figure>' +
        '<figure class="ms-item ms-matte"><div class="ms-cell"><div class="ms-window"></div><div class="ms-disc"></div></div><figcaption>Track Matte</figcaption></figure>' +
        '<figure class="ms-item ms-wipe"><div class="ms-cell"><div class="ms-disc"></div></div><figcaption>Linear Wipe</figcaption></figure>' +
        '<figure class="ms-item ms-trim"><div class="ms-cell"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40"/></svg></div><figcaption>Trim Paths</figcaption></figure>' +
      '</div>';
  };
})();
