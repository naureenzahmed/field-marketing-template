// Field Marketing: three pages (Sales, Recruitment, Branding) switched by the menu boxes.
// Everything you add is saved in this browser (localStorage).

const STORAGE_KEY = 'fieldMarketing.v1';

const uid = () => Math.random().toString(36).slice(2, 10);

const SEED = {
  sales: {
    events: [
      { id: uid(), name: 'Example: Industry Summit booth', date: '2026-08-14', location: 'San Francisco, CA', attendees: 400, goal: 'Book demos with ops leaders', expected: 60, achieved: 48, cost: 8000, owner: '', notes: 'Replace with your real event.' },
      { id: uid(), name: 'Example: Customer dinner', date: '2026-09-22', location: 'New York, NY', attendees: 25, goal: 'Warm up late-stage deals', expected: 12, achieved: 15, cost: 3500, owner: '', notes: '' },
      { id: uid(), name: 'Example: Healthcare roundtable', date: '2026-10-09', location: 'Boston, MA', attendees: 40, goal: 'Open the healthcare segment', expected: 20, achieved: 11, cost: 2500, owner: '', notes: '' },
    ],
    links: [
      { id: uid(), title: 'Lead list', desc: 'HubSpot: all leads', url: 'https://app.hubspot.com/' },
      { id: uid(), title: 'Insurance lead list', desc: 'HubSpot: insurance', url: 'https://app.hubspot.com/' },
      { id: uid(), title: 'Healthcare lead list', desc: 'HubSpot: healthcare', url: 'https://app.hubspot.com/' },
      { id: uid(), title: 'Event leads', desc: 'HubSpot: captured at events', url: 'https://app.hubspot.com/' },
    ],
  },
  recruitment: {
    events: [
      { id: uid(), name: 'Example: University research fair', date: '2026-09-10', location: 'Stanford, CA', attendees: 300, goal: 'Meet PhD candidates in ML', expected: 4, achieved: 2, cost: 1500, owner: '', notes: 'Replace with your real event.' },
      { id: uid(), name: 'Example: Conference workshop', date: '2026-10-18', location: 'Vancouver, BC', attendees: 120, goal: 'Find research scientists', expected: 3, achieved: 3, cost: 4000, owner: '', notes: '' },
    ],
    links: [
      { id: uid(), title: 'Google Scholar', desc: 'Search authors by topic', url: 'https://scholar.google.com/' },
      { id: uid(), title: 'arXiv', desc: 'New papers and their authors', url: 'https://arxiv.org/' },
      { id: uid(), title: 'OpenReview', desc: 'Conference submissions and reviewers', url: 'https://openreview.net/' },
      { id: uid(), title: 'LinkedIn Recruiter', desc: 'Researcher searches', url: 'https://www.linkedin.com/talent/' },
      { id: uid(), title: 'Papers with Code', desc: 'Authors behind top results', url: 'https://paperswithcode.com/' },
      { id: uid(), title: 'Candidate list', desc: 'HubSpot: researcher candidates', url: 'https://app.hubspot.com/' },
    ],
  },
  branding: {
    merch: [
      { id: uid(), name: 'Logo t-shirt', kind: 'item', image: '', sizes: [{ size: 'S', qty: 12 }, { size: 'M', qty: 20 }, { size: 'L', qty: 18 }, { size: 'XL', qty: 0 }], notes: '' },
      { id: uid(), name: 'Hoodie', kind: 'item', image: '', sizes: [{ size: 'M', qty: 6 }, { size: 'L', qty: 9 }], notes: '' },
      { id: uid(), name: 'Stickers', kind: 'item', image: '', sizes: [{ size: 'One size', qty: 250 }], notes: '' },
      { id: uid(), name: 'Water bottle', kind: 'idea', image: '', sizes: [], notes: 'Idea for the next conference.' },
    ],
    design: [
      { id: uid(), title: 'Design system', desc: 'Colors, type, components', url: '' },
    ],
    figma: [
      { id: uid(), title: 'Figma: brand library', desc: 'Main design file', url: 'https://www.figma.com/' },
    ],
    materials: [
      { id: uid(), title: 'Logo pack', desc: 'SVG and PNG', url: '' },
      { id: uid(), title: 'Brand guidelines', desc: 'PDF', url: '' },
      { id: uid(), title: 'Slide template', desc: '', url: '' },
    ],
  },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to seed */ }
  return structuredClone(SEED);
}
let data = load();
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch (e) { alert('Could not save. The browser storage may be full (large pictures take the most room).'); }
}

