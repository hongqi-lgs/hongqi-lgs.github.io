/**
 * i18n.js — 森哥 Ideas 多语言支持
 * 过滤逻辑：CSS [data-lang] 属性驱动，本文件只负责 UI 翻译
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ideas-lang';

  var T = {
    menu: {
      '首页':'ホーム','归档':'アーカイブ','标签':'タグ','分类':'カテゴリー','关于':'について',
      'Home':'ホーム','Archives':'アーカイブ','Tags':'タグ','Categories':'カテゴリー','About':'について',
      // zh-CN targets
      'ホーム':'首页','アーカイブ':'归档','タグ':'标签','カテゴリー':'分类','カテゴリ':'分类','について':'关于',
    },
    sidebar: {
      '公告':'お知らせ','最新文章':'最新記事','网站信息':'サイト情報','目录':'目次','邮件订阅':'メール購読',
      '分类':'カテゴリー','标签':'タグ','归档':'アーカイブ',
      'Announcement':'お知らせ','Recent Posts':'最新記事','Site Info':'サイト情報','TOC':'目次','Email Subscribe':'メール購読',
      'Categories':'カテゴリー','Tags':'タグ','Archives':'アーカイブ',
      'お知らせ':'公告','最新記事':'最新文章','サイト情報':'网站信息','目次':'目录','メール購読':'邮件订阅',
      'カテゴリー':'分类','カテゴリ':'分类','タグ':'标签','アーカイブ':'归档',
    },
    en: {
      menu:    {'首页':'Home','归档':'Archives','标签':'Tags','分类':'Categories','关于':'About','ホーム':'Home','アーカイブ':'Archives','タグ':'Tags','カテゴリー':'Categories','カテゴリ':'Categories','について':'About'},
      sidebar: {'公告':'Announcement','最新文章':'Recent Posts','网站信息':'Site Info','目录':'TOC','邮件订阅':'Email Subscribe','分类':'Categories','标签':'Tags','归档':'Archives','お知らせ':'Announcement','最新記事':'Recent Posts','サイト情報':'Site Info','目次':'TOC','メール購読':'Email Subscribe','カテゴリー':'Categories','カテゴリ':'Categories','タグ':'Tags','アーカイブ':'Archives'},
      stats:   {'文章':'Posts','標签':'Tags','分类':'Categories','記事':'Posts','タグ':'Tags','カテゴリー':'Categories','カテゴリ':'Categories','Articles':'Posts'},
      meta:    {'发表于':'Posted on','投稿日':'Posted on'},
      pagination: {'上一篇':'Previous','下一篇':'Next','前の記事':'Previous','次の記事':'Next'},
      related: {'相关推荐':'Related Posts','関連記事':'Related Posts'},
      sign:    'The future is here. No looking back. Go with the flow.',
      announce:'Welcome to my blog! Recording ideas, tech & life.',
      reward:  'Found it helpful? Buy me a coffee ☕',
      wechat:  'WeChat', alipay: 'Alipay',
      author:  'Author: ', link: 'Post Link: ', copyright: 'Copyright: ',
      copyrightContent: 'All articles on this blog are licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> unless otherwise stated. Please credit <a href="https://hongqi-lgs.github.io/ideas" target="_blank">bob Ideas</a>!',
    },
    ja: {
      menu:    {'首页':'ホーム','归档':'アーカイブ','标签':'タグ','分类':'カテゴリー','关于':'について','Home':'ホーム','Archives':'アーカイブ','Tags':'タグ','Categories':'カテゴリー','About':'について'},
      sidebar: {'公告':'お知らせ','最新文章':'最新記事','网站信息':'サイト情報','目录':'目次','邮件订阅':'メール購読','分类':'カテゴリー','标签':'タグ','归档':'アーカイブ','Announcement':'お知らせ','Recent Posts':'最新記事','Site Info':'サイト情報','TOC':'目次','Email Subscribe':'メール購読','Categories':'カテゴリー','Tags':'タグ','Archives':'アーカイブ'},
      stats:   {'文章':'記事','标签':'タグ','分类':'カテゴリー','Posts':'記事','Articles':'記事','Tags':'タグ','Categories':'カテゴリー'},
      meta:    {'发表于':'投稿日','Posted on':'投稿日'},
      pagination: {'上一篇':'前の記事','下一篇':'次の記事','Previous':'前の記事','Next':'次の記事'},
      related: {'相关推荐':'関連記事','Related Posts':'関連記事'},
      sign:    '未来は来た、前を見ず、流れに従う。',
      announce:'ブログへようこそ！アイデア、技術、生活を記録します。',
      reward:  '役に立ちましたか？コーヒーをおごってください ☕',
      wechat:  'WeChat', alipay: 'Alipay',
      author:  '著者: ', link: '記事リンク: ', copyright: '著作権: ',
      copyrightContent: 'このブログのすべての記事は、特に明記されていない限り、<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>ライセンスの下で提供されます。出典を明記してください <a href="https://hongqi-lgs.github.io/ideas" target="_blank">森哥 Ideas</a>！',
    },
    'zh-CN': {
      menu:    {'Home':'首页','Archives':'归档','Tags':'标签','Categories':'分类','About':'关于','ホーム':'首页','アーカイブ':'归档','タグ':'标签','カテゴリー':'分类','カテゴリ':'分类','について':'关于'},
      sidebar: {'Announcement':'公告','Recent Posts':'最新文章','Site Info':'网站信息','TOC':'目录','Email Subscribe':'邮件订阅','Categories':'分类','Tags':'标签','Archives':'归档','お知らせ':'公告','最新記事':'最新文章','サイト情報':'网站信息','目次':'目录','メール購読':'邮件订阅','カテゴリー':'分类','カテゴリ':'分类','タグ':'标签','アーカイブ':'归档'},
      stats:   {'Posts':'文章','Articles':'文章','Tags':'标签','Categories':'分类','記事':'文章','タグ':'标签','カテゴリー':'分类','カテゴリ':'分类'},
      meta:    {'Posted on':'发表于','投稿日':'发表于'},
      pagination: {'Previous':'上一篇','Next':'下一篇','前の記事':'上一篇','次の記事':'下一篇'},
      related: {'Related Posts':'相关推荐','関連記事':'相关推荐'},
      sign:    '未来已来，不问前程，顺势而为。',
      announce:'欢迎来到森哥 Ideas！未来已来，不问前程，顺势而为。',
      reward:  '觉得有帮助？请我喝杯咖啡 ☕',
      wechat:  '微信', alipay: '支付宝',
      author:  '文章作者: ', link: '文章链接: ', copyright: '版权声明: ',
      copyrightContent: '本博客所有文章除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源 <a href="https://hongqi-lgs.github.io/ideas" target="_blank">森哥 Ideas</a>！',
    },
  };

  function langFromUrl() {
    var p = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/, '');
    // about 页
    if (/\/index-ja$/.test(p)) return 'ja';
    if (/\/index-en$/.test(p)) return 'en';
    if (/\/about$/.test(p)) return 'zh-CN';
    // 文章页: /YYYY/MM/DD/slug[-lang]/
    var m = p.match(/\/\d{4}\/\d{2}\/\d{2}\/(.+)$/);
    if (m) {
      var slug = m[1];
      if (/-(ja)$/.test(slug)) return 'ja';
      if (/-(en)$/.test(slug)) return 'en';
      return 'zh-CN';  // 无后缀的文章 = 中文
    }
    return null;  // 非文章页，不从 URL 推断
  }

  function getLang() {
    // 1. URL 明确指定语言 → 优先，并种入 localStorage
    var urlLang = langFromUrl();
    if (urlLang) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }
    // 2. localStorage 已有
    var s = localStorage.getItem(STORAGE_KEY);
    if (s && T[s]) return s;
    // 3. 浏览器语言 fallback，并种入 localStorage
    var bl = (navigator.language || '').toLowerCase();
    var fallback = bl.startsWith('zh') ? 'zh-CN' : bl.startsWith('ja') ? 'ja' : 'en';
    localStorage.setItem(STORAGE_KEY, fallback);
    return fallback;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    apply(lang);
  }

  function tr(dict, text) {
    return dict[text] || null;
  }

  function apply(lang) {
    var t = T[lang];
    if (!t) return;

    // CSS过滤：只需设置 html[data-lang] 属性，CSS自动隐藏对应语言
    document.documentElement.setAttribute('data-lang', lang);

    // 菜单
    document.querySelectorAll('.menus_item a.site-page span, #sidebar-menus .menus_item a span').forEach(function(el) {
      var v = tr(t.menu, el.textContent.trim());
      if (v) el.textContent = ' ' + v;
    });

    // 侧边栏标题
    document.querySelectorAll('.item-headline span').forEach(function(el) {
      var v = tr(t.sidebar, el.textContent.trim());
      if (v) el.textContent = v;
    });

    // 站点统计
    document.querySelectorAll('.site-data a .headline').forEach(function(el) {
      var v = tr(t.stats, el.textContent.trim());
      if (v) el.textContent = v;
    });

    // 文章元信息
    document.querySelectorAll('.article-meta-label').forEach(function(el) {
      var v = tr(t.meta, el.textContent.trim());
      if (v) el.textContent = v;
    });

    // 上一篇/下一篇
    document.querySelectorAll('.pagination-post .info-item-1').forEach(function(el) {
      var v = tr(t.pagination, el.textContent.trim());
      if (v) el.textContent = v;
    });

    // 相关推荐标题
    var relEl = document.querySelector('.relatedPosts .headline span');
    if (relEl) { var rv = tr(t.related, relEl.textContent.trim()); if (rv) relEl.textContent = rv; }

    // 作者/站名/签名/公告
    document.querySelectorAll('.author-info-name').forEach(function(el) { el.textContent = lang === 'en' ? 'bob' : '森哥'; });
    document.querySelectorAll('.site-name').forEach(function(el) { el.textContent = lang === 'en' ? 'bob Ideas' : '森哥 Ideas'; });
    var desc = document.querySelector('.author-info-description');
    if (desc) desc.textContent = t.sign;
    var ann = document.querySelector('.announcement_content');
    if (ann) ann.textContent = t.announce;

    // Footer
    var foot = document.querySelector('#footer .copyright');
    if (foot) foot.innerHTML = '&copy;&nbsp;2026 By ' + (lang === 'en' ? 'bob' : '森哥');

    // 打赏
    var rb = document.querySelector('.reward-button');
    if (rb) { var ic = rb.querySelector('i'); rb.innerHTML = (ic ? ic.outerHTML : '') + t.reward; }

    // 版权区域
    document.querySelectorAll('.post-copyright-meta').forEach(function(el) {
      var text = el.textContent.trim();
      var ic = el.querySelector('i');
      var ih = ic ? ic.outerHTML : '';
      if (text.includes('文章作者') || text.includes('Author') || text.includes('著者'))
        el.innerHTML = ih + t.author;
      else if (text.includes('文章链接') || text.includes('Post Link') || text.includes('記事'))
        el.innerHTML = ih + t.link;
      else if (text.includes('版权') || text.includes('Copyright') || text.includes('著作権'))
        el.innerHTML = ih + t.copyright;
    });
    var ci = document.querySelector('.post-copyright__notice .post-copyright-info');
    if (ci) ci.innerHTML = t.copyrightContent;
  }

  window.i18n = { getLang: getLang, setLang: setLang, apply: apply };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() { apply(getLang()); });
  document.addEventListener('pjax:complete', function() { apply(getLang()); });

})();
