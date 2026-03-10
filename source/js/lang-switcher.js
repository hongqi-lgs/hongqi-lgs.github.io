/**
 * lang-switcher.js — 语言选择器 + 文章页跳转
 * 文章过滤由 CSS [data-lang] 驱动，本文件只负责 UI 交互
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ideas-lang';

  function getLang() {
    var s = localStorage.getItem(STORAGE_KEY);
    if (s && ['zh-CN','en','ja'].indexOf(s) !== -1) return s;
    var bl = (navigator.language || '').toLowerCase();
    if (bl.startsWith('zh')) return 'zh-CN';
    if (bl.startsWith('ja')) return 'ja';
    return 'en';
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
    sel.style.cssText = 'padding:4px 8px;border:1px solid rgba(255,255,255,0.35);border-radius:4px;background:rgba(255,255,255,0.15);color:#fff;cursor:pointer;font-size:14px;outline:none;';
    [['zh-CN','🇨🇳 中文'],['en','🇺🇸 EN'],['ja','🇯🇵 日本語']].forEach(function(o) {
      var opt = document.createElement('option');
      opt.value = o[0]; opt.textContent = o[1];
      opt.style.cssText = 'background:#333;color:#fff;';
      if (o[0] === lang) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() { switchLang(this.value); });
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