// ---------- tiny DOM helper ----------
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const num = (v) => (v === '' || v == null || isNaN(+v) ? 0 : +v);
const fmt = (n) => num(n).toLocaleString();
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';

// ---------- pages ----------
const PAGES = {
  sales: { label: 'Sales', render: (root) => renderEventsPage(root, SALES) },
  recruitment: { label: 'Recruitment', render: (root) => renderEventsPage(root, RECRUITMENT) },
  branding: { label: 'Branding', render: renderBranding },
};

const SALES = {
  key: 'sales',
  title: 'Sales',
  sub: 'Leads coming in from every event, the events we hosted, and the HubSpot lead lists.',
  chartTitle: 'Leads incoming with events',
  outcome: 'Leads',
  expectedLabel: 'Leads expected',
  achievedLabel: 'Leads achieved',
  listTitle: 'Events hosted',
  formTitle: 'Add an event',
  linksTitle: 'HubSpot lead lists',
  linksHint: 'Paste each HubSpot list link so the team can jump straight to it.',
};
const RECRUITMENT = {
  key: 'recruitment',
  title: 'Recruitment',
  sub: 'Candidates hired from each event, the events we ran, and where to find researchers.',
  chartTitle: 'Candidates hired with events',
  outcome: 'Hires',
  expectedLabel: 'Candidates expected',
  achievedLabel: 'Candidates hired',
  listTitle: 'Recruiting events',
  formTitle: 'Add a recruiting event',
  linksTitle: 'Where to find researchers',
  linksHint: 'Sources, communities and candidate lists for finding researchers.',
};

function route() {
  const r = location.hash.replace('#/', '');
  return PAGES[r] ? r : 'sales';
}

function renderMenu(current) {
  const menu = document.getElementById('menu');
  menu.replaceChildren(...Object.entries(PAGES).map(([key, p]) =>
    h('a', { href: `#/${key}`, class: key === current ? 'active' : null, 'aria-current': key === current ? 'page' : null }, p.label)));
}

let chart = null;
function render() {
  const r = route();
  renderMenu(r);
  if (chart) { chart.destroy(); chart = null; }
  const page = document.getElementById('page');
  page.replaceChildren();
  PAGES[r].render(page);
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

// ---------- Sales / Recruitment ----------
let editingId = { sales: null, recruitment: null };

function renderEventsPage(root, cfg) {
  const section = data[cfg.key];
  const events = [...section.events].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const totalAch = events.reduce((s, e) => s + num(e.achieved), 0);
  const totalExp = events.reduce((s, e) => s + num(e.expected), 0);
  const totalCost = events.reduce((s, e) => s + num(e.cost), 0);

  root.append(h('h1', {}, cfg.title), h('p', { class: 'sub' }, cfg.sub));

  // Chart
  const canvas = h('canvas', { 'aria-label': cfg.chartTitle, role: 'img' });
  root.append(h('div', { class: 'card' },
    h('div', { class: 'chart-head' },
      h('h2', {}, cfg.chartTitle),
      h('div', { class: 'stats' },
        stat(fmt(events.length), 'Events'),
        stat(fmt(totalAch), cfg.achievedLabel),
        stat(totalExp ? Math.round((totalAch / totalExp) * 100) + '%' : '–', 'Of expected'),
        stat(totalAch && totalCost ? '$' + fmt(Math.round(totalCost / totalAch)) : '–', `Cost per ${cfg.outcome.toLowerCase().replace(/s$/, '')}`),
      )),
    events.length ? h('div', { class: 'chart-wrap' }, canvas) : h('div', { class: 'empty' }, 'Add an event below to see the chart.')));
  if (events.length) drawChart(canvas, section.events, cfg);

  // Events list + form
  const list = h('div', { class: 'event-list' },
    events.length ? events.map((e) => eventCard(e, cfg)) : h('div', { class: 'empty' }, 'No events yet.'));
  root.append(h('div', { class: 'split section' },
    h('div', {}, h('h2', {}, `${cfg.listTitle} (${events.length})`), list),
    eventForm(cfg)));

  // Links
  root.append(linkSection(cfg.linksTitle, cfg.linksHint, section.links));
}

function stat(v, l) { return h('div', { class: 'stat' }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, l)); }

