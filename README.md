# 卢旺达大学孔子学院 · 双语教材在线书库
Confucius Institute at the University of Rwanda · Bilingual Library

卢旺达大学孔子学院自编的中文–卢旺达语、斯瓦希里语–中文–英语教材和读物，共12种，可免费在线阅读和下载。

## 目录结构

| 路径 | 内容 |
|---|---|
| `index.html` | 书目首页（分类筛选、全库搜索；界面可切换中文 / English / Kinyarwanda） |
| `learn.html` | 互动学习（试点：《实用汉语会话365句》） |
| `read.html` | 在线阅读器（目录跳转、书内搜索、记住阅读位置） |
| `books/` | 教材 PDF（已压缩、线性化，可边下边看） |
| `covers/` | 封面缩略图 |
| `data/books.json` | 书目信息（书名、简介、语种、级别、是否公开） |
| `data/toc.json` | 各书目录与页码 |
| `data/*.text.json` | 各书逐页文字，用于搜索 |
| `data/learn/chinese-365.json` | 365句的结构化数据：52个话题、364个编号句（原书无第301句）、747句话轮，含拼音、汉字、卢旺达语、英语和原书页码 |
| `vendor/pdfjs/` | PDF.js 3.11.174（Mozilla，Apache-2.0 许可） |

## 常见维护

- **暂时下架某本书**：在 `data/books.json` 中把该书的 `"public": true` 改为 `false`。
- **修改简介或书名**：直接编辑 `data/books.json` 中的对应字段。
- **新增一本书**：需要重新生成封面、目录和搜索数据，请联系维护者处理。

## 互动学习与语音

- 朗读目前使用浏览器自带的中文合成语音（Web Speech API），手机或电脑上没有中文语音时，页面会提示安装方法。
- **接入真人录音**：把录音按 `编号-句序.mp3` 命名，例如第64句的两句话分别命名为 `064-1.mp3`、`064-2.mp3`，放进 `audio/chinese-365/` 文件夹；然后在 `data/learn/chinese-365.json` 的最外层加上 `"audioBase":"audio/chinese-365/"`。网站就会自动改为播放录音。
- 学习进度（“已学会”标记）保存在学员自己的浏览器里，不需要注册账号。

## 界面语言

界面提供中文、English、Kinyarwanda 三种语言，文案在 `assets/common.js` 的 `I18N` 中。卢旺达语文案为 1.0 版，尚未经母语者校对。
