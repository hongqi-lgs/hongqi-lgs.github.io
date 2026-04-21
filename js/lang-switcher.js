/**
 * lang-switcher.js — 语言选择器 + 文章页跳转
 * 文章过滤由 CSS [data-lang] 驱动，本文件只负责 UI 交互
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ideas-lang';

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
    if (s && ['zh-CN','en','ja'].indexOf(s) !== -1) return s;
    // 3. 浏览器语言 fallback，并种入 localStorage
    var bl = (navigator.language || '').toLowerCase();
    var fallback = bl.startsWith('zh') ? 'zh-CN' : bl.startsWith('ja') ? 'ja' : 'en';
    localStorage.setItem(STORAGE_KEY, fallback);
    return fallback;
  }

  function isPostPage() {
    var p = window.location.pathname;
    if (p.indexOf('/about') !== -1) return true;
    if (/\/(tags|categories|archives|page)\//.test(p)) return false;
    if (p === '/' || p === '/index.html') return false;
    return /\/\d{4}\/\d{2}\/\d{2}\//.test(p);
  }

  function getTargetPath(lang) {
    var p = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/, '');
    if (p.indexOf('/about') !== -1) {
      if (lang === 'ja') return '/about/index-ja.html';
      if (lang === 'en') return '/about/index-en.html';
      return '/about/';
    }
    var base = p.replace(/-(en|ja)$/, '');
    if (lang === 'ja') return base + '-ja/';
    if (lang === 'en') return base + '-en/';
    return base + '/';
  }

  function switchLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    if (isPostPage()) {
      var target = getTargetPath(lang);
      fetch(target, { method: 'HEAD' })
        .then(function(r) { window.location.href = r.ok ? target : '/'; })
        .catch(function() { window.location.href = target; });
    } else {
      if (window.i18n) window.i18n.setLang(lang);
    }
  }

  function makeSelect(lang) {
    var sel = document.createElement('select');
    sel.style.cssText = 'padding:5px 10px;border:1.5px solid #c8bfb0;border-radius:6px;background:#faf8f4;color:#3a3128;cursor:pointer;font-size:13px;font-weight:500;outline:none;min-width:100px;transition:border-color 0.2s ease,box-shadow 0.2s ease;';
    [['zh-CN','🇨🇳 中文'],['en','🇺🇸 EN'],['ja','🇯🇵 日本語']].forEach(function(o) {
      var opt = document.createElement('option');
      opt.value = o[0]; opt.textContent = o[1];
      opt.style.cssText = 'background:#faf8f4;color:#3a3128;';
      if (o[0] === lang) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() { switchLang(this.value); });
    sel.addEventListener('mouseover', function() {
      this.style.borderColor = '#8b6f47';
      this.style.boxShadow = '0 0 0 2px rgba(139,111,71,0.12)';
    });
    sel.addEventListener('mouseout', function() {
      this.style.borderColor = '#c8bfb0';
      this.style.boxShadow = 'none';
    });
    return sel;
  }

  function init() {
    var lang = getLang();
    // 找所有 javascript:void(0) 的语言菜单链接（顶部+侧边栏各一个）
    document.querySelectorAll('a.site-page[href="javascript:void(0)"]').forEach(function(link) {
      if (link.getAttribute('data-lang-sel')) return; // 防重复
      link.setAttribute('data-lang-sel', '1');
      link.parentNode.replaceChild(makeSelect(lang), link);
    });

    // 拦截关于页链接
    document.querySelectorAll('.menus_item a.site-page[href*="/about"]').forEach(function(link) {
      if (link.getAttribute('data-about-intercept')) return;
      link.setAttribute('data-about-intercept', '1');
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var l = getLang();
        window.location.href = l === 'en' ? '/about/index-en.html' : l === 'ja' ? '/about/index-ja.html' : '/about/';
      });
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(init);
  document.addEventListener('pjax:complete', init);

})();