function drawChart(canvas, events, cfg) {
  if (!window.Chart) { canvas.replaceWith(h('div', { class: 'empty' }, 'Chart could not load (no internet connection).')); return; }
  // Group by month.
  const byMonth = new Map();
  for (const e of events) {
    const m = (e.date || '').slice(0, 7) || 'No date';
    const cur = byMonth.get(m) || { achieved: 0, expected: 0, count: 0, names: [] };
    cur.achieved += num(e.achieved); cur.expected += num(e.expected); cur.count += 1; cur.names.push(e.name);
    byMonth.set(m, cur);
  }
  const months = [...byMonth.keys()].sort();
  const labels = months.map((m) => m === 'No date' ? m : new Date(m + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
  const css = getComputedStyle(document.documentElement);
  const accent = css.getPropertyValue('--accent').trim();
  const blue = css.getPropertyValue('--series-2').trim();
  const dim = css.getPropertyValue('--dim').trim();
  const grid = css.getPropertyValue('--border').trim();

  chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { type: 'bar', label: cfg.achievedLabel, data: months.map((m) => byMonth.get(m).achieved), backgroundColor: accent, borderRadius: 4, maxBarThickness: 44, yAxisID: 'y', order: 2 },
        { type: 'bar', label: cfg.expectedLabel, data: months.map((m) => byMonth.get(m).expected), backgroundColor: accent + '40', borderRadius: 4, maxBarThickness: 44, yAxisID: 'y', order: 3 },
        { type: 'line', label: 'Events', data: months.map((m) => byMonth.get(m).count), borderColor: blue, backgroundColor: blue, pointRadius: 5, pointHoverRadius: 7, tension: 0.3, yAxisID: 'y2', order: 1 },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: dim, usePointStyle: true, boxWidth: 8 } },
        tooltip: { callbacks: { afterBody: (items) => byMonth.get(months[items[0].dataIndex]).names.map((n) => '• ' + n) } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: dim } },
        y: { beginAtZero: true, grid: { color: grid }, ticks: { color: dim, precision: 0 }, title: { display: true, text: cfg.outcome, color: dim } },
        y2: { beginAtZero: true, suggestedMax: Math.max(...months.map((m) => byMonth.get(m).count)) + 1, position: 'right', grid: { display: false }, ticks: { color: dim, precision: 0 }, title: { display: true, text: 'Events', color: dim } },
      },
    },
  });
}

