/* The AI Timeline Pyramid: behaviour
   Renders the pyramid from data.js, and handles search, filters, the detail card, deep links and theme. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;

  /* ---------- Small helpers ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Lower-case and strip accents so "Elisa" style searches and accented text both match.
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function accentVar(field) { return 'var(--c-' + field + ')'; }

  function showError(message) {
    var box = $('app-error');
    box.textContent = message;
    box.hidden = false;
  }

  /* ---------- Theme ---------- */

  var themeBtn = $('theme');

  function applyTheme(theme, save) {
    root.setAttribute('data-theme', theme);
    themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    if (save) {
      try { localStorage.setItem('ai-pyramid-theme', theme); } catch (e) { /* private mode: ignore */ }
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  themeBtn.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  /* ---------- Data validation ---------- */

  var REQUIRED = ['id', 'year', 'sort', 'title', 'short', 'layer', 'field', 'subfield', 'sig', 'what', 'why', 'impact'];

  function validate(d) {
    var problems = [];
    var good = [];
    if (!d || !Array.isArray(d.milestones) || !Array.isArray(d.layers) || !d.fields) {
      return { good: good, problems: ['The timeline data file is missing or malformed.'] };
    }
    var layerNums = {};
    d.layers.forEach(function (l) { layerNums[l.n] = true; });
    var seen = {};
    d.milestones.forEach(function (m, i) {
      var label = 'Entry ' + (i + 1) + (m && m.id ? ' (' + m.id + ')' : '');
      var missing = REQUIRED.filter(function (k) { return !m || m[k] === undefined || m[k] === null || m[k] === ''; });
      if (missing.length) { problems.push(label + ' is missing: ' + missing.join(', ')); return; }
      if (typeof m.sort !== 'number' || isNaN(m.sort)) { problems.push(label + ' has a non-numeric sort value'); return; }
      if (seen[m.id]) { problems.push(label + ' repeats an id'); return; }
      if (!layerNums[m.layer]) { problems.push(label + ' points to an unknown layer'); return; }
      if (!d.fields[m.field]) { problems.push(label + ' uses an unknown subfield colour key'); return; }
      seen[m.id] = true;
      good.push(m);
    });
    return { good: good, problems: problems };
  }

  var data = window.AI_TIMELINE;
  var result = validate(data);
  if (result.problems.length && window.console) console.warn('Timeline data problems:\n' + result.problems.join('\n'));
  if (!result.good.length) {
    showError('The timeline could not be loaded. Check that data.js sits next to index.html, then reload the page.');
    return;
  }
  if (result.problems.length) {
    showError('Some events were skipped because their data is incomplete: ' + result.problems.length + '. See the browser console for details.');
  }

  var layers = data.layers.slice().sort(function (a, b) { return a.n - b.n; });
  var layerName = {};
  layers.forEach(function (l) { layerName[l.n] = l.name; });

  var ordered = result.good.slice().sort(function (a, b) { return a.sort - b.sort; });
  var byId = {};
  ordered.forEach(function (m) {
    byId[m.id] = m;
    m._hay = norm([m.year, m.title, m.short, m.subfield, m.sig, m.what, m.why, m.impact,
      data.fields[m.field], layerName[m.layer]].join(' '));
  });

  /* ---------- State ---------- */

  var state = { query: '', fields: {}, currentId: null };
  var chips = {};
  var lastTrigger = null;

  function activeFieldCount() { return Object.keys(state.fields).length; }

  function isMatch(m) {
    if (activeFieldCount() && !state.fields[m.field]) return false;
    if (!state.query) return true;
    var terms = state.query.split(' ');
    for (var i = 0; i < terms.length; i++) {
      if (m._hay.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  /* ---------- Render: pyramid, legend, print list ---------- */

  var pyramid = $('pyramid');

  function renderPyramid() {
    pyramid.textContent = '';
    layers.forEach(function (layer, i) {
      var li = el('li', 'layer');
      li.setAttribute('data-layer', layer.n);
      li.style.setProperty('--w', layer.width + '%');
      li.style.setProperty('--i', i);

      var head = el('div', 'layer-head');
      var name = el('h2', 'layer-name', 'Layer ' + layer.n + ': ' + layer.name);
      name.id = 'layer-' + layer.n;
      head.appendChild(name);
      if (layer.blurb) head.appendChild(el('p', 'layer-sub', layer.blurb));
      li.setAttribute('aria-labelledby', name.id);

      var ul = el('ul', 'events');
      var inLayer = ordered.filter(function (m) { return m.layer === layer.n; });
      if (!inLayer.length) ul.appendChild(el('li', 'none', 'No events in this layer yet.'));
      inLayer.forEach(function (m) {
        var item = el('li');
        var b = el('button', 'event');
        b.type = 'button';
        b.setAttribute('aria-haspopup', 'dialog');
        b.setAttribute('data-id', m.id);
        b.style.setProperty('--accent', accentVar(m.field));
        b.appendChild(el('span', 'e-year', m.year));
        b.appendChild(el('span', 'e-title', m.short));
        b.appendChild(el('span', 'e-field', m.subfield));
        b.addEventListener('click', function () { openMilestone(m.id, b); });
        item.appendChild(b);
        ul.appendChild(item);
        chips[m.id] = b;
      });

      li.appendChild(head);
      li.appendChild(ul);
      pyramid.appendChild(li);
    });
  }

  function renderLegend() {
    var ol = $('layer-legend');
    layers.forEach(function (l) {
      var li = el('li');
      li.appendChild(el('strong', null, l.name));
      if (l.blurb) li.appendChild(el('span', null, ': ' + l.blurb));
      ol.appendChild(li);
    });

    var ul = $('field-legend');
    var counts = {};
    ordered.forEach(function (m) { counts[m.field] = (counts[m.field] || 0) + 1; });
    Object.keys(data.fields).forEach(function (key) {
      if (!counts[key]) return; // skip groups with no events
      var li = el('li');
      var b = el('button', 'field-btn');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-field', key);
      b.style.setProperty('--accent', accentVar(key));
      b.appendChild(el('span', 'dot'));
      b.appendChild(el('span', null, data.fields[key]));
      b.appendChild(el('span', 'n', '(' + counts[key] + ')'));
      b.addEventListener('click', function () {
        if (state.fields[key]) delete state.fields[key]; else state.fields[key] = true;
        b.setAttribute('aria-pressed', String(!!state.fields[key]));
        applyFilters();
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  function renderPrintList() {
    var ol = $('print-notes');
    ordered.forEach(function (m) {
      var li = el('li');
      li.appendChild(el('h3', null, m.year + ': ' + m.title));
      [['What happened', m.what], ['Why it matters', m.why], ['Subfield', m.subfield], ['Impact', m.impact]].forEach(function (pair) {
        var p = el('p');
        p.appendChild(el('strong', null, pair[0] + '. '));
        p.appendChild(document.createTextNode(pair[1]));
        li.appendChild(p);
      });
      ol.appendChild(li);
    });
  }

  /* ---------- Search and filters ---------- */

  function applyFilters() {
    var shown = 0;
    ordered.forEach(function (m) {
      var ok = isMatch(m);
      var b = chips[m.id];
      if (ok) shown++;
      b.disabled = !ok;
    });

    Array.prototype.forEach.call(pyramid.children, function (li, i) {
      var any = Array.prototype.some.call(li.querySelectorAll('.event'), function (b) { return !b.disabled; });
      var hasChips = li.querySelectorAll('.event').length > 0;
      li.classList.toggle('is-empty', hasChips && !any);
    });

    var filtering = !!state.query || activeFieldCount() > 0;
    $('clear').hidden = !filtering;
    $('empty').hidden = shown > 0;
    $('status').textContent = filtering
      ? (shown === 0 ? 'No events match.' : shown + ' of ' + ordered.length + ' events highlighted.')
      : ordered.length + ' events. Select one to read its note.';
  }

  function clearFilters() {
    state.query = '';
    state.fields = {};
    $('q').value = '';
    Array.prototype.forEach.call(document.querySelectorAll('.field-btn'), function (b) { b.setAttribute('aria-pressed', 'false'); });
    applyFilters();
  }

  $('q').addEventListener('input', function (e) {
    state.query = norm(e.target.value).replace(/\s+/g, ' ').trim();
    applyFilters();
  });
  $('clear').addEventListener('click', clearFilters);
  $('empty-clear').addEventListener('click', function () {
    clearFilters();
    $('q').focus();
  });

  /* ---------- Detail card ---------- */

  var dlg = $('dlg');
  var nativeDialog = typeof dlg.showModal === 'function';

  function setHash(id) {
    var url = location.pathname + location.search + (id ? '#' + id : '');
    try {
      history.replaceState(null, '', url);
    } catch (e) {
      try { location.hash = id || ''; } catch (e2) { /* ignore */ }
    }
  }

  function navList() {
    var matched = ordered.filter(isMatch);
    var inMatched = matched.some(function (m) { return m.id === state.currentId; });
    return inMatched && matched.length ? matched : ordered;
  }

  function fillDialog(m) {
    $('dlg-year').textContent = m.year;
    $('dlg-layer').textContent = 'Layer ' + m.layer + ': ' + layerName[m.layer];
    $('dlg-title').textContent = m.title;
    $('dlg-what').textContent = m.what;
    $('dlg-why').textContent = m.why;
    $('dlg-sub').textContent = m.subfield + ' (' + data.fields[m.field] + ')';
    $('dlg-impact').textContent = m.impact;
    var cav = $('dlg-caveat');
    cav.textContent = m.caveat ? 'Note on accuracy: ' + m.caveat : '';
    cav.hidden = !m.caveat;
    dlg.style.setProperty('--accent', accentVar(m.field));
    dlg.querySelector('.subfield .dot').style.setProperty('--accent', accentVar(m.field));

    var list = navList();
    var idx = list.findIndex(function (x) { return x.id === m.id; });
    $('dlg-count').textContent = 'Event ' + (idx + 1) + ' of ' + list.length + (list.length !== ordered.length ? ' (filtered)' : '');
    $('dlg-status').textContent = '';
    dlg.querySelector('.dlg-scroll').scrollTop = 0;
  }

  function openMilestone(id, trigger) {
    var m = byId[id];
    if (!m) return;
    state.currentId = id;
    fillDialog(m);
    if (!dlg.open) {
      lastTrigger = trigger || document.activeElement;
      document.body.classList.add('modal-open');
      if (nativeDialog) {
        dlg.showModal();
      } else {
        dlg.classList.add('no-native');
        dlg.setAttribute('open', '');
      }
      // Move focus to the heading only when the card first opens, so Next and Previous keep focus on their own buttons.
      $('dlg-title').focus();
    }
    setHash(id);
  }

  function onClosed() {
    document.body.classList.remove('modal-open');
    var chip = state.currentId && chips[state.currentId];
    state.currentId = null;
    setHash(null);
    var target = chip && !chip.disabled ? chip : lastTrigger;
    if (target && typeof target.focus === 'function') target.focus();
  }

  function closeDialog() {
    if (nativeDialog) {
      if (dlg.open) dlg.close();
    } else if (dlg.hasAttribute('open')) {
      dlg.removeAttribute('open');
      onClosed();
    }
  }

  function step(delta) {
    var list = navList();
    var i = list.findIndex(function (x) { return x.id === state.currentId; });
    if (i < 0) i = 0;
    var next = list[(i + delta + list.length) % list.length];
    openMilestone(next.id);
  }

  dlg.addEventListener('close', onClosed);
  $('dlg-close').addEventListener('click', closeDialog);
  $('prev').addEventListener('click', function () { step(-1); });
  $('next').addEventListener('click', function () { step(1); });

  // Clicking the dark backdrop closes the card (the card's own content fills the dialog, so inner clicks never target it).
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });

  dlg.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'Escape' && !nativeDialog) { e.preventDefault(); closeDialog(); }
  });

  $('copy').addEventListener('click', function () {
    var status = $('dlg-status');
    var link = location.href.split('#')[0] + '#' + state.currentId;
    function fallback() {
      try {
        var ta = el('textarea');
        ta.value = link;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        dlg.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        dlg.removeChild(ta);
        status.textContent = ok ? 'Link copied.' : 'Copy failed. Copy the link from the address bar instead.';
      } catch (e) {
        status.textContent = 'Copy failed. Copy the link from the address bar instead.';
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () { status.textContent = 'Link copied.'; }, fallback);
    } else {
      fallback();
    }
  });

  /* ---------- Deep links (index.html#m16) ---------- */

  var toastTimer = null;
  function toast(message) {
    var t = $('toast');
    t.textContent = message;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 5000);
  }

  function routeHash() {
    var raw = location.hash.replace(/^#/, '');
    var id = raw;
    try { id = decodeURIComponent(raw); } catch (e) { /* malformed escape: use raw */ }
    id = id.trim().toLowerCase();
    if (!id) {
      if (state.currentId) closeDialog();
      return;
    }
    if (byId[id]) {
      if (state.currentId !== id) openMilestone(id);
    } else if (/^m\d+$/.test(id)) {
      toast('That event does not exist. Showing the full pyramid.');
      setHash(null);
    }
    // Any other hash (for example #pyramid from the skip link) is left alone.
  }

  window.addEventListener('hashchange', routeHash);

  /* ---------- Start ---------- */

  renderPyramid();
  renderLegend();
  renderPrintList();
  applyFilters();
  routeHash();
})();
