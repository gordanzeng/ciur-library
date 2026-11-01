(function () {
  var $ = function (s) { return document.getElementById(s); };
  var params = new URLSearchParams(location.search);
  var id = params.get('b') || 'chinese-365';
  var DATA = null, BOOK = null, cur = 0, searching = false;
  var KEY_DONE = 'learned:' + id, KEY_PREF = 'learnprefs', KEY_TOPIC = 'lasttopic:' + id;

  function sget(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function sset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var done = sget(KEY_DONE, {});
  var pref = sget(KEY_PREF, { py: true, rw: true, en: true, hide: false, rate: 0.8 });
  if (!pref.seq) pref.seq = 'zh';
  function pad(n) { return ('00' + n).slice(-3); }

  // ---------- speech ----------
  var synth = window.speechSynthesis, zhVoice = null, enVoice = null, playing = null;
  function pickVoice() {
    if (!synth) return;
    var all = synth.getVoices();
    var vs = all.filter(function (v) { return /^zh/i.test(v.lang) || /chinese|mandarin|普通话|中文/i.test(v.name); });
    vs.sort(function (a, b) { return score(b) - score(a); });
    zhVoice = vs[0] || null;
    var es = all.filter(function (v) { return /^en/i.test(v.lang); });
    es.sort(function (a, b) { return escore(b) - escore(a); });
    enVoice = es[0] || null;
    function score(v) { return (/zh[-_]CN/i.test(v.lang) ? 4 : 0) + (/google|microsoft|xiaoxiao|yunxi|ting/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1); }
    function escore(v) { return (/en[-_](GB|US)/i.test(v.lang) ? 4 : 0) + (/natural|online|google/i.test(v.name) ? 2 : 0); }
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = function () { pickVoice(); if (zhVoice && $('note').classList.contains('warn')) { $('note').classList.remove('warn'); $('note').textContent = T('ttsNote'); } }; }
  setTimeout(function () {
    if (!synth || !zhVoice) { $('note').textContent = T('noVoice'); $('note').classList.add('warn'); }
  }, 1800);

  function stopAll() {
    if (synth) synth.cancel();
    if (playing && playing.audio) { playing.audio.pause(); }
    if (playing && playing.raf) cancelAnimationFrame(playing.raf);
    playing = null;
    document.querySelectorAll('.line.speaking').forEach(function (e) { e.classList.remove('speaking'); });
    document.querySelectorAll('.speaking-part').forEach(function (e) { e.classList.remove('speaking-part'); });
    document.querySelectorAll('.ihead button.on').forEach(function (b) { if (b.dataset.act === 'all') { b.classList.remove('on'); b.textContent = '▶ ' + T('playAll'); } });
  }
  // Recorded audio: set "audioBase" in the lesson JSON (e.g. "audio/chinese-365/") and name files 001-1.mp3, 001-2.mp3 …
  // Kinyarwanda: AI-generated clips packed one file per topic; line.ra = [start, end] in seconds
  var rwAudio = {};
  function getRwAudio(src) {
    if (!rwAudio[src]) { var a = new Audio(src); a.preload = 'auto'; rwAudio[src] = a; }
    return rwAudio[src];
  }
  function playRw(line, finish) {
    if (!line._rwSrc || !line.ra) { finish(); return; }
    var a = getRwAudio(line._rwSrc), st = { audio: a };
    playing = st;
    var go = function () {
      if (playing !== st) return;
      try { a.currentTime = line.ra[0]; } catch (e) {}
      a.playbackRate = Math.min(1.3, Math.max(0.6, pref.rate / 0.8));
      a.play().then(function () {
        (function tick() {
          if (playing !== st) return;
          if (a.currentTime >= line.ra[1] || a.ended) { a.pause(); playing = null; finish(); return; }
          st.raf = requestAnimationFrame(tick);
        })();
      }).catch(function () { playing = null; finish(); });
    };
    if (a.readyState >= 1) go(); else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
  }
  function speakTts(text, lang, voice, finish) {
    if (!synth) { finish(); return; }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = voice ? voice.lang : lang; if (voice) u.voice = voice;
    u.rate = pref.rate; u.onend = finish; u.onerror = finish;
    playing = { u: u }; synth.speak(u);
  }
  function speakLang(line, el, lang, onend) {
    var part = lang === 'zh' ? null : el.querySelector('.' + lang);
    el.classList.add('speaking'); if (part) part.classList.add('speaking-part');
    var finish = function () { el.classList.remove('speaking'); if (part) part.classList.remove('speaking-part'); if (onend) onend(); };
    if (lang === 'rw') return playRw(line, finish);
    if (lang === 'en') return speakTts(line.en, 'en-US', enVoice, finish);
    return speak(line, el, null, null, onend);
  }
  function seqLangs() { return pref.seq === 'all' ? ['zh', 'rw', 'en'] : pref.seq === 'zhrw' ? ['zh', 'rw'] : ['zh']; }

  function speak(line, el, n, idx, onend) {
    el.classList.add('speaking');
    var finish = function () { el.classList.remove('speaking'); if (onend) onend(); };
    if (DATA.audioBase) {
      var a = new Audio(DATA.audioBase + pad(n) + '-' + (idx + 1) + '.mp3');
      a.playbackRate = Math.max(0.5, pref.rate / 0.8);
      playing = { audio: a }; a.onended = finish; a.onerror = finish; a.play().catch(finish);
      return;
    }
    if (!synth) { finish(); return; }
    var u = new SpeechSynthesisUtterance(line.zh);
    u.lang = zhVoice ? zhVoice.lang : 'zh-CN'; if (zhVoice) u.voice = zhVoice;
    u.rate = pref.rate; u.onend = finish; u.onerror = finish;
    playing = { u: u }; synth.speak(u);
  }

  // ---------- rendering ----------
  function tr(t) { var l = getLang(); return l === 'zh' ? (t.rw + ' · ' + t.en) : l === 'rw' ? t.rw : t.en; }
  function topicDone(t) { return t.items.filter(function (it) { return done[it.n]; }).length; }

  function renderTopics() {
    var q = $('sq').value.trim();
    $('topics').innerHTML = DATA.topics.map(function (t, i) {
      var d = topicDone(t);
      return '<a href="#" data-i="' + i + '" class="' + (i === cur && !searching ? 'cur' : '') + '"><span class="no">' + (i + 1) + '</span><span class="tt">' + esc(t.zh) + '<small>' + esc(getLang() === 'rw' ? t.rw : t.en) + '</small></span>' + (d ? '<span class="pr">' + d + '/' + t.items.length + '</span>' : '') + '</a>';
    }).join('');
    $('topics').querySelectorAll('a').forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); $('sq').value = ''; searching = false; show(+a.dataset.i); closeDrawer(); };
    });
  }

  function itemHTML(it, topicIdx) {
    var h = '<div class="item' + (done[it.n] ? ' done' : '') + '" data-n="' + it.n + '"><div class="ihead"><span class="n">' + T('sentNo').replace('{n}', pad(it.n)) + '</span>';
    if (topicIdx != null) h += '<span class="tp" data-t="' + topicIdx + '">· ' + esc(DATA.topics[topicIdx].zh) + '</span>';
    h += '<span class="sp"></span>';
    if (it.lines.length > 1) h += '<button data-act="all">▶ ' + T('playAll') + '</button>';
    h += '<button data-act="done" class="' + (done[it.n] ? 'on' : '') + '">✓ ' + T('learned') + '</button></div>';
    it.lines.forEach(function (l, i) {
      h += '<div class="line" data-i="' + i + '">' + (it.lines.length > 1 ? '<span class="who">' + 'AB'.charAt(i % 2) + '</span>' : '') +
        '<div class="tx"><div class="py">' + esc(l.py) + '</div><div class="zh" lang="zh" data-r="' + esc(T('reveal')) + '">' + esc(l.zh) + '</div>' +
        '<div class="rw" lang="rw">' + esc(l.rw) + (l.ra ? ' <button class="pls" data-lang="rw" title="' + esc(T('playRw')) + '">🔊</button>' : '') + '</div><div class="en" lang="en">' + esc(l.en) + ' <button class="pls" data-lang="en" title="' + esc(T('playEn')) + '">🔊</button></div></div>' +
        '<button class="pl" title="' + T('play') + '"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg></button></div>';
    });
    return h + '</div>';
  }

  function bindItems(root, lookup) {
    root.querySelectorAll('.item').forEach(function (box) {
      var it = lookup(+box.dataset.n);
      box.querySelectorAll('.line').forEach(function (ln) {
        var i = +ln.dataset.i;
        ln.querySelector('.pl').onclick = function () { stopAll(); speak(it.lines[i], ln, it.n, i); };
        ln.querySelectorAll('.pls').forEach(function (pb) { pb.onclick = function (e) { e.stopPropagation(); stopAll(); speakLang(it.lines[i], ln, pb.dataset.lang); }; });
        ln.querySelector('.zh').onclick = function () { if (document.body.classList.contains('hideZh')) ln.classList.toggle('revealed'); };
      });
      box.querySelectorAll('.ihead button').forEach(function (b) {
        b.onclick = function () {
          if (b.dataset.act === 'done') {
            if (done[it.n]) delete done[it.n]; else done[it.n] = 1;
            sset(KEY_DONE, done); b.classList.toggle('on', !!done[it.n]); box.classList.toggle('done', !!done[it.n]);
            renderTopics(); updateProgress();
          } else {
            var wasOn = b.classList.contains('on'); stopAll(); if (wasOn) return;
            b.classList.add('on'); b.textContent = '■ ' + T('stop');
            var lines = box.querySelectorAll('.line'), langs = seqLangs(), steps = [];
            it.lines.forEach(function (l, j) { langs.forEach(function (lg) { if (lg !== 'rw' || l.ra) steps.push([j, lg]); }); });
            var k = 0;
            (function next() {
              if (k >= steps.length || !b.classList.contains('on')) { b.classList.remove('on'); b.textContent = '▶ ' + T('playAll'); return; }
              var st = steps[k++], j = st[0];
              var after = function () { setTimeout(next, 450); };
              if (st[1] === 'zh') speak(it.lines[j], lines[j], it.n, j, after); else speakLang(it.lines[j], lines[j], st[1], after);
            })();
          }
        };
      });
      var tp = box.querySelector('.tp'); if (tp) tp.onclick = function () { $('sq').value = ''; searching = false; show(+tp.dataset.t); };
    });
  }

  function updateProgress() {
    var t = DATA.topics[cur], el = $('tprog'); if (!el || searching) return;
    var d = topicDone(t);
    el.innerHTML = '<span class="bar2"><i style="width:' + (100 * d / t.items.length) + '%"></i></span> ' + T('progress').replace('{a}', d).replace('{b}', t.items.length);
  }

  function show(i) {
    stopAll();
    cur = Math.max(0, Math.min(DATA.topics.length - 1, i)); sset(KEY_TOPIC, cur);
    var t = DATA.topics[cur];
    var h = '<div class="thead"><div class="py">' + esc(t.py) + '</div><h1>' + (cur + 1) + '. ' + esc(t.zh) + '</h1><div class="tr">' + esc(tr(t)) + '</div>' +
      '<div class="meta"><span id="tprog" style="display:flex;align-items:center;gap:8px;flex:1"></span><a href="read.html?b=' + id + '&p=' + t.page + '">📄 ' + T('viewPage').replace('{n}', t.page) + '</a></div></div>';
    h += t.items.map(function (it) { return itemHTML(it, null); }).join('');
    h += '<div class="tnav">' + (cur > 0 ? '<a href="#" id="tprev">← ' + T('prevTopic') + '<br><b>' + esc(DATA.topics[cur - 1].zh) + '</b></a>' : '<span></span>') +
      (cur < DATA.topics.length - 1 ? '<a href="#" id="tnext" style="text-align:right">' + T('nextTopic') + ' →<br><b>' + esc(DATA.topics[cur + 1].zh) + '</b></a>' : '') + '</div>';
    $('content').innerHTML = h;
    bindItems($('content'), function (n) { return t.items.filter(function (x) { return x.n === n; })[0]; });
    if ($('tprev')) $('tprev').onclick = function (e) { e.preventDefault(); show(cur - 1); };
    if ($('tnext')) $('tnext').onclick = function (e) { e.preventDefault(); show(cur + 1); };
    history.replaceState(null, '', location.pathname + '?b=' + id + '&t=' + (cur + 1));
    window.scrollTo(0, 0);
    renderTopics(); updateProgress();
  }

  function doSearch() {
    var q = foldStr($('sq').value.trim());
    if (!q) { searching = false; show(cur); return; }
    searching = true; stopAll();
    var hits = [];
    DATA.topics.forEach(function (t, ti) {
      t.items.forEach(function (it) {
        var txt = foldStr(it.lines.map(function (l) { return [l.zh, l.py, l.rw, l.en].join(' '); }).join(' '));
        var plain = txt.normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (txt.indexOf(q) >= 0 || plain.indexOf(q.normalize('NFD').replace(/[̀-ͯ]/g, '')) >= 0) hits.push([it, ti]);
      });
    });
    $('content').innerHTML = '<div class="thead sres"><h1>' + T('resultsFor') + '“' + esc($('sq').value.trim()) + '”</h1><div class="tr">' + hits.length + '</div></div><div class="sres">' +
      (hits.length ? hits.map(function (h) { return itemHTML(h[0], h[1]); }).join('') : '<p>' + T('noResult') + '</p>') + '</div>';
    bindItems($('content'), function (n) { return hits.filter(function (h) { return h[0].n === n; })[0][0]; });
    renderTopics();
  }

  // ---------- prefs / chrome ----------
  function applyPrefs() {
    var c = document.body.classList;
    c.toggle('hidePy', !pref.py); c.toggle('hideRw', !pref.rw); c.toggle('hideEn', !pref.en); c.toggle('hideZh', !!pref.hide);
    $('tPy').checked = pref.py; $('tRw').checked = pref.rw; $('tEn').checked = pref.en; $('tHide').checked = pref.hide;
    $('rate').value = pref.rate; $('rateV').textContent = (+pref.rate).toFixed(1); $('seq').value = pref.seq;
  }
  [['tPy', 'py'], ['tRw', 'rw'], ['tEn', 'en'], ['tHide', 'hide']].forEach(function (p) {
    $(p[0]).onchange = function () { pref[p[1]] = this.checked; sset(KEY_PREF, pref); applyPrefs(); if (p[1] === 'hide') document.querySelectorAll('.line.revealed').forEach(function (e) { e.classList.remove('revealed'); }); };
  });
  $('seq').onchange = function () { pref.seq = this.value; sset(KEY_PREF, pref); };
  $('rate').oninput = function () { pref.rate = +this.value; sset(KEY_PREF, pref); $('rateV').textContent = pref.rate.toFixed(1); };
  var timer; $('sq').oninput = function () { clearTimeout(timer); timer = setTimeout(doSearch, 250); };

  function openDrawer() { $('drawer').classList.add('open'); $('scrim').classList.add('on'); }
  function closeDrawer() { $('drawer').classList.remove('open'); $('scrim').classList.remove('on'); }
  $('menu').onclick = function () { $('drawer').classList.contains('open') ? closeDrawer() : openDrawer(); };
  $('scrim').onclick = closeDrawer;

  function applyLang() {
    document.documentElement.lang = htmlLang();
    $('backTxt').textContent = T('back'); $('lPy').textContent = T('showPy'); $('lRw').textContent = T('showRw'); $('lEn').textContent = T('showEn');
    $('lHide').textContent = T('practice'); $('lSpeed').textContent = T('speed'); $('lSeq').textContent = T('seqLabel');
    $('seq').options[0].text = T('seqZh'); $('seq').options[1].text = T('seqZhRw'); $('seq').options[2].text = T('seqAll');
    $('credit').textContent = DATA && DATA.rwAudioCredit ? T('rwCredit') : ''; $('sq').placeholder = T('searchSent');
    $('pdfLink').title = T('read'); $('menu').title = T('topics');
    document.querySelectorAll('.lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === getLang()); });
    if (!$('note').classList.contains('warn')) $('note').textContent = T('ttsNote'); else $('note').textContent = T('noVoice');
    if (BOOK) { $('title').textContent = '✦ ' + bookTitle(BOOK) + ' · ' + T('learn'); document.title = bookTitle(BOOK) + ' · ' + T('learn'); }
    if (DATA) { if (searching) doSearch(); else show(cur); }
  }
  document.querySelectorAll('.lang button').forEach(function (b) { b.onclick = function () { setLang(b.dataset.l); applyLang(); }; });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopAll(); });

  applyPrefs();
  Promise.all([getJSON('data/books.json'), getJSON('data/learn/' + id + '.json')]).then(function (r) {
    BOOK = r[0].filter(function (b) { return b.id === id; })[0];
    DATA = r[1];
    DATA.topics.forEach(function (t) { t.items.forEach(function (it) { it.lines.forEach(function (l) { if (t.rwAudio && DATA.rwAudioBase) l._rwSrc = DATA.rwAudioBase + t.rwAudio; }); }); });
    $('pdfLink').href = 'read.html?b=' + id;
    var t = parseInt(params.get('t'), 10);
    cur = (t ? t - 1 : sget(KEY_TOPIC, 0)) || 0;
    applyLang();
  }).catch(function () { $('content').innerHTML = '<p>' + T('loadErr') + '</p>'; applyLang(); });
})();