function eventCard(e, cfg) {
  const pct = num(e.expected) ? Math.min(100, Math.round((num(e.achieved) / num(e.expected)) * 100)) : 0;
  const met = num(e.expected) && num(e.achieved) >= num(e.expected);
  return h('div', { class: 'event' },
    h('div', { class: 'event-top' },
      h('div', {},
        h('div', { class: 'event-name' }, e.name || 'Untitled event'),
        h('div', { class: 'event-meta' }, [fmtDate(e.date), e.location, e.owner && `Owner: ${e.owner}`].filter(Boolean).join(' · '))),
      h('div', { class: 'row-actions' },
        h('button', { class: 'btn small ghost', onclick: () => { editingId[cfg.key] = e.id; render(); document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, 'Edit'),
        h('button', { class: 'btn small ghost', onclick: () => {
          if (!confirm(`Delete "${e.name}"?`)) return;
          data[cfg.key].events = data[cfg.key].events.filter((x) => x.id !== e.id); save(); render();
        } }, 'Delete'))),
    e.goal && h('p', { class: 'event-goal' }, h('strong', {}, 'Goal: '), e.goal),
    h('div', { class: 'event-nums' },
      h('span', {}, h('b', {}, fmt(e.attendees)), ' people'),
      h('span', {}, h('b', {}, fmt(e.expected)), ' expected'),
      h('span', {}, h('b', {}, fmt(e.achieved)), ' ', cfg.key === 'sales' ? 'achieved' : 'hired'),
      num(e.cost) ? h('span', {}, h('b', {}, '$' + fmt(e.cost)), ' cost') : null),
    num(e.expected) ? h('div', { class: 'bar' + (met ? ' met' : ''), title: `${pct}% of expected` }, h('span', { style: `width:${pct}%` })) : null,
    e.notes && h('p', { class: 'event-notes' }, e.notes));
}

function field(label, name, value, type = 'text', extra = {}) {
  const input = type === 'textarea'
    ? h('textarea', { name, id: 'f-' + name, ...extra }, value ?? '')
    : h('input', { name, id: 'f-' + name, type, value: value ?? '', ...extra });
  return h('div', { class: 'field' }, h('label', { for: 'f-' + name }, label), input);
}

function eventForm(cfg) {
  const editing = data[cfg.key].events.find((e) => e.id === editingId[cfg.key]);
  const e = editing || {};
  const form = h('form', { class: 'card form', id: 'event-form' },
    h('h2', {}, editing ? 'Edit event' : cfg.formTitle),
    field('Event name', 'name', e.name, 'text', { required: true, placeholder: 'e.g. Spring Expo booth' }),
    h('div', { class: 'grid-2' },
      field('Date', 'date', e.date, 'date'),
      field('Location', 'location', e.location, 'text', { placeholder: 'City or venue' })),
    h('div', { class: 'grid-2' },
      field('Number of people', 'attendees', e.attendees, 'number', { min: 0 }),
      field('Cost ($)', 'cost', e.cost, 'number', { min: 0 })),
    field('Goal', 'goal', e.goal, 'text', { placeholder: 'What does success look like?' }),
    h('div', { class: 'grid-2' },
      field(cfg.expectedLabel, 'expected', e.expected, 'number', { min: 0 }),
      field(cfg.achievedLabel, 'achieved', e.achieved, 'number', { min: 0 })),
    field('Owner', 'owner', e.owner, 'text', { placeholder: 'Who ran it' }),
    field('Notes', 'notes', e.notes, 'textarea', { placeholder: 'What worked, what to change next time' }),
    h('div', { class: 'form-actions' },
      h('button', { class: 'btn primary', type: 'submit' }, editing ? 'Save changes' : 'Add event'),
      editing && h('button', { class: 'btn', type: 'button', onclick: () => { editingId[cfg.key] = null; render(); } }, 'Cancel')));

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const rec = {
      id: editing ? editing.id : uid(),
      name: f.name.trim(), date: f.date, location: f.location.trim(), goal: f.goal.trim(), owner: f.owner.trim(), notes: f.notes.trim(),
      attendees: num(f.attendees), expected: num(f.expected), achieved: num(f.achieved), cost: num(f.cost),
    };
    const list = data[cfg.key].events;
    if (editing) list[list.findIndex((x) => x.id === editing.id)] = rec; else list.push(rec);
    editingId[cfg.key] = null;
    save(); render();
  });
  return form;
}

