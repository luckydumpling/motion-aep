#!/usr/bin/env node
/*
 * Build: content/*.md  →  _site/
 *
 * Each content file is one section page. Besides normal markdown, the files
 * use a few blocks:  :::step  :::tip  :::warning  :::exercise  :::shortcuts
 * :::more  :::demo   (see README.md for the syntax).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(ROOT, '_site');
const DEV = process.argv.includes('--dev');

const md = new MarkdownIt({ html: true, typographer: true });

/* ---------- helpers ---------- */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slug = (s) => String(s).toLowerCase()
  .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const inline = (s) => md.renderInline(s);

// Short stable id from a text (djb2)
const hash = (s) => {
  let h = 5381;
  for (const c of String(s).trim()) h = ((h << 5) + h + c.codePointAt(0)) >>> 0;
  return h.toString(36);
};

// "Right-click" follows the Mac/Win switch: Ctrl-click on Mac, right-click on Windows.
// Only text between tags is touched, never attributes or code.
const osWords = (html) => html.replace(/>([^<]+)</g, (m, text) =>
  '>' + text.replace(/\b([Rr])ight-click/g, (w, r) =>
    `<span class="os-word" data-mac="Ctrl-click" data-win="${r}ight-click">Ctrl-click</span>`) + '<');

/* ---------- folder trees ---------- */
// ```tree On disk          → a folder tree with an optional caption
// motion_design/           names ending in / are folders, 2 spaces = one level
//   aep/
const ICON_DIR = '<svg class="ic-dir" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3.5h4.2l1.5 1.5h7.3v7.5h-13z"/></svg>';
const ICON_FILE = '<svg class="ic-file" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9z"/></svg>';

function renderTree(src, label) {
  const lines = src.split('\n').filter((l) => l.trim());
  let html = '';
  let depth = -1;
  for (const line of lines) {
    const d = Math.floor(line.match(/^\s*/)[0].replace(/\t/g, '  ').length / 2);
    let name = line.trim();
    const isDir = name.endsWith('/');
    if (isDir) name = name.slice(0, -1);
    if (d > depth) html += '<ul>'.repeat(d - depth);
    else html += '</li>' + '</ul></li>'.repeat(depth - d);
    html += `<li><span class="node">${isDir ? ICON_DIR : ICON_FILE}${esc(name)}</span>`;
    depth = d;
  }
  if (depth >= 0) html += '</li>' + '</ul></li>'.repeat(depth) + '</ul>';
  const cap = label ? `<figcaption>${esc(label)}</figcaption>` : '';
  return `<figure class="tree"${label ? ` aria-label="${esc(label)}"` : ''}>${cap}${html}</figure>\n`;
}

const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
  const info = tokens[idx].info.trim();
  if (/^tree\b/.test(info)) return renderTree(tokens[idx].content, info.slice(4).trim());
  return defaultFence(tokens, idx, opts, env, self);
};

// Two or more trees in a row sit side by side.
const groupTrees = (html) => html.replace(/(?:<figure class="tree"[\s\S]*?<\/figure>\s*){2,}/g, (m) => `<div class="trees">${m}</div>`);

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

const template = (name) => fs.readFileSync(path.join(SITE, 'templates', name), 'utf8');
const fill = (tpl, data) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in data ? data[k] : ''));

/* ---------- keys and chips ---------- */

// A line that is only `inline code` becomes a chip (menu path, name, value)
// or a key (shortcut). "⌘I / Ctrl+I" becomes one key that follows the Mac/Win switch.
const KEY = /^(?:[⌘⌥⇧⌃][^\s]*|(?:Ctrl|Alt|Shift|Cmd|Option)\+\S+|F\d{1,2}|Space|Return|Enter|Tab|Esc|[A-Z0-9])$/;

function keyOrChip(text) {
  const parts = text.split(' / ');
  if (parts.length === 2 && KEY.test(parts[0]) && KEY.test(parts[1])) {
    return `<kbd data-mac="${esc(parts[0])}" data-win="${esc(parts[1])}">${esc(parts[0])}</kbd>`;
  }
  if (KEY.test(text)) return `<kbd>${esc(text)}</kbd>`;
  return `<span class="chip">${esc(text)}</span>`;
}

