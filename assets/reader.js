(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get('b');
  var hashP = parseInt((location.hash.match(/page=(\d+)/) || [])[1], 10);
  var startPage = parseInt(params.get('p'), 10) || hashP || 0;
  var startQ = params.get('q') || '';

  var $ = function (s) { return document.getElementById(s); };
  var viewer = $('viewer'), pagesEl = $('pages'), drawer = $('drawer');
  var pdf = null, book = null, toc = [], textPages = null;
  var baseW = 0, baseH = 0;        // page 1 size at scale 1
  var zoom = 1, cssW = 0;           // zoom factor relative to "fit width"
  var slots = [];                   // {el, canvas, rendered, task, w, h}
  var current = 1, rendered = [];
  var MAX_RENDERED = 10;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';

  function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------- UI text ----------
  function applyText() {
    $('backTxt').textContent = T('back');
    $('tabToc').textContent = T('contents');
    $('tabFind').textContent = T('find');
    $('fbtn').textContent = T('search');
    $('fq').placeholder = T('find');
    $('ltxt').textContent = T('loading');
    $('prev').title = T('prev'); $('next').title = T('next');
    $('zin').title = T('zoomIn'); $('zout').title = T('zoomOut');
    $('dl').title = T('download'); $('dl2').textContent = '⬇ ' + T('download');
    $('menu').title = T('contents');
  }
  applyText();
  document.documentElement.lang = htmlLang();

  // ---------- drawer ----------
  function openDrawer(tab) {
    drawer.classList.add('open'); $('scrim').classList.add('on');
    if (tab) showTab(tab);
    if (window.innerWidth >= 1100) setTimeout(relayout, 220);
  }
  function closeDrawer() {
    drawer.classList.remove('open'); $('scrim').classList.remove('on');
    if (window.innerWidth >= 1100) setTimeout(relayout, 220);
  }
  function showTab(t) {
    $('tabToc').classList.toggle('on', t === 'toc'); $('tabFind').classList.toggle('on', t === 'find');
    $('paneToc').hidden = t !== 'toc'; $('paneFind').hidden = t !== 'find';
    if (t === 'find') setTimeout(function () { $('fq').focus(); }, 50);
  }
  $('menu').onclick = function () { drawer.classList.contains('open') ? closeDrawer() : openDrawer(); };
  $('scrim').onclick = closeDrawer;
  $('tabToc').onclick = function () { showTab('toc'); };
  $('tabFind').onclick = function () { showTab('find'); };
  function closeIfSmall() { if (window.innerWidth < 1100) closeDrawer(); }

  // ---------- layout ----------
  function fitWidth() {
    var avail = viewer.clientWidth - 16;
    return Math.min(avail, 860);
  }
  function relayout() {
    if (!pdf) return;
    var keep = current;
    cssW = Math.round(fitWidth() * zoom);
    slots.forEach(function (s, i) {
      var ratio = s.ratio || (baseH / baseW);
      s.el.style.width = cssW + 'px';
      s.el.style.height = Math.round(cssW * ratio) + 'px';
      if (s.rendered) { s.rendered = false; s.stale = true; }
    });
    goTo(keep, true);
    renderVisible();
  }

  function buildSlots(n) {
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= n; i++) {
      var el = document.createElement('div');
      el.className = 'page'; el.dataset.p = i;
      el.innerHTML = '<span class="pn">' + i + '</span>';
      frag.appendChild(el);
      slots.push({ el: el, canvas: null, rendered: false, task: null, ratio: 0 });
    }
    pagesEl.appendChild(frag);
  }

  // ---------- rendering ----------
  function renderPage(n) {
    var s = slots[n - 1];
    if (!s || (s.rendered && !s.stale) || s.busy) return;
    s.busy = true;
    pdf.getPage(n).then(function (page) {
      var vp1 = page.getViewport({ scale: 1 });
      var ratio = vp1.height / vp1.width;
      if (Math.abs(ratio - (s.ratio || baseH / baseW)) > 0.01) { s.ratio = ratio; s.el.style.height = Math.round(cssW * ratio) + 'px'; }
      var scale = (cssW / vp1.width) * DPR;
      var vp = page.getViewport({ scale: scale });
      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
      var task = page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: vp });
      s.task = task;
      return task.promise.then(function () {
        if (s.canvas) s.el.removeChild(s.canvas);
        s.el.insertBefore(canvas, s.el.firstChild);
        s.canvas = canvas; s.rendered = true; s.stale = false; s.busy = false; s.task = null;
        rendered = rendered.filter(function (x) { return x !== n; }); rendered.push(n);
        trimRendered();
      });
    }).catch(function () { s.busy = false; });
  }
  function trimRendered() {
    while (rendered.length > MAX_RENDERED) {
      // drop the rendered page farthest from the current page
      var far = rendered.reduce(function (a, b) { return Math.abs(b - current) > Math.abs(a - current) ? b : a; });
      var s = slots[far - 1];
      if (s.canvas) { s.canvas.width = 0; s.canvas.height = 0; s.el.removeChild(s.canvas); s.canvas = null; }
      s.rendered = false;
      rendered = rendered.filter(function (x) { return x !== far; });
    }
  }
  function visibleRange() {
    var top = viewer.scrollTop, bot = top + viewer.clientHeight;
    var first = 0, last = 0;
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i].el, y = el.offsetTop, h = el.offsetHeight;
      if (y + h >= top - 200 && !first) first = i + 1;
      if (y <= bot + 200) last = i + 1; else break;
    }
    return [first || 1, last || 1];
  }
  function renderVisible() {
    var r = visibleRange();
    for (var n = r[0]; n <= Math.min(r[1] + 1, slots.length); n++) renderPage(n);
  }
  function updateCurrent() {
    var mid = viewer.scrollTop + viewer.clientHeight * 0.3, best = 1;
    for (var i = 0; i < slots.length; i++) { if (slots[i].el.offsetTop <= mid) best = i + 1; else break; }
    if (best !== current) {
      current = best;
      $('pg').value = current;
      history.replaceState(null, '', location.pathname + '?b=' + encodeURIComponent(id) + '#page=' + current);
      storeSet('last:' + id, current);
      markToc();
    }
  }
  var ticking = false;
  viewer.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; updateCurrent(); renderVisible(); });
  }, { passive: true });

  function goTo(n, instant) {
    n = Math.max(1, Math.min(slots.length, n | 0));
    var el = slots[n - 1].el;
    viewer.scrollTop = el.offsetTop - 8;
    current = 0; updateCurrent(); renderVisible();
  }

  // ---------- controls ----------
  $('prev').onclick = function () { goTo(current - 1); };
  $('next').onclick = function () { goTo(current + 1); };
  $('pg').onchange = function () { goTo(parseInt(this.value, 10) || 1); this.blur(); };
  $('pg').onfocus = function () { this.select(); };
  $('zin').onclick = function () { zoom = Math.min(zoom * 1.2, 3); relayout(); };
  $('zout').onclick = function () { zoom = Math.max(zoom / 1.2, 0.4); relayout(); };
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth; relayout();
  });

  // ---------- contents ----------
  function renderToc() {
    var el = $('paneToc');
    if (!toc.length) { el.innerHTML = '<p class="muted" style="padding:12px 16px">' + T('noToc') + '</p>'; return; }
    var h = '';
    toc.forEach(function (it) {
      var cls = it.lv === 0 ? (toc.some(function (x) { return x.lv > 0; }) ? 'h' : '') : ('l' + it.lv);
      h += '<a href="#page=' + it.p + '" data-p="' + it.p + '" class="' + cls + '"><span class="p">' + it.p + '</span>' + esc(it.t) + '</a>';
      (it.alt || []).forEach(function (a) {
        h += '<a href="#page=' + a.p + '" data-p="' + a.p + '" class="alt"><span class="p">' + a.p + '</span>' + esc(a.t) + '</a>';
      });
    });
    el.innerHTML = h;
    el.querySelectorAll('a').forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); goTo(+a.dataset.p); closeIfSmall(); };
    });
    markToc();
  }
  function markToc() {
    var links = $('paneToc').querySelectorAll('a'), cur = null;
    links.forEach(function (a) { if (+a.dataset.p <= current) cur = a; a.classList.remove('cur'); });
    if (cur) cur.classList.add('cur');
  }

  // ---------- find in book ----------
  function find(q) {
    $('fq').value = q;
    var out = $('fres');
    out.innerHTML = '<p class="muted" style="padding:0 14px">' + T('searching') + '</p>';
    loadText(id).then(function (pages) {
      var hits = searchPages(pages, q, 300);
      if (!hits.length) { out.innerHTML = '<p class="muted" style="padding:0 14px">' + T('noResult') + '</p>'; return; }
      out.innerHTML = hits.map(function (x) {
        return '<a class="hit" href="#page=' + x.page + '" data-p="' + x.page + '"><b class="pg">' + T('page').replace('{n}', x.page) + '</b>' + x.snip + '</a>';
      }).join('');
      out.querySelectorAll('a').forEach(function (a) {
        a.onclick = function (e) { e.preventDefault(); goTo(+a.dataset.p); closeIfSmall(); };
      });
    }).catch(function () { out.innerHTML = '<p style="padding:0 14px">' + T('loadErr') + '</p>'; });
  }
  $('fform').onsubmit = function (e) { e.preventDefault(); var q = $('fq').value.trim(); if (q) find(q); };

  // ---------- boot ----------
  if (!id) { location.href = 'index.html'; return; }
  Promise.all([getJSON('data/books.json'), getJSON('data/toc.json').catch(function () { return {}; })]).then(function (r) {
    book = r[0].filter(function (b) { return b.id === id; })[0];
    if (!book || !book.public) { location.href = 'index.html'; return; }
    toc = r[1][id] || [];
    var title = bookTitle(book);
    $('title').textContent = title;
    document.title = title + ' | ' + T('site');
    var url = 'books/' + id + '.pdf';
    $('dl').href = url; $('dl2').href = url;
    renderToc();
    if (book.learn) { var lb = $('learnBtn'); lb.hidden = false; lb.href = 'learn.html?b=' + id; lb.textContent = '✦ ' + T('learn'); }

    // One streamed download: these PDFs share resources across pages, so range requests end up fetching most of the file anyway.
    var task = pdfjsLib.getDocument({ url: url, disableRange: true });
    var total = book.size || 0;
    task.onProgress = function (p) { var t = p.total || total; if (t) { $('lbar').style.width = Math.min(100, p.loaded / t * 100) + '%'; $('ltxt').textContent = T('loading') + ' ' + (p.loaded / 1048576).toFixed(1) + ' / ' + (t / 1048576).toFixed(1) + ' MB'; } };
    return task.promise;
  }).then(function (doc) {
    if (!doc) return;
    pdf = doc;
    $('total').textContent = '/ ' + pdf.numPages;
    return pdf.getPage(1).then(function (p1) {
      var vp = p1.getViewport({ scale: 1 }); baseW = vp.width; baseH = vp.height;
      buildSlots(pdf.numPages);
      cssW = Math.round(fitWidth() * zoom);
      slots.forEach(function (s) { s.el.style.width = cssW + 'px'; s.el.style.height = Math.round(cssW * baseH / baseW) + 'px'; });
      $('loading').style.display = 'none';
      var last = parseInt(storeGet('last:' + id), 10);
      goTo(startPage || last || 1);
      if (startQ) { openDrawer('find'); find(startQ); }
    });
  }).catch(function (e) {
    $('ltxt').textContent = T('loadErr');
    console.error(e);
  });
})();