// ---------- link tiles (used on every page) ----------
function linkSection(title, hint, links) {
  const wrap = h('div', { class: 'card section' }, h('h2', {}, title), hint && h('p', { class: 'hint', style: 'margin:-8px 0 14px' }, hint));
  wrap.append(h('div', { class: 'links' }, links.map((l) => {
    const remove = h('button', { class: 'btn small ghost x', title: 'Remove', 'aria-label': `Remove ${l.title}`, onclick: (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      if (!confirm(`Remove "${l.title}"?`)) return;
      links.splice(links.indexOf(l), 1); save(); render();
    } }, '✕');
    const inner = [h('div', {}, h('div', { class: 't' }, l.title), h('div', { class: 'd' }, l.desc || (l.url ? new URL(l.url).hostname : 'No link yet'))), remove];
    return l.url
      ? h('a', { class: 'link', href: l.url, target: '_blank', rel: 'noopener' }, ...inner)
      : h('div', { class: 'link' }, ...inner);
  })));

  const t = h('input', { placeholder: 'Name', 'aria-label': 'Link name' });
  const d = h('input', { placeholder: 'Description (optional)', 'aria-label': 'Link description' });
  const u = h('input', { placeholder: 'https://…', 'aria-label': 'Link URL', type: 'url' });
  wrap.append(h('form', { class: 'add-link', onsubmit: (ev) => {
    ev.preventDefault();
    if (!t.value.trim()) { t.focus(); return; }
    let url = u.value.trim();
    if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
    links.push({ id: uid(), title: t.value.trim(), desc: d.value.trim(), url });
    save(); render();
  } }, t, d, u, h('button', { class: 'btn', type: 'submit' }, 'Add link')));
  return wrap;
}

// ---------- Branding ----------
function placeholderImage(name) {
  const letter = (name || '?').trim()[0]?.toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0edea"/><text x="100" y="125" font-family="Archivo,Arial,sans-serif" font-size="80" font-weight="700" text-anchor="middle" fill="#c9c3be">${letter}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function renderBranding(root) {
  const b = data.branding;
  root.append(h('h1', {}, 'Branding'), h('p', { class: 'sub' }, 'Merch on hand, merch ideas, and every brand file in one place.'));

  const items = b.merch.filter((m) => m.kind !== 'idea');
  const ideas = b.merch.filter((m) => m.kind === 'idea');
  const totalUnits = items.reduce((s, m) => s + m.sizes.reduce((t, z) => t + num(z.qty), 0), 0);

  const shop = h('div', {},
    h('div', { class: 'chart-head' }, h('h2', {}, 'Merch'), h('div', { class: 'stats' }, stat(fmt(items.length), 'Items'), stat(fmt(totalUnits), 'Units in stock'), stat(fmt(ideas.length), 'Ideas'))),
    h('div', { class: 'shop' }, items.length ? items.map(productCard) : h('div', { class: 'empty' }, 'No merch yet.')),
    ideas.length ? h('div', { class: 'section' }, h('h2', {}, 'Merch ideas'), h('div', { class: 'shop' }, ideas.map(productCard))) : null);

  root.append(h('div', { class: 'split' }, shop, merchForm()));
  root.append(linkSection('Design system', 'Tokens, components and usage rules.', b.design));
  root.append(linkSection('Figma', 'Design files and libraries.', b.figma));
  root.append(linkSection('Branding materials', 'Logos, guidelines, templates and photography.', b.materials));
}

let editingMerch = null;

