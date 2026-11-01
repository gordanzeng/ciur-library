// Shared helpers: language strings, data loading, full-text search
var I18N = {
  zh: {
    site: '卢旺达大学孔子学院 · 双语教材在线书库',
    siteSub: 'Confucius Institute at the University of Rwanda · Bilingual Library',
    heroTitle: '免费在线阅读卢大孔院自编双语教材',
    heroText: '中文–卢旺达语、中文–斯瓦希里语–英语等12种教材和读物，手机、电脑都能直接阅读，也可以下载。',
    searchPh: '搜索全部教材，例如：问候、盘古、Muraho',
    search: '搜索', all: '全部', catZh: '学中文', catRw: '学卢旺达语', catSw: '学斯瓦希里语',
    series: '中华文化故事中卢双语分级读本（7册）', others: '其他教材',
    pages: '页', read: '阅读', download: '下载PDF', contents: '目录', find: '书内搜索',
    back: '书库', prev: '上一页', next: '下一页', zoomIn: '放大', zoomOut: '缩小', fit: '适合宽度',
    loading: '正在加载…', noResult: '没有找到结果', resultsFor: '搜索结果：', searching: '正在搜索…',
    hits: '处', page: '第{n}页', clear: '返回书目', noToc: '本书暂无目录',
    footer: '© 卢旺达大学孔子学院。教材供学习使用，转载请注明出处。',
    langNames: { zh: '中文', rw: 'Kinyarwanda', en: 'English', sw: 'Kiswahili' },
    loadErr: '加载失败，请检查网络后刷新页面。',
    seqLabel: '整段连读', seqZh: '中文', seqZhRw: '中文＋卢旺达语', seqAll: '中文＋卢旺达语＋英语', playRw: '朗读卢旺达语', playEn: '朗读英语', rwCredit: '卢旺达语语音由 Meta MMS-TTS 模型（facebook/mms-tts-kin）合成，仅供学习参考；英语和中文朗读使用设备自带语音。',
    learn: '互动学习', pilot: '试点', learnBanner: '新功能试点：《实用汉语会话365句》互动学习——逐句看拼音、听朗读、对照卢旺达语和英语，还能遮住中文自测。', start: '开始学习',
    topics: '话题', showPy: '拼音', showRw: '卢旺达语', showEn: '英语', practice: '遮住中文自测', reveal: '点击显示',
    play: '朗读', playAll: '朗读整段', stop: '停止', speed: '语速', learned: '已学会', progress: '已学会 {a}/{b}',
    noVoice: '这台设备没有找到中文语音。可在手机“设置—语言与输入—文字转语音”中安装“中文（普通话）”语音，或改用 Chrome、Edge 浏览器。',
    ttsNote: '朗读暂用设备自带的合成语音，真人录音将陆续上线。', viewPage: '原书第{n}页', prevTopic: '上一课', nextTopic: '下一课', searchSent: '搜索句子（中文、拼音、卢旺达语或英语）', sentNo: '第{n}句'
  },
  en: {
    site: 'Confucius Institute at the University of Rwanda · Bilingual Library',
    siteSub: '卢旺达大学孔子学院 · 双语教材在线书库',
    heroTitle: 'Free bilingual textbooks and readers, online',
    heroText: '12 Chinese–Kinyarwanda and Kiswahili–Chinese–English books developed by the Confucius Institute at the University of Rwanda. Read on any phone or computer, or download.',
    searchPh: 'Search all books, e.g. greeting, Pangu, Muraho',
    search: 'Search', all: 'All', catZh: 'Learn Chinese', catRw: 'Learn Kinyarwanda', catSw: 'Learn Kiswahili',
    series: 'Graded Readers of Chinese Culture Stories (7 books)', others: 'Other books',
    pages: 'pages', read: 'Read', download: 'Download PDF', contents: 'Contents', find: 'Find in book',
    back: 'Library', prev: 'Previous page', next: 'Next page', zoomIn: 'Zoom in', zoomOut: 'Zoom out', fit: 'Fit width',
    loading: 'Loading…', noResult: 'No results', resultsFor: 'Results for ', searching: 'Searching…',
    hits: 'hits', page: 'p. {n}', clear: 'Back to books', noToc: 'No contents for this book',
    footer: '© Confucius Institute at the University of Rwanda. Free for learning; please credit the source when sharing.',
    langNames: { zh: 'Chinese', rw: 'Kinyarwanda', en: 'English', sw: 'Kiswahili' },
    loadErr: 'Could not load. Please check your connection and reload.',
    seqLabel: 'Dialogue plays', seqZh: 'Chinese', seqZhRw: 'Chinese + Kinyarwanda', seqAll: 'Chinese + Kinyarwanda + English', playRw: 'Play Kinyarwanda', playEn: 'Play English', rwCredit: 'Kinyarwanda audio is synthesized with Meta’s MMS-TTS model (facebook/mms-tts-kin) for learning purposes; English and Chinese use your device’s voices.',
    learn: 'Interactive', pilot: 'Pilot', learnBanner: 'New pilot: interactive “Practical Chinese 365” — pinyin, read-aloud, Kinyarwanda and English side by side, and a self-test mode that hides the Chinese.', start: 'Start learning',
    topics: 'Topics', showPy: 'Pinyin', showRw: 'Kinyarwanda', showEn: 'English', practice: 'Hide Chinese (self-test)', reveal: 'Tap to reveal',
    play: 'Play', playAll: 'Play dialogue', stop: 'Stop', speed: 'Speed', learned: 'Learned', progress: '{a}/{b} learned',
    noVoice: 'No Chinese voice was found on this device. Install a “Chinese (Mandarin)” text-to-speech voice in your phone settings, or use Chrome or Edge.',
    ttsNote: 'Read-aloud currently uses your device’s synthetic voice; recorded audio is coming.', viewPage: 'Book p. {n}', prevTopic: 'Previous', nextTopic: 'Next', searchSent: 'Search sentences (Chinese, pinyin, Kinyarwanda or English)', sentNo: 'No. {n}'
  },
  rw: {
    site: 'Ishuri rya Confucius rya Kaminuza y’u Rwanda · Isomero ry’Ibitabo by’Indimi Ebyiri',
    siteSub: '卢旺达大学孔子学院 · 双语教材在线书库 · Bilingual Library',
    heroTitle: 'Soma ku buntu ibitabo by’indimi ebyiri',
    heroText: 'Ibitabo 12 by’Igishinwa n’Ikinyarwanda, n’Igiswahili, Igishinwa n’Icyongereza, byateguwe n’Ishuri rya Confucius rya Kaminuza y’u Rwanda. Wabisoma kuri telefoni cyangwa kuri mudasobwa, cyangwa ukabimanura.',
    searchPh: 'Shakisha mu bitabo byose, urugero: Muraho, 你好',
    search: 'Shakisha', all: 'Byose', catZh: 'Kwiga Igishinwa', catRw: 'Kwiga Ikinyarwanda', catSw: 'Kwiga Igiswahili',
    series: 'Inkuru z’Umuco w’Abashinwa mu Ndimi Ebyiri (ibitabo 7)', others: 'Ibindi bitabo',
    pages: 'impapuro', read: 'Soma', download: 'Manura PDF', contents: 'Ibirimo', find: 'Shakisha mu gitabo',
    back: 'Isomero', prev: 'Urupapuro rubanza', next: 'Urupapuro rukurikira', zoomIn: 'Kongera ingano', zoomOut: 'Kugabanya ingano', fit: 'Bihuze n’ubugari',
    loading: 'Birimo gufunguka…', noResult: 'Nta gisubizo cyabonetse', resultsFor: 'Ibisubizo bya ', searching: 'Birimo gushakisha…',
    hits: 'aho byabonetse', page: 'urup. {n}', clear: 'Subira ku bitabo', noToc: 'Iki gitabo nta rutonde rw’ibirimo gifite',
    footer: '© Ishuri rya Confucius rya Kaminuza y’u Rwanda. Ni ubuntu ku bashaka kwiga; nimusangiza abandi, muvuge aho byaturutse.',
    langNames: { zh: 'Igishinwa', rw: 'Ikinyarwanda', en: 'Icyongereza', sw: 'Igiswahili' },
    loadErr: 'Ntibyakunze. Reba ko ufite murandasi hanyuma wongere ugerageze.',
    seqLabel: 'Ikiganiro gisomwa mu', seqZh: 'Igishinwa', seqZhRw: 'Igishinwa + Ikinyarwanda', seqAll: 'Igishinwa + Ikinyarwanda + Icyongereza', playRw: 'Umva Ikinyarwanda', playEn: 'Umva Icyongereza', rwCredit: 'Amajwi y’Ikinyarwanda yakozwe na porogaramu ya Meta MMS-TTS (facebook/mms-tts-kin) agamije kwiga; Icyongereza n’Igishinwa bikoresha amajwi y’igikoresho cyawe.',
    learn: 'Imyitozo', pilot: 'Igerageza', learnBanner: 'Igishya (igerageza): wiga “Igishinwa K’ibanze 365” interuro ku yindi — pinyin, kumva uko bisomwa, Ikinyarwanda n’Icyongereza, no kwisuzuma uhishe Igishinwa.', start: 'Tangira kwiga',
    topics: 'Insanganyamatsiko', showPy: 'Pinyin', showRw: 'Ikinyarwanda', showEn: 'Icyongereza', practice: 'Hisha Igishinwa (kwisuzuma)', reveal: 'Kanda urebe',
    play: 'Umva', playAll: 'Umva ikiganiro cyose', stop: 'Hagarika', speed: 'Umuvuduko', learned: 'Narabyize', progress: 'Byize {a}/{b}',
    noVoice: 'Iki gikoresho nta jwi ry’Igishinwa gifite. Shyiramo ijwi ry’“Igishinwa (Mandarin)” mu igenamiterere rya telefoni, cyangwa ukoreshe Chrome cyangwa Edge.',
    ttsNote: 'Ubu hakoreshwa ijwi rya mudasobwa; amajwi yafashwe n’abantu azaza vuba.', viewPage: 'Urup. {n} rw’igitabo', prevTopic: 'Iribanza', nextTopic: 'Irikurikira', searchSent: 'Shakisha interuro (Igishinwa, pinyin, Ikinyarwanda cyangwa Icyongereza)', sentNo: 'Interuro {n}'
  }
};

