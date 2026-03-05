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
    return 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function toggleLang() {
    var current = getLang();
    var next = current === 'zh-CN' ? 'en' : 'zh-CN';

    // 文章详情页：跳转到对应语言版本
    if (isPostPage()) {
      var targetPath = getTranslatedPostPath(next);
      if (targetPath) {
        localStorage.setItem(STORAGE_KEY, next);
        window.location.href = targetPath;
        return;
      }
    }

    setLang(next);
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
    // 去掉末尾斜杠便于处理
    var cleanPath = path.replace(/\/+$/, '');

    // 特殊处理：关于页面
    if (cleanPath.indexOf('/about') !== -1) {
      if (targetLang === 'en') {
        // 中文 → 英文
        if (cleanPath.match(/\/about\/index-en$/)) {
          return null; // 已经是英文版
        }
        return '/about/index-en.html';
      } else {
        // 英文 → 中文
        if (cleanPath.match(/\/about\/index-en/)) {
          return '/about/';
        }
        return null; // 已经是中文版
      }
    }

    // 文章页面
    if (targetLang === 'en') {
      // 中文 → 英文：加 -en
      if (cleanPath.match(/-en$/)) {
        return null; // 已经是英文版
      }
      return cleanPath + '-en/';
    } else {
      // 英文 → 中文：去掉 -en
      if (cleanPath.match(/-en$/)) {
        return cleanPath.replace(/-en$/, '/');
      }
      return null; // 已经是中文版
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
      document.title = lang === 'en' ? 'Archives - bob Ideas' : '归档 - 森哥 Ideas';
    } else if (currentTitle.includes('标签') || currentTitle.includes('Tags')) {
      document.title = lang === 'en' ? 'Tags - bob Ideas' : '标签 - 森哥 Ideas';
    } else if (currentTitle.includes('分类') || currentTitle.includes('Categories')) {
      document.title = lang === 'en' ? 'Categories - bob Ideas' : '分类 - 森哥 Ideas';
    } else if (currentTitle.includes('关于') || currentTitle.includes('About')) {
      document.title = lang === 'en' ? 'About - bob Ideas' : '关于 - 森哥 Ideas';
    } else if (currentTitle === '森哥 Ideas' || currentTitle === 'bob Ideas' || currentTitle === '红齐 Ideas' || currentTitle === 'Hongqi Ideas') {
      // 首页
      document.title = lang === 'en' ? 'bob Ideas' : '森哥 Ideas';
    }
    // 文章详情页的 title 由 post-map 中的数据替换（如果需要）

    // --- 菜单项 ---
    var menuSelectors = '.menus_item a span, #sidebar-menus .menus_item a span';
    var menuMap = {
      '首页': true, 'Home': true,
      '归档': true, 'Archives': true,
      '标签': true, 'Tags': true,
      '分类': true, 'Categories': true,
      '关于': true, 'About': true,
    };
    document.querySelectorAll(menuSelectors).forEach(function (span) {
      var text = span.textContent.trim();
      var key = textToKey[text];
      if (key && menuMap[translations['zh-CN'][key]]) {
        span.textContent = ' ' + t[key];
      }
    });

    // --- 语言切换按钮 ---
    document.querySelectorAll('[data-i18n-role="lang-switch"]').forEach(function (btn) {
      var span = btn.querySelector('span');
      if (span) span.textContent = ' ' + t['lang_switch'];
    });

    // --- 侧边栏标题 ---
    var headlineKeys = { '公告': true, '最新文章': true, '网站信息': true, '目录': true,
      'Announcement': true, 'Recent Posts': true, 'Site Info': true, 'TOC': true };
    document.querySelectorAll('.item-headline span').forEach(function (span) {
      var text = span.textContent.trim();
      if (headlineKeys[text]) {
        var key = textToKey[text];
        if (key && t[key]) span.textContent = t[key];
      }
    });

    // --- 分类/标签/归档 卡片标题 ---
    var cardKeys = { '分类': true, '标签': true, '归档': true,
      'Categories': true, 'Tags': true, 'Archives': true };
    document.querySelectorAll('.card-categories .item-headline span, .card-tag-cloud .item-headline span, .card-archives .item-headline span').forEach(function (span) {
      var text = span.textContent.trim();
      if (cardKeys[text]) {
        var key = textToKey[text];
        if (key && t[key]) span.textContent = t[key];
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
    // 侧边栏和主导航中的统计项
    document.querySelectorAll('.site-data a .headline').forEach(function (el) {
      var text = el.textContent.trim();
      // 文章
      if (text === '文章' || text === 'Posts') {
        el.textContent = t['文章'];
      }
      // 标签
      else if (text === '标签' || text === 'Tags') {
        el.textContent = t['标签_stat'];
      }
      // 分类
      else if (text === '分类' || text === 'Categories') {
        el.textContent = t['分类_stat'];
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
    document.querySelectorAll('.article-meta-label').forEach(function (el) {
      var text = el.textContent.trim();
      if (text === '发表于' || text === 'Posted on') {
        el.textContent = t['发表于'];
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
      if (lang === 'en') {
        copyrightInfo.innerHTML = 'All articles on this blog are licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> unless otherwise stated. Please credit <a href="https://hongqi-lgs.github.io/ideas" target="_blank">bob Ideas</a>!';
      } else {
        copyrightInfo.innerHTML = '本博客所有文章除特别声明外，均采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a> 许可协议。转载请注明来源 <a href="https://hongqi-lgs.github.io/ideas" target="_blank">森哥 Ideas</a>！';
      }
    }

    // --- 上一篇/下一篇 ---
    document.querySelectorAll('.pagination-post .info-item-1').forEach(function (el) {
      var text = el.textContent.trim();
      if (text === '上一篇' || text === 'Previous') el.textContent = t['prev_post'];
      if (text === '下一篇' || text === 'Next') el.textContent = t['next_post'];
    });

    // --- 相关推荐 ---
    var relatedHeadline = document.querySelector('.relatedPosts .headline span');
    if (relatedHeadline) {
      var rText = relatedHeadline.textContent.trim();
      if (rText === '相关推荐' || rText === 'Related Posts') {
        relatedHeadline.textContent = t['related_posts'];
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
      } else {
        // 非中文非英文，默认显示英文
        item.style.display = isEnglish ? '' : 'none';
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

  // 绑定语言切换按钮事件
  function bindLangSwitch() {
    document.querySelectorAll('.menus_item a, #sidebar-menus .menus_item a').forEach(function (a) {
      // 已经绑定过的跳过
      if (a.getAttribute('data-i18n-bound')) return;

      var text = a.textContent.trim();
      var href = a.getAttribute('href') || '';
      if (text.includes('English') || text.includes('中文') || a.querySelector('.fa-language')) {
        a.setAttribute('data-i18n-role', 'lang-switch');
        a.setAttribute('data-i18n-bound', '1');
        a.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          toggleLang();
          // 关闭移动端侧边栏（如果打开了）
          var mask = document.getElementById('menu-mask');
          if (mask) mask.click();
        });
      }
    });
  }

  // 完整初始化
  function fullInit() {
    bindLangSwitch();
    applyLang(getLang());
  }

  // 多次执行确保覆盖 Butterfly 的异步渲染
  function robustInit() {
    fullInit();
    // Butterfly 的 main.js 可能有异步操作，延迟再执行一次
    setTimeout(fullInit, 300);
    setTimeout(fullInit, 800);
    setTimeout(fullInit, 1500);
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', robustInit);
  } else {
    robustInit();
  }

  // window.onload 兜底（等所有资源加载完）
  window.addEventListener('load', function () {
    setTimeout(fullInit, 200);
  });

  // Pjax 兼容
  document.addEventListener('pjax:complete', function () {
    setTimeout(robustInit, 100);
  });

  // MutationObserver：监听 DOM 变化，自动重新应用
  // 只监听侧边栏和菜单区域的变化
  var observerTimer = null;
  var isApplying = false; // 防止递归触发
  var observer = new MutationObserver(function () {
    // 如果正在应用语言，跳过
    if (isApplying) return;
    
    // 防抖：DOM 频繁变化时不要每次都执行
    if (observerTimer) clearTimeout(observerTimer);
    observerTimer = setTimeout(function () {
      isApplying = true;
      bindLangSwitch();
      applyLang(getLang());
      // 延迟恢复，确保本次修改完成
      setTimeout(function () {
        isApplying = false;
      }, 100);
    }, 200);
  });

  // 开始观察
  function startObserver() {
    var targets = [
      document.getElementById('nav'),
      document.getElementById('aside-content'),
      document.getElementById('sidebar'),
      document.getElementById('footer')
    ];
    targets.forEach(function (target) {
      if (target) {
        observer.observe(target, { childList: true, subtree: true, characterData: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }

  // --- 文章映射缓存 ---
  var postMapCache = null;
  var postMapLoading = false;
  var postMapCallbacks = [];

  function loadPostMap(callback) {
    if (postMapCache) {
      callback(postMapCache);
      return;
    }
    postMapCallbacks.push(callback);
    if (postMapLoading) return;
    postMapLoading = true;

    var rootPath = '/ideas/';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', rootPath + 'post-map.json?v=' + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            postMapCache = JSON.parse(xhr.responseText);
          } catch (e) {
            postMapCache = {};
          }
        } else {
          postMapCache = {};
        }
        postMapLoading = false;
        var cbs = postMapCallbacks.slice();
        postMapCallbacks = [];
        cbs.forEach(function (cb) { cb(postMapCache); });
      }
    };
    xhr.send();
  }

  // 替换上下篇和相关推荐中的文章链接
  function translatePostLinks(lang) {
    loadPostMap(function (map) {
      var currentPath = window.location.pathname;
      var currentEntry = map[currentPath];

      // --- 上下篇导航：用同语言的 prev/next 完全重建 ---
      if (currentEntry) {
        var prevKey = lang === 'en' ? 'prev' : (lang + '_prev');
        var nextKey = lang === 'en' ? 'next' : (lang + '_next');
        // 如果当前页面本身就是目标语言，直接用 prev/next
        // 如果是翻译后的语言，用 {lang}_prev/{lang}_next
        var isCurrentLangMatch = (lang === 'en' && currentPath.match(/-en\/?$/)) ||
                                  (lang === 'zh-CN' && !currentPath.match(/-en\/?$/));
        
        var targetPrev, targetNext;
        if (isCurrentLangMatch) {
          targetPrev = currentEntry.prev;
          targetNext = currentEntry.next;
        } else {
          // 切换语言后，使用对应语言的 prev/next
          targetPrev = currentEntry[lang + '_prev'] || null;
          targetNext = currentEntry[lang + '_next'] || null;
        }

        var paginationItems = document.querySelectorAll('.pagination-post .pagination-related');
        paginationItems.forEach(function (a, index) {
          // Butterfly: 第一个是上一篇(prev)，第二个是下一篇(next)
          var target = index === 0 ? targetPrev : targetNext;
          if (target && target.path && target.title) {
            a.setAttribute('href', target.path);
            a.setAttribute('title', target.title);
            a.style.display = '';
            var titleEl = a.querySelector('.info-item-2');
            if (titleEl) titleEl.textContent = target.title;
            // 摘要：用 post-map 中的 excerpt 替换
            var excerptEl = a.querySelector('.info-2 .info-item-1');
            if (excerptEl) {
              if (target.excerpt) {
                excerptEl.textContent = target.excerpt;
                excerptEl.parentElement.style.display = '';
              } else {
                excerptEl.parentElement.style.display = 'none';
              }
            }
          } else {
            // 没有对应的上/下篇，隐藏
            a.style.display = 'none';
          }
        });
      }

      // --- 相关推荐：替换为对应语言版本 ---
      var targetPathKey = lang + '_path';
      var targetTitleKey = lang + '_title';
      document.querySelectorAll('.relatedPosts-list .pagination-related').forEach(function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        var info = map[href];
        // 检查当前链接是否已经是目标语言的文章
        var alreadyTargetLang = (lang === 'en' && /-en\/?$/.test(href)) ||
                                 (lang === 'zh-CN' && !/-en\/?$/.test(href));
        if (alreadyTargetLang) {
          // 已经是目标语言，保留原始内容（包括摘要）
          var excerptEl = a.querySelector('.info-2');
          if (excerptEl) excerptEl.style.display = '';
          return;
        }
        if (info && info[targetPathKey]) {
          a.setAttribute('href', info[targetPathKey]);
          var titleEl = a.querySelector('.info-item-2');
          if (titleEl && info[targetTitleKey]) {
            titleEl.textContent = info[targetTitleKey];
          }
          if (info[targetTitleKey]) {
            a.setAttribute('title', info[targetTitleKey]);
          }
          // 替换摘要为目标语言版本
          var excerptEl = a.querySelector('.info-2 .info-item-1');
          var targetExcerptKey = lang + '_excerpt';
          if (excerptEl && info[targetExcerptKey]) {
            excerptEl.textContent = info[targetExcerptKey];
            var parentEl = a.querySelector('.info-2');
            if (parentEl) parentEl.style.display = '';
          } else if (excerptEl) {
            // 没有翻译摘要，隐藏
            var infoDiv = a.querySelector('.info-2');
            if (infoDiv) infoDiv.style.display = 'none';
          }
        }
      });
    });
  }

  // 替换 Archives 页面的文章标题
  function translateArchiveLinks(lang) {
    loadPostMap(function (map) {
      var archiveItems = document.querySelectorAll('#archive .article-sort-item');
      archiveItems.forEach(function (item) {
        var link = item.querySelector('a.article-sort-item-title');
        if (!link) return;
        var href = link.getAttribute('href') || '';
        
        // 判断当前文章是否是英文
        var isEnglish = /-en\/?$/.test(href);
        
        // 如果当前语言和文章语言不匹配，尝试替换
        if (lang === 'en' && !isEnglish) {
          // 需要显示英文版
          var info = map[href];
          if (info && info.en_path && info.en_title) {
            link.setAttribute('href', info.en_path);
            link.textContent = info.en_title;
            link.setAttribute('title', info.en_title);
            item.style.display = '';
          } else {
            // 没有英文版，隐藏
            item.style.display = 'none';
          }
        } else if (lang === 'zh-CN' && isEnglish) {
          // 需要显示中文版（去掉 -en 后缀）
          var zhPath = href.replace(/-en\/?$/, '/');
          var info = map[zhPath];
          if (info && info.title) {
            link.setAttribute('href', zhPath);
            link.textContent = info.title;
            link.setAttribute('title', info.title);
            item.style.display = '';
          } else {
            // 没有中文版，隐藏
            item.style.display = 'none';
          }
        } else {
          // 语言匹配，显示
          item.style.display = '';
        }
      });
      
      // 更新归档页标题数量统计
      var visibleCount = document.querySelectorAll('#archive .article-sort-item:not([style*="display: none"])').length;
      // 减去年份标题
      var yearTitles = document.querySelectorAll('#archive .article-sort-item.year').length;
      visibleCount = Math.max(0, visibleCount - yearTitles);
      
      var archiveTitle = document.querySelector('#archive .article-sort-title');
      if (archiveTitle) {
        if (lang === 'en') {
          archiveTitle.textContent = 'All Posts - ' + visibleCount;
        } else {
          archiveTitle.textContent = '全部文章 - ' + visibleCount;
        }
      }
    });
  }

  // 暴露全局 API
  window.i18n = {
    getLang: getLang,
    setLang: setLang,
    toggleLang: toggleLang,
    apply: function () { applyLang(getLang()); }
  };
})();


