/* ---------- media ---------- */

function media(alt, src, ctx) {
  if (src.startsWith('demo:')) {
    // demo:name or demo:name/variant
    const [name, variant] = src.slice(5).split('/');
    ctx.demos.add(name);
    return `<figure class="media media-demo">
  <div class="demo" data-demo="${esc(name)}"${variant ? ` data-variant="${esc(variant)}"` : ''} role="img" aria-label="${esc(alt)}"></div>
  <figcaption class="media-bar"><button type="button" class="loop-btn">Pause</button></figcaption>
</figure>`;
  }
  const exists = fs.existsSync(path.join(CONTENT, src));
  const url = '../' + src;
  if (/\.mp4$/i.test(src)) {
    if (!exists) return placeholder(alt, 'Loop', src);
    return `<figure class="media media-video">
  <video src="${esc(url)}" autoplay muted loop playsinline preload="metadata" aria-label="${esc(alt)}"></video>
  <figcaption class="media-bar"><button type="button" class="loop-btn">Pause</button></figcaption>
</figure>`;
  }
  if (!exists) return placeholder(alt, 'Screenshot', src);
  return `<figure class="media media-img"><img src="${esc(url)}" alt="${esc(alt)}" loading="lazy"></figure>`;
}

function placeholder(alt, kind, src) {
  return `<figure class="media media-missing" role="img" aria-label="${esc(alt)}">
  <span>${kind} · ${esc(alt)}</span>
  <small>${esc(src)}</small>
</figure>`;
}

/* Split a block body into text, chips/keys and media, in order. */
function blockBody(lines, ctx) {
  const out = { text: [], extras: [], media: [] };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    let m;
    if ((m = line.match(/^`([^`]+)`$/))) out.extras.push(keyOrChip(m[1]));
    else if ((m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/))) out.media.push(media(m[1], m[2], ctx));
    else out.text.push(line);
  }
  return out;
}

/* ---------- blocks ---------- */

function renderStep(block, n, ctx) {
  const b = blockBody(block.lines, ctx);
  const hasMedia = b.media.length > 0;
  return `<li class="step${hasMedia ? ' has-media' : ''}">
  <span class="step-num">${String(n).padStart(2, '0')}</span>
  <div class="step-body">
    <h3 class="step-title">${inline(block.arg)}</h3>
    ${b.text.length ? `<p class="step-text">${inline(b.text.join(' '))}</p>` : ''}
    ${b.extras.join('\n    ')}
  </div>
  ${hasMedia ? `<div class="step-media">${b.media.join('')}</div>` : ''}
</li>`;
}

function renderNote(block, kind, ctx) {
  const b = blockBody(block.lines, ctx);
  return `<aside class="note ${kind}">
  <span class="note-label">${kind === 'tip' ? 'Tip' : 'Warning'}</span>
  <p>${inline(b.text.join(' '))}</p>
  ${b.extras.join('\n  ')}
</aside>`;
}

function renderExercise(block, ctx, page) {
  let starter = '', result = '';
  const rest = [];
  for (const line of block.lines) {
    const m = line.match(/^(starter|result):\s*(.*)$/);
    if (m) { if (m[1] === 'starter') starter = m[2].trim(); else result = m[2].trim(); }
    else rest.push(line);
  }
  const steps = rest.map((l) => l.match(/^\s*\d+\.\s+(.*)$/)).filter(Boolean).map((m) => m[1]);

  let starterHtml;
  if (!starter || starter === 'none' || starter === '–') {
    starterHtml = 'Same project, new comp in comps > maincomps';
  } else if (starter.startsWith('continue')) {
    const ch = starter.replace('continue', '').trim();
    const target = ctx.pages.find((p) => p.chapter === ch);
    starterHtml = target
      ? `Continue with your project from <a href="../${target.slug}/">${esc(ch)} ${esc(target.section)}</a>`
      : `Continue with your project from ${esc(ch)}`;
  } else {
    const file = starter.split(' ')[0];
    const note = starter.slice(file.length).trim();
    const exists = fs.existsSync(path.join(ROOT, file));
    starterHtml = exists
      ? `Starter file: <a href="../${esc(file)}">${esc(path.basename(file))}</a> ${esc(note)}`
      : `Starter file: ${esc(path.basename(file))} ${esc(note)} <span class="soon">coming soon</span>`;
  }

  let resultHtml = '';
  const treeBlock = rest.join('\n').match(/```tree ?([^\n]*)\n([\s\S]*?)```/);
  if (result === 'tree' && treeBlock) {
    // result: tree → the ```tree block inside the exercise is the expected result
    resultHtml = `<div class="result">
  <span class="result-label">Expected result</span>
  ${renderTree(treeBlock[2], treeBlock[1].trim())}
</div>`;
  } else if (result) {
    resultHtml = `<div class="result">
  <span class="result-label">Expected result</span>
  ${media('Expected result: ' + block.arg, result, ctx)}
</div>`;
  }

  // Ticks are stored by the step's text, so adding or removing a step later
  // doesn't shift them. Changing a step's wording resets only that one.
  const items = steps.map((s, i) => {
    const id = `ex${page.chapter}-${hash(s)}`;
    return `<li><label><input type="checkbox" id="${id}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${inline(s)}</span></label></li>`;
  }).join('\n');

  return `<section class="exercise" id="exercise" aria-labelledby="ex-title">
  <div class="exercise-head">
    <span class="note-label">Exercise</span>
    <h2 id="ex-title">${inline(block.arg)}</h2>
    <p class="ex-meta">${starterHtml}</p>
  </div>
  ${resultHtml}
  <ol class="checklist">
${items}
  </ol>
  <p class="progress" aria-live="polite"></p>
</section>`;
}