function getLang() {
  var l = null;
  try { l = localStorage.getItem('lang'); } catch (e) {}
  if (!I18N[l]) {
    var n = (navigator.language || '').toLowerCase();
    l = n.indexOf('zh') === 0 ? 'zh' : (n.indexOf('rw') === 0 || n.indexOf('kin') === 0) ? 'rw' : 'en';
  }
  return l;
}
function setLang(l) { try { localStorage.setItem('lang', l); } catch (e) {} }
function T(k) { return I18N[getLang()][k]; }
function bookTitle(b) { var l = getLang(); return l === 'zh' ? b.title_zh : l === 'rw' ? (b.title_rw || b.title_en) : b.title_en; }
function bookAltTitle(b) { return getLang() === 'zh' ? b.title_en : b.title_zh; }
function bookField(b, f) { var l = getLang(); return b[f + '_' + l] || b[f + '_en']; }
function htmlLang() { var l = getLang(); return l === 'zh' ? 'zh' : l === 'rw' ? 'rw' : 'en'; }

function getJSON(url) {
  return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}

// --- search ---
var _textCache = {};
function loadText(id) {
  if (!_textCache[id]) _textCache[id] = getJSON('data/' + id + '.text.json');
  return _textCache[id];
}
function foldStr(s) {
  // lower-case and strip diacritics so "rwanda" matches "Rwanda", "muraho" matches "Muraho"
  // length-preserving, so match positions map back onto the original text
  return s.replace(/[À-ɏḀ-ỿ]/g, function (c) { return c.normalize('NFD').charAt(0); })
          .toLowerCase().replace(/[’‘`]/g, "'");
}
function searchPages(pages, q, max) {
  var fq = foldStr(q.trim());
  if (!fq) return [];
  var out = [];
  for (var i = 0; i < pages.length; i++) {
    var t = pages[i]; if (!t) continue;
    var ft = foldStr(t);
    var at = ft.indexOf(fq);
    if (at < 0) continue;
    var count = 0, k = at; while (k >= 0 && count < 99) { count++; k = ft.indexOf(fq, k + fq.length); }
    var a = Math.max(0, at - 28), b = Math.min(t.length, at + fq.length + 40);
    var snip = (a > 0 ? '…' : '') + esc(t.slice(a, at)) + '<mark>' + esc(t.slice(at, at + fq.length)) + '</mark>' + esc(t.slice(at + fq.length, b)) + (b < t.length ? '…' : '');
    out.push({ page: i + 1, count: count, snip: snip });
    if (max && out.length >= max) break;
  }
  return out;
}
