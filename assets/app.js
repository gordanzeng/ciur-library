(function () {
  var BOOKS = [];
  var cat = 'all';

  function fmtSize(n) { return (n / 1048576).toFixed(n > 10485760 ? 0 : 1) + ' MB'; }

  function card(b) {
    var langs = b.langs.map(function (l) { return '<span class="tag">' + I18N[getLang()].langNames[l] + '</span>'; }).join('');
    var lv = bookField(b, 'level');
    var sub = [getLang() === 'rw' ? '' : b.title_local, bookAltTitle(b)].filter(function (x, i, a) { return x && a.indexOf(x) === i && x !== bookTitle(b); }).join(' · ');
    return '<a class="card" href="read.html?b=' + b.id + '">' +
      '<div class="cover" style="background-image:url(covers/' + b.id + '.jpg)" role="img" aria-label="' + esc(bookTitle(b)) + '"></div>' +
      '<div class="body"><h3>' + esc(bookTitle(b)) + '</h3>' +
      '<div class="sub">' + esc(sub) + '</div>' +
      '<div class="desc">' + esc(bookField(b, 'desc')) + '</div>' +
      '<div class="tags">' + (b.learn ? '<span class="tag learn">✦ ' + T('learn') + '</span>' : '') + '<span class="tag lv">' + esc(lv) + '</span>' + langs +
      '<span class="tag">' + b.pages + ' ' + T('pages') + '</span></div></div></a>';
  }

  function renderShelf() {
    var list = BOOKS.filter(function (b) { return b.public && (cat === 'all' || b.cat === cat); });
    var series = list.filter(function (b) { return b.series === 'readers'; });
    var others = list.filter(function (b) { return b.series !== 'readers'; });
    var h = '';
    list.filter(function (b) { return b.learn; }).forEach(function (lb) {
      var bt = I18N[getLang()]['learnBanner_' + lb.id] || T('learnBanner');
      h += '<a class="banner" href="learn.html?b=' + lb.id + '"><span class="pill">' + T('pilot') + '</span><span class="btxt">' + esc(bt) + '</span><span class="go">' + T('start') + ' →</span></a>';
    });
    if (series.length) h += '<div class="section-title">' + T('series') + '</div><div class="grid">' + series.map(card).join('') + '</div>';
    if (others.length) h += '<div class="section-title">' + T('others') + '</div><div class="grid">' + others.map(card).join('') + '</div>';
    document.getElementById('shelf').innerHTML = h;
  }

  function renderFilters() {
    var f = [['all', T('all')], ['zh', T('catZh')], ['rw', T('catRw')], ['sw', T('catSw')]];
    var el = document.getElementById('filters');
    el.innerHTML = f.map(function (x) { return '<button data-c="' + x[0] + '" class="' + (x[0] === cat ? 'on' : '') + '">' + x[1] + '</button>'; }).join('');
    el.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () { cat = b.dataset.c; hideResults(); renderFilters(); renderShelf(); };
    });
  }

  function applyLang() {
    var l = getLang();
    document.documentElement.lang = htmlLang();
    ['site', 'siteSub', 'heroTitle', 'heroText', 'footer'].forEach(function (k) { document.getElementById(k).textContent = T(k); });
    document.getElementById('q').placeholder = T('searchPh');
    document.getElementById('sbtn').textContent = T('search');
    document.querySelectorAll('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === l); });
    renderFilters(); renderShelf();
    var q = document.getElementById('q').value.trim(); if (q && !document.getElementById('results').hidden) doSearch(q);
  }

  function hideResults() {
    var r = document.getElementById('results'); r.hidden = true; r.innerHTML = '';
    document.getElementById('shelf').hidden = false;
  }

  function doSearch(q) {
    var r = document.getElementById('results');
    r.hidden = false; document.getElementById('shelf').hidden = true;
    r.innerHTML = '<p class="muted">' + T('searching') + '</p>';
    var list = BOOKS.filter(function (b) { return b.public; });
    Promise.all(list.map(function (b) { return loadText(b.id).then(function (pages) { return { b: b, hits: searchPages(pages, q, 0) }; }); }))
      .then(function (res) {
        res = res.filter(function (x) { return x.hits.length; });
        var h = '<p><a href="#" id="clr">← ' + T('clear') + '</a></p><p class="muted">' + T('resultsFor') + '“' + esc(q) + '”</p>';
        if (!res.length) h += '<p>' + T('noResult') + '</p>';
        res.forEach(function (x) {
          var total = x.hits.reduce(function (s, y) { return s + y.count; }, 0);
          h += '<div class="book"><h4>' + esc(bookTitle(x.b)) + ' <span class="muted">(' + total + ' ' + T('hits') + ')</span></h4>';
          x.hits.slice(0, 8).forEach(function (y) {
            h += '<a class="hit" href="read.html?b=' + x.b.id + '&p=' + y.page + '&q=' + encodeURIComponent(q) + '"><b class="pg">' + T('page').replace('{n}', y.page) + '</b>' + y.snip + '</a>';
          });
          if (x.hits.length > 8) h += '<a class="hit muted" href="read.html?b=' + x.b.id + '&q=' + encodeURIComponent(q) + '">+ ' + (x.hits.length - 8) + ' …</a>';
          h += '</div>';
        });
        r.innerHTML = h;
        document.getElementById('clr').onclick = function (e) { e.preventDefault(); document.getElementById('q').value = ''; hideResults(); };
      })
      .catch(function () { r.innerHTML = '<p>' + T('loadErr') + '</p>'; });
  }

  document.querySelectorAll('.lang button').forEach(function (b) { b.onclick = function () { setLang(b.dataset.l); applyLang(); }; });
  document.getElementById('sform').onsubmit = function (e) {
    e.preventDefault();
    var q = document.getElementById('q').value.trim();
    if (q) doSearch(q); else hideResults();
  };

  getJSON('data/books.json').then(function (b) {
    BOOKS = b.sort(function (x, y) { return x.order - y.order; });
    applyLang();
  }).catch(function () { document.getElementById('shelf').innerHTML = '<p>' + T('loadErr') + '</p>'; applyLang(); });
})();