function renderShortcuts(block) {
  const rows = block.lines
    .filter((l) => l.trim().startsWith('|'))
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
    .filter((cells) => !/^-+$/.test(cells[0].replace(/:/g, '')))
    .slice(1); // drop header row
  const unwrap = (c) => c.replace(/`/g, '');
  const body = rows.map(([action, mac, win]) => {
    const keyMac = unwrap(mac || ''), keyWin = unwrap(win || mac || '');
    return `<tr><td>${inline(action)}</td><td><kbd data-mac="${esc(keyMac)}" data-win="${esc(keyWin)}">${esc(keyMac)}</kbd></td></tr>`;
  }).join('\n');
  return `<section class="block" id="shortcuts">
  <h2>Shortcuts</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>Action</th><th class="key-head">Mac</th></tr></thead>
    <tbody>
${body}
    </tbody>
  </table></div>
</section>`;
}

function renderMore(block) {
  return `<section class="block" id="more">
  <h2>More info</h2>
  <div class="more">${md.render(block.lines.join('\n'))}</div>
</section>`;
}

/* ---------- page parsing ---------- */

// Turn the body into a list of nodes: markdown text, headings and blocks.
function parse(body) {
  const nodes = [];
  const lines = body.split('\n');
  let buf = [];
  const flush = () => { if (buf.join('').trim()) nodes.push({ kind: 'md', text: buf.join('\n') }); buf = []; };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^:::(\w+)\s*(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    if (open) {
      flush();
      const block = { kind: 'block', type: open[1], arg: open[2].trim(), lines: [] };
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') { block.lines.push(lines[i]); i++; }
      nodes.push(block);
    } else if (h2) {
      flush();
      nodes.push({ kind: 'h2', text: h2[1].trim() });
    } else {
      buf.push(line);
    }
  }
  flush();
  return nodes;
}

function renderPage(page, ctx) {
  const nodes = parse(page.body);
  const toc = [];
  let introHtml = '';
  let main = '';
  let tail = '';        // exercise, shortcuts, more come after the sections
  let open = false;     // inside a <section class="topic">
  let steps = [];       // pending steps of the current list

  const flushSteps = () => {
    if (!steps.length) return;
    main += `<ol class="steps">\n${steps.join('\n')}\n</ol>\n`;
    steps = [];
  };
  let stepN = 0;
  let sawFirstText = false;

  for (const node of nodes) {
    if (node.kind === 'md') {
      flushSteps();
      let text = node.text;
      if (!sawFirstText && !open) {
        // The first paragraph is the intro.
        const parts = text.trim().split(/\n\s*\n/);
        introHtml = `<p class="intro prose">${inline(parts.shift())}</p>`;
        text = parts.join('\n\n');
        sawFirstText = true;
        if (!text.trim()) continue;
      }
      // An image on its own line becomes a media block (with placeholder if the file is missing).
      text = text.replace(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/gm, (_, alt, src) => '\n' + media(alt, src, ctx).replace(/\n\s*/g, '') + '\n');
      main += `<div class="prose">${groupTrees(md.render(fixMediaPaths(text)))}</div>\n`;
    } else if (node.kind === 'h2') {
      flushSteps();
      if (open) main += '</section>\n';
      const id = slug(node.text);
      toc.push({ id, label: node.text });
      main += `<section class="topic" id="${id}">\n<h2>${inline(node.text)}</h2>\n`;
      open = true;
      stepN = 0;
    } else if (node.type === 'step') {
      stepN++;
      steps.push(renderStep(node, stepN, ctx));
    } else {
      flushSteps();
      if (node.type === 'tip') main += renderNote(node, 'tip', ctx);
      else if (node.type === 'warning') main += renderNote(node, 'warning', ctx);
      else if (node.type === 'demo') main += media(node.lines.join(' ').trim() || node.arg, 'demo:' + node.arg, ctx);
      else if (node.type === 'exercise') { tail += renderExercise(node, ctx, page); toc.push({ id: 'exercise', label: 'Exercise' }); }
      else if (node.type === 'shortcuts') { tail += renderShortcuts(node); toc.push({ id: 'shortcuts', label: 'Shortcuts' }); }
      else if (node.type === 'more') tail += renderMore(node);
      else console.warn(`  ! ${page.file}: unknown block :::${node.type}`);
    }
  }
  flushSteps();
  if (open) main += '</section>\n';
  return { introHtml, main: main + tail, toc };
}

// Images written as normal markdown inside text sections.
function fixMediaPaths(text) {
  return text.replace(/!\[([^\]]*)\]\((img|video)\//g, '![$1](../$2/');
}

function titleWithSquiggle(title) {
  const [first, ...rest] = title.split(' ');
  const word = first.replace(/[,.:;]$/, '');
  const punct = first.slice(word.length);
  return `<span class="squiggle">${esc(word)}<svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 6 C 12 1, 18 1, 26 5 S 42 9, 50 5 S 66 1, 74 5 S 90 9, 98 4"/></svg></span>${esc(punct)} ${esc(rest.join(' '))}`;
}

/* ---------- build ---------- */

function build() {
  const t0 = Date.now();
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  copyDir(path.join(SITE, 'css'), path.join(OUT, 'assets/css'));
  copyDir(path.join(SITE, 'js'), path.join(OUT, 'assets/js'));
  copyDir(path.join(SITE, 'fonts'), path.join(OUT, 'assets/fonts'));
  copyDir(path.join(CONTENT, 'img'), path.join(OUT, 'img'));
  copyDir(path.join(CONTENT, 'video'), path.join(OUT, 'video'));
  copyDir(path.join(ROOT, 'downloads'), path.join(OUT, 'downloads'));

  const files = fs.readdirSync(CONTENT).filter((f) => /^\d\d-.*\.md$/.test(f)).sort();
  const pages = files.map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
    return {
      file,
      slug: file.replace(/\.md$/, ''),
      chapter: String(data.chapter || file.slice(0, 2)),
      section: data.section || '',
      title: data.title || '',
      readTime: data.read_time || '',
      outcomes: data.outcomes || [],
      body: content,
    };
  });

  const pageTpl = template('page.html');
  const reload = DEV ? '<script>new EventSource("/__reload").onmessage = () => location.reload();</script>' : '';

  // Pass 1: render every page, so the sidebar knows all sections and exercise sizes.
  const rendered = pages.map((page) => {
    const ctx = { demos: new Set(), pages };
    const r = renderPage(page, ctx);
    r.ctx = ctx;
    r.exerciseKeys = [...r.main.matchAll(/<input type="checkbox" id="([^"]+)"/g)].map((m) => m[1]);
    return r;
  });

  // Course sidebar: all chapters; the current one opens to show its sections.
  function sidebar(current, root) {
    const items = pages.map((p, i) => {
      const isCurrent = i === current;
      const sub = isCurrent
        ? `\n      <ol class="side-sub">\n${rendered[i].toc.map((t) => `        <li><a href="#${t.id}">${esc(t.label)}</a></li>`).join('\n')}\n      </ol>`
        : '';
      return `    <li class="side-item${isCurrent ? ' is-current' : ''}" data-chapter="${esc(p.chapter)}" data-keys="${rendered[i].exerciseKeys.join(' ')}">
      <a class="side-link" href="${root}${p.slug}/"${isCurrent ? ' aria-current="page"' : ''}><span class="side-num">${esc(p.chapter)}</span><span class="side-name">${esc(p.section)}</span><span class="side-done" aria-label="Exercise done" hidden>✓</span></a>${sub}
    </li>`;
    }).join('\n');
    const label = current >= 0 ? `${pages[current].chapter} ${pages[current].section}` : 'Chapters';
    return `<aside class="sidebar" aria-label="Course">
  <button type="button" class="side-toggle" aria-expanded="false" aria-controls="side-nav"><span>${esc(label)}</span><span aria-hidden="true">▾</span></button>
  <nav id="side-nav" class="side-nav">
    <a class="side-home" href="${root}">After Effects Basics</a>
    <ol class="side-list">
${items}
    </ol>
  </nav>
</aside>`;
  }

  pages.forEach((page, i) => {
    const { introHtml, main, ctx } = rendered[i];
    const prev = pages[i - 1], next = pages[i + 1];
    const demoScripts = [...ctx.demos].map((d) => {
      if (!fs.existsSync(path.join(SITE, 'js/demos', d + '.js'))) console.warn(`  ! ${page.file}: demo "${d}" has no file site/js/demos/${d}.js`);
      return `<script src="../assets/js/demos/${d}.js" defer></script>`;
    }).join('\n');

    const html = fill(pageTpl, {
      root: '../',
      pageTitle: esc(`${page.chapter} ${page.section} · After Effects Basics`),
      chapter: esc(page.chapter),
      section: esc(page.section),
      title: titleWithSquiggle(page.title),
      readTime: esc(page.readTime),
      intro: introHtml,
      outcomes: page.outcomes.map((o) => `<li>${inline(o)}</li>`).join('\n'),
      sidebar: sidebar(i, '../'),
      main,
      prev: prev ? `<a href="../${prev.slug}/"><span class="dir">← Previous</span><span class="name">${esc(prev.chapter + ' ' + prev.section)}</span></a>` : '<span></span>',
      next: next ? `<a class="next" href="../${next.slug}/"><span class="dir">Next →</span><span class="name">${esc(next.chapter + ' ' + next.section)}</span></a>` : '<span></span>',
      demoScripts,
      reload,
    });
    fs.mkdirSync(path.join(OUT, page.slug), { recursive: true });
    fs.writeFileSync(path.join(OUT, page.slug, 'index.html'), osWords(html));
  });

  const totalMin = pages.reduce((s, p) => s + (Number(p.readTime) || 0), 0);
  fs.writeFileSync(path.join(OUT, 'index.html'), fill(template('index.html'), {
    root: '',
    sidebar: sidebar(-1, ''),
    first: pages[0] ? `${pages[0].slug}/` : '#',
    firstName: pages[0] ? esc(`${pages[0].chapter} ${pages[0].section}`) : '',
    count: String(pages.length),
    totalMin: String(totalMin),
    reload,
  }));
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

  console.log(`Built ${pages.length} pages + start page in ${Date.now() - t0} ms → _site/`);
}

if (require.main === module) build();
module.exports = { build };
