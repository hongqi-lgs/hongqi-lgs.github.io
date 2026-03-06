/**
 * i18n 国际化脚本 — 森哥 Ideas
 * 支持中英文自动/手动切换
 * 根据浏览器语言自动检测，支持手动切换，localStorage 持久化
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ideas-lang';

  // 翻译映射
  var translations = {
    'zh-CN': {
      '首页': '首页',
      '归档': '归档',
      '标签': '标签',
      '分类': '分类',
      '关于': '关于',
      '公告': '公告',
      '最新文章': '最新文章',
      '网站信息': '网站信息',
      '文章数目': '文章数目',
      '本站访客数': '本站访客数',
      '本站总浏览量': '本站总浏览量',
      '最后更新时间': '最后更新时间',
      '文章': '文章',
      '标签_stat': '标签',
      '分类_stat': '分类',
      '签名': '未来已来，不问前程，顺势而为。',
      '公告内容': '欢迎来到我的博客！记录想法、技术与生活。',
      'copyright_by': 'By 森哥',
      '发表于': '发表于',
      'lang_switch': '🌐 English',
      '目录': '目录',
      '搜索': '搜索',
      'reward_text': '觉得有帮助？请我喝杯咖啡 ☕',
      'wechat': '微信',
      'alipay': '支付宝',
      'post_author': '文章作者: ',
      'post_link': '文章链接: ',
      'copyright_notice': '版权声明: ',
      'copyright_content': '本博客所有文章除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源 <a href="https://hongqi-lgs.github.io/ideas" target="_blank">森哥 Ideas</a>！',
      'prev_post': '上一篇',
      'next_post': '下一篇',
      'related_posts': '相关推荐',
    },
    'en': {
      '首页': 'Home',
      '归档': 'Archives',
      '标签': 'Tags',
      '分类': 'Categories',
      '关于': 'About',
      '公告': 'Announcement',
      '最新文章': 'Recent Posts',
      '网站信息': 'Site Info',
      '文章数目': 'Posts',
      '本站访客数': 'Visitors',
      '本站总浏览量': 'Page Views',
      '最后更新时间': 'Last Updated',
      '文章': 'Posts',
      '标签_stat': 'Tags',
      '分类_stat': 'Categories',
      '签名': 'The future is here. No looking back. Go with the flow.',
      '公告内容': 'Welcome to my blog! Recording ideas, tech & life.',
      'copyright_by': 'By bob',
      '发表于': 'Posted on',
      'lang_switch': '🌐 中文',
      '目录': 'TOC',
      '搜索': 'Search',
      'reward_text': 'Found it helpful? Buy me a coffee ☕',
      'wechat': 'WeChat',
      'alipay': 'Alipay',
      'post_author': 'Author: ',
      'post_link': 'Post Link: ',
      'copyright_notice': 'Copyright: ',
      'copyright_content': 'All articles on this blog are licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> unless otherwise stated. Please credit <a href="https://hongqi-lgs.github.io/ideas" target="_blank">bob Ideas</a>!',
      'prev_post': 'Previous',
      'next_post': 'Next',
      'related_posts': 'Related Posts',
    }
  };
    'ja': {
      '首页': 'ホーム',
      '归档': 'アーカイブ',
      '标签': 'タグ',
      '分类': 'カテゴリー',
      '关于': 'について',
      '公告': 'お知らせ',
      '最新文章': '最新記事',
      '网站信息': 'サイト情報',
      '文章数目': '記事数',
      '本站访客数': '訪問者数',
      '本站总浏览量': 'ページビュー',
      '最后更新时间': '最終更新',
      '文章': '記事',
      '标签_stat': 'タグ',
      '分类_stat': 'カテゴリー',
      '签名': '未来は来た、前を見ず、流れに従う。',
      '公告内容': 'ブログへようこそ！アイデア、技術、生活を記録します。',
      'copyright_by': 'By 森哥',
      '发表于': '投稿日',
      'lang_switch': '🌐 中文',
      '目录': '目次',
      '搜索': '検索',
      'reward_text': '役に立ちましたか？コーヒーをおごってください ☕',
      'wechat': 'WeChat',
      'alipay': 'Alipay',
      'post_author': '著者: ',
      'post_link': '記事リンク: ',
      'copyright_notice': '著作権: ',
      'copyright_content': 'このブログのすべての記事は、特に明記されていない限り、<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>ライセンスの下で提供されます。出典を明記してください <a href="https://hongqi-lgs.github.io/ideas" target="_blank">森哥 Ideas</a>！',
      'prev_post': '前の記事',
      'next_post': '次の記事',
      'related_posts': '関連記事',
  },
  };

  // 双向查找表：任意文本 → 翻译 key
  var textToKey = {};
  Object.keys(translations).forEach(function (lang) {
    var t = translations[lang];
    Object.keys(t).forEach(function (key) {
      textToKey[t[key]] = key;
    });
  });

  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && translations[stored]) return stored;
    var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('ja')) return 'ja';
    return 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }


  // 判断是否在文章详情页或关于页面
  function isPostPage() {
    var path = window.location.pathname;
    
    // 关于页面支持语言切换
    if (path.indexOf('/about/') !== -1) {
      return true;
    }
    
    // 排除其他特殊页面
    var specialPages = ['/tags/', '/categories/', '/archives/', '/link/'];
    for (var i = 0; i < specialPages.length; i++) {
      if (path.indexOf(specialPages[i]) !== -1 && path.replace(/.*\/ideas/, '').replace(specialPages[i], '').replace(/\//g, '') === '') {
        return false;
      }
    }
    // 首页
    var rootPath = '/ideas/';
    if (path === rootPath || path === rootPath.slice(0, -1) || path === '/') {
      return false;
    }
    // 有文章内容元素
    return !!document.getElementById('post') || !!document.querySelector('.post');
  }

  // 获取对应语言版本的文章路径
  function getTranslatedPostPath(targetLang) {
    var path = window.location.pathname;
    var cleanPath = path.replace(/\/+$/, '');

    // 关于页面
    if (cleanPath.indexOf('/about') !== -1) {
      if (targetLang === 'ja') {
        return cleanPath.match(/index-ja/) ? null : '/about/index-ja.html';
      } else if (targetLang === 'en') {
        return cleanPath.match(/index-en/) ? null : '/about/index-en.html';
      } else {
        return cleanPath.match(/index-(en|ja)/) ? '/about/' : null;
      }
    }

    // 文章页面 - 优先日文，回退英文
    var currentIsJa = cleanPath.match(/-ja$/);
    var currentIsEn = cleanPath.match(/-en$/);
    var basePath = cleanPath.replace(/-(en|ja)$/, '');

    if (targetLang === 'ja') {
      return currentIsJa ? null : basePath + '-ja/';
    } else if (targetLang === 'en') {
      return currentIsEn ? null : basePath + '-en/';
    } else {
      return (currentIsJa || currentIsEn) ? basePath + '/' : null;
    }
  }

  // 核心：应用语言到所有 UI 元素
  function applyLang(lang) {
    var t = translations[lang];
    if (!t) return;

    document.documentElement.setAttribute('data-lang', lang);

    // --- 页面 Title ---
    var currentTitle = document.title;
    // 处理不同页面类型的 title
    if (currentTitle.includes('归档') || currentTitle.includes('Archives')) {
      document.title = lang === 'ja' ? 'アーカイブ - 森哥 Ideas' : (lang === 'en' ? 'Archives - bob Ideas' : '归档 - 森哥 Ideas');
    } else if (currentTitle.includes('标签') || currentTitle.includes('Tags')) {
      document.title = lang === 'ja' ? 'タグ - 森哥 Ideas' : (lang === 'en' ? 'Tags - bob Ideas' : '标签 - 森哥 Ideas');
    } else if (currentTitle.includes('分类') || currentTitle.includes('Categories')) {
      document.title = lang === 'ja' ? 'カテゴリー - 森哥 Ideas' : (lang === 'en' ? 'Categories - bob Ideas' : '分类 - 森哥 Ideas');
    } else if (currentTitle.includes('关于') || currentTitle.includes('About')) {
      document.title = lang === 'ja' ? 'について - 森哥 Ideas' : (lang === 'en' ? 'About - bob Ideas' : '关于 - 森哥 Ideas');
    } else if (currentTitle === '森哥 Ideas' || currentTitle === 'bob Ideas' || currentTitle === '红齐 Ideas' || currentTitle === 'Hongqi Ideas') {
      // 首页
      document.title = lang === 'ja' ? '森哥 Ideas' : (lang === 'en' ? 'bob Ideas' : '森哥 Ideas');
    }
    // 文章详情页的 title 由 post-map 中的数据替换（如果需要）

    // --- 菜单项 ---
    // 菜单项：直接文本匹配（支持中英日互译）
    var menuTranslations = {
      '首页': { 'zh-CN': '首页', 'en': 'Home', 'ja': 'ホーム' },
      'Home': { 'zh-CN': '首页', 'en': 'Home', 'ja': 'ホーム' },
      'ホーム': { 'zh-CN': '首页', 'en': 'Home', 'ja': 'ホーム' },
      
      '归档': { 'zh-CN': '归档', 'en': 'Archives', 'ja': 'アーカイブ' },
      'Archives': { 'zh-CN': '归档', 'en': 'Archives', 'ja': 'アーカイブ' },
      'アーカイブ': { 'zh-CN': '归档', 'en': 'Archives', 'ja': 'アーカイブ' },
      
      '标签': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      'Tags': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      'タグ': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      
      '分类': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      'Categories': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      'カテゴリー': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      
      '关于': { 'zh-CN': '关于', 'en': 'About', 'ja': 'について' },
      'About': { 'zh-CN': '关于', 'en': 'About', 'ja': 'について' },
      'について': { 'zh-CN': '关于', 'en': 'About', 'ja': 'について' },
    };
    
    document.querySelectorAll('.menus_item a.site-page span, #sidebar-menus .menus_item a span').forEach(function (span) {
      var text = span.textContent.trim();
      if (menuTranslations[text]) {
        span.textContent = ' ' + menuTranslations[text][lang];
      }
    });

    // --- 语言切换按钮 ---
    document.querySelectorAll('[data-i18n-role="lang-switch"]').forEach(function (btn) {
      var span = btn.querySelector('span');
      if (span) span.textContent = ' ' + t['lang_switch'];
    });

    // --- 侧边栏标题 ---
    var headlineTranslations = {
      '公告': { 'zh-CN': '公告', 'en': 'Announcement', 'ja': 'お知らせ' },
      'Announcement': { 'zh-CN': '公告', 'en': 'Announcement', 'ja': 'お知らせ' },
      'お知らせ': { 'zh-CN': '公告', 'en': 'Announcement', 'ja': 'お知らせ' },
      
      '最新文章': { 'zh-CN': '最新文章', 'en': 'Recent Posts', 'ja': '最新記事' },
      'Recent Posts': { 'zh-CN': '最新文章', 'en': 'Recent Posts', 'ja': '最新記事' },
      '最新記事': { 'zh-CN': '最新文章', 'en': 'Recent Posts', 'ja': '最新記事' },
      
      '网站信息': { 'zh-CN': '网站信息', 'en': 'Site Info', 'ja': 'サイト情報' },
      'Site Info': { 'zh-CN': '网站信息', 'en': 'Site Info', 'ja': 'サイト情報' },
      'サイト情報': { 'zh-CN': '网站信息', 'en': 'Site Info', 'ja': 'サイト情報' },
      
      '目录': { 'zh-CN': '目录', 'en': 'TOC', 'ja': '目次' },
      'TOC': { 'zh-CN': '目录', 'en': 'TOC', 'ja': '目次' },
      '目次': { 'zh-CN': '目录', 'en': 'TOC', 'ja': '目次' },
    };
    
    document.querySelectorAll('.item-headline span').forEach(function (span) {
      var text = span.textContent.trim();
      if (headlineTranslations[text]) {
        span.textContent = headlineTranslations[text][lang];
      }
    });

    // --- 分类/标签/归档 卡片标题 ---
    var cardTranslations = {
      '分类': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      'Categories': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      'カテゴリー': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      
      '标签': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      'Tags': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      'タグ': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      
      '归档': { 'zh-CN': '归档', 'en': 'Archives', 'ja': 'アーカイブ' },
      'Archives': { 'zh-CN': '归档', 'en': 'Archives', 'ja': 'アーカイブ' },
      'アーカイブ': { 'zh-CN': '归档', 'en': 'Archives', 'ja': 'アーカイブ' },
    };
    
    document.querySelectorAll('.card-categories .item-headline span, .card-tag-cloud .item-headline span, .card-archives .item-headline span').forEach(function (span) {
      var text = span.textContent.trim();
      if (cardTranslations[text]) {
        span.textContent = cardTranslations[text][lang];
      }
    });

    // --- 作者名称（森哥 → bob） ---
    document.querySelectorAll('.author-info-name').forEach(function (el) {
      if (lang === 'en') {
        el.textContent = 'bob';
      } else {
        el.textContent = '森哥';
      }
    });

    // --- 网站标题（森哥 Ideas） ---
    document.querySelectorAll('.site-name, .nav-site-title .site-name').forEach(function (el) {
      if (lang === 'en') {
        el.textContent = 'bob Ideas';
      } else {
        el.textContent = '森哥 Ideas';
      }
    });

    // --- 作者描述 ---
    var authorDesc = document.querySelector('.author-info-description');
    if (authorDesc) authorDesc.textContent = t['签名'];

    // --- 公告内容 ---
    var announcement = document.querySelector('.announcement_content');
    if (announcement) announcement.textContent = t['公告内容'];

    // --- 站点统计 (文章/标签/分类) ---
    var statsTranslations = {
      '文章': { 'zh-CN': '文章', 'en': 'Posts', 'ja': '記事' },
      'Posts': { 'zh-CN': '文章', 'en': 'Posts', 'ja': '記事' },
      '記事': { 'zh-CN': '文章', 'en': 'Posts', 'ja': '記事' },
      
      '标签': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      'Tags': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      'タグ': { 'zh-CN': '标签', 'en': 'Tags', 'ja': 'タグ' },
      
      '分类': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      'Categories': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
      'カテゴリー': { 'zh-CN': '分类', 'en': 'Categories', 'ja': 'カテゴリー' },
    };
    
    document.querySelectorAll('.site-data a .headline').forEach(function (el) {
      var text = el.textContent.trim();
      if (statsTranslations[text]) {
        el.textContent = statsTranslations[text][lang];
      }
    });

    // --- 网站信息项 ---
    var webinfoOrder = ['文章数目', '本站访客数', '本站总浏览量', '最后更新时间'];
    var webinfoEls = document.querySelectorAll('.webinfo-item .item-name');
    webinfoEls.forEach(function (el, i) {
      if (webinfoOrder[i] && t[webinfoOrder[i]]) {
        el.textContent = t[webinfoOrder[i]] + ' :';
      }
    });

    // --- 文章元信息 "发表于" ---
    var metaTranslations = {
      '发表于': { 'zh-CN': '发表于', 'en': 'Posted on', 'ja': '投稿日' },
      'Posted on': { 'zh-CN': '发表于', 'en': 'Posted on', 'ja': '投稿日' },
      '投稿日': { 'zh-CN': '发表于', 'en': 'Posted on', 'ja': '投稿日' },
    };
    
    document.querySelectorAll('.article-meta-label').forEach(function (el) {
      var text = el.textContent.trim();
      if (metaTranslations[text]) {
        el.textContent = metaTranslations[text][lang];
      }
    });

    // --- Footer ---
    var copyright = document.querySelector('#footer .copyright');
    if (copyright) {
      copyright.innerHTML = '&copy;&nbsp;2026 ' + t['copyright_by'];
    }

    // --- 打赏区域 ---
    var rewardBtn = document.querySelector('.reward-button');
    if (rewardBtn) {
      var icon = rewardBtn.querySelector('i');
      var iconHtml = icon ? icon.outerHTML : '';
      rewardBtn.innerHTML = iconHtml + t['reward_text'];
    }
    var qrDescs = document.querySelectorAll('.post-qr-code-desc');
    qrDescs.forEach(function (desc) {
      var text = desc.textContent.trim();
      if (text === '微信' || text === 'WeChat') desc.textContent = t['wechat'];
      if (text === '支付宝' || text === 'Alipay') desc.textContent = t['alipay'];
    });
    // 二维码图片 alt 也翻译
    document.querySelectorAll('.post-qr-code-img').forEach(function (img) {
      var alt = img.getAttribute('alt') || '';
      if (alt === '微信' || alt === 'WeChat') img.setAttribute('alt', t['wechat']);
      if (alt === '支付宝' || alt === 'Alipay') img.setAttribute('alt', t['alipay']);
    });

    // --- 文章版权区域 ---
    document.querySelectorAll('.post-copyright-meta').forEach(function (el) {
      var text = el.textContent.trim();
      if (text.includes('文章作者') || text.includes('Author')) {
        el.innerHTML = el.querySelector('i').outerHTML + t['post_author'] + ' ';
      } else if (text.includes('文章链接') || text.includes('Post Link')) {
        el.innerHTML = el.querySelector('i').outerHTML + t['post_link'] + ' ';
      } else if (text.includes('版权声明') || text.includes('Copyright')) {
        el.innerHTML = el.querySelector('i').outerHTML + t['copyright_notice'] + ' ';
      }
    });
    // 版权声明内容
    var copyrightInfo = document.querySelector('.post-copyright__notice .post-copyright-info');
    if (copyrightInfo) {
      copyrightInfo.innerHTML = t['copyright_content'];
    }

    // --- 上一篇/下一篇 ---
    var paginationTranslations = {
      '上一篇': { 'zh-CN': '上一篇', 'en': 'Previous', 'ja': '前の記事' },
      'Previous': { 'zh-CN': '上一篇', 'en': 'Previous', 'ja': '前の記事' },
      '前の記事': { 'zh-CN': '上一篇', 'en': 'Previous', 'ja': '前の記事' },
      
      '下一篇': { 'zh-CN': '下一篇', 'en': 'Next', 'ja': '次の記事' },
      'Next': { 'zh-CN': '下一篇', 'en': 'Next', 'ja': '次の記事' },
      '次の記事': { 'zh-CN': '下一篇', 'en': 'Next', 'ja': '次の記事' },
    };
    
    document.querySelectorAll('.pagination-post .info-item-1').forEach(function (el) {
      var text = el.textContent.trim();
      if (paginationTranslations[text]) {
        el.textContent = paginationTranslations[text][lang];
      }
    });

    // --- 相关推荐 ---
    var relatedTranslations = {
      '相关推荐': { 'zh-CN': '相关推荐', 'en': 'Related Posts', 'ja': '関連記事' },
      'Related Posts': { 'zh-CN': '相关推荐', 'en': 'Related Posts', 'ja': '関連記事' },
      '関連記事': { 'zh-CN': '相关推荐', 'en': 'Related Posts', 'ja': '関連記事' },
    };
    
    var relatedHeadline = document.querySelector('.relatedPosts .headline span');
    if (relatedHeadline) {
      var rText = relatedHeadline.textContent.trim();
      if (relatedTranslations[rText]) {
        relatedHeadline.textContent = relatedTranslations[rText][lang];
      }
    }

    // --- 文章详情页：替换上下篇和相关推荐的链接 ---
    translatePostLinks(lang);

    // --- 首页文章列表语言过滤 ---
    filterPostsByLang(lang);
  }

  // 根据语言过滤首页文章卡片、归档页面和侧边栏最新文章
  function filterPostsByLang(lang) {
    // 首页文章卡片
    var postItems = document.querySelectorAll('.recent-post-item');
    postItems.forEach(function (item) {
      var catLink = item.querySelector('.article-meta__categories');
      var isEnglish = false;
      if (catLink) {
        isEnglish = catLink.getAttribute('href').indexOf('/English') !== -1 ||
                    catLink.textContent.trim() === 'English';
      }
      if (lang === 'en') {
        item.style.display = isEnglish ? '' : 'none';
      } else if (lang === 'zh-CN') {
        item.style.display = isEnglish ? 'none' : '';
      } else if (lang === 'ja') {
        // 日语：优先显示日文，没有则显示英文
        var isJapanese = catLink && (catLink.getAttribute('href').indexOf('/Japanese') !== -1 || catLink.textContent.trim() === 'Japanese');
        item.style.display = (isJapanese || isEnglish) ? '' : 'none';
      }
    });

    // 归档页面文章列表（使用 post-map 替换标题）
    translateArchiveLinks(lang);

    // 侧边栏最新文章
    var asideItems = document.querySelectorAll('.card-recent-post .aside-list-item');
    asideItems.forEach(function (item) {
      var link = item.querySelector('a.title');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      var title = link.textContent.trim();
      // 判断是否英文文章：URL 包含 -en/ 或标题全英文
      var isEnglish = /-en\/?$/.test(href) || /^[A-Za-z0-9\s\?\!\.\,\-\:\'\"]+$/.test(title);
      if (lang === 'en') {
        item.style.display = isEnglish ? '' : 'none';
      } else if (lang === 'zh-CN') {
        item.style.display = isEnglish ? 'none' : '';
      } else {
        item.style.display = isEnglish ? '' : 'none';
      }
    });
  }





  // 暴露全局 API
  window.i18n = {
    getLang: getLang,
    setLang: setLang,
    apply: function () { applyLang(getLang()); }
  };

  // 监听语言切换事件
  window.addEventListener('langchange', function(e) {
    console.log('[i18n] langchange event:', e.detail.lang);
    applyLang(e.detail.lang);
  });

  // 页面加载时立即应用
  (function autoInit() {
    var currentLang = getLang();
    console.log('[i18n] Auto-init, lang:', currentLang);
    applyLang(currentLang);
  })();
})();