function productCard(m) {
  const total = m.sizes.reduce((s, z) => s + num(z.qty), 0);
  return h('div', { class: 'product' },
    h('img', { src: m.image || placeholderImage(m.name), alt: m.name }),
    h('div', { class: 'product-body' },
      h('div', {}, h('div', { class: 'product-name' }, m.name), m.kind === 'idea' ? h('span', { class: 'tag' }, 'Idea') : h('div', { class: 'product-total' }, `${fmt(total)} in inventory`)),
      m.sizes.length ? h('div', { class: 'sizes' }, m.sizes.map((z) => h('span', { class: 'size' + (num(z.qty) ? '' : ' out') }, z.size, h('b', {}, fmt(z.qty))))) : null,
      m.notes && h('div', { class: 'hint' }, m.notes),
      h('div', { class: 'product-foot' },
        h('button', { class: 'btn small ghost', onclick: () => { editingMerch = m.id; render(); document.getElementById('merch-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, 'Edit'),
        h('button', { class: 'btn small ghost', onclick: () => {
          if (!confirm(`Delete "${m.name}"?`)) return;
          data.branding.merch = data.branding.merch.filter((x) => x.id !== m.id); save(); render();
        } }, 'Delete'))));
}

function sizeRow(size = '', qty = '') {
  const row = h('div', { class: 'size-row' },
    h('input', { placeholder: 'Size (S, M, L…)', value: size, 'aria-label': 'Size' }),
    h('input', { type: 'number', min: 0, placeholder: 'Qty', value: qty, 'aria-label': 'Quantity' }),
    h('button', { type: 'button', class: 'btn small ghost', 'aria-label': 'Remove size', onclick: () => row.remove() }, '✕'));
  return row;
}

// Shrink uploaded pictures so they fit in browser storage.
function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const max = 600, scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function merchForm() {
  const editing = data.branding.merch.find((m) => m.id === editingMerch);
  const m = editing || { kind: 'item', sizes: [] };
  const sizes = h('div', { class: 'size-rows' }, (m.sizes.length ? m.sizes : [{ size: '', qty: '' }]).map((z) => sizeRow(z.size, z.qty)));
  const kind = h('select', { name: 'kind', id: 'f-kind' },
    h('option', { value: 'item', selected: m.kind !== 'idea' }, 'Merch we have'),
    h('option', { value: 'idea', selected: m.kind === 'idea' }, 'Merch idea'));
  const file = h('input', { type: 'file', accept: 'image/*', name: 'file', id: 'f-file' });

  const form = h('form', { class: 'card form', id: 'merch-form' },
    h('h2', {}, editing ? 'Edit merch' : 'Add more'),
    h('div', { class: 'field' }, h('label', { for: 'f-kind' }, 'Type'), kind),
    field('Name', 'mname', m.name, 'text', { required: true, placeholder: 'e.g. Tote bag' }),
    h('div', { class: 'field' }, h('label', { for: 'f-file' }, 'Picture'), file, editing?.image ? h('span', { class: 'hint' }, 'Leave empty to keep the current picture.') : null),
    field('…or picture link', 'imageUrl', editing?.image?.startsWith('http') ? editing.image : '', 'url', { placeholder: 'https://…' }),
    h('div', { class: 'field' }, h('label', {}, 'Sizes and inventory'), sizes,
      h('button', { type: 'button', class: 'btn small', style: 'align-self:flex-start', onclick: () => sizes.append(sizeRow()) }, '+ Add size')),
    field('Notes', 'mnotes', m.notes, 'textarea', { placeholder: 'Vendor, cost per unit, reorder date…' }),
    h('div', { class: 'form-actions' },
      h('button', { class: 'btn primary', type: 'submit' }, editing ? 'Save changes' : 'Add merch'),
      editing && h('button', { class: 'btn', type: 'button', onclick: () => { editingMerch = null; render(); } }, 'Cancel')));

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = new FormData(form);
    let image = editing?.image || '';
    const url = (f.get('imageUrl') || '').trim();
    if (file.files[0]) {
      try { image = await readImage(file.files[0]); } catch { alert('That picture could not be read.'); return; }
    } else if (url) image = url;
    const rec = {
      id: editing ? editing.id : uid(),
      name: f.get('mname').trim(), kind: kind.value, image,
      sizes: [...sizes.children].map((r) => { const [s, q] = r.querySelectorAll('input'); return { size: s.value.trim(), qty: num(q.value) }; }).filter((z) => z.size),
      notes: (f.get('mnotes') || '').trim(),
    };
    const list = data.branding.merch;
    if (editing) list[list.findIndex((x) => x.id === editing.id)] = rec; else list.push(rec);
    editingMerch = null;
    save(); render();
  });
  return form;
}

render();
