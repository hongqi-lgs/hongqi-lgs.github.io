// 语言切换器 - 强制菜单翻译版
(function() {
  var STORAGE_KEY = 'ideas-lang';
  var currentLang = null;

  function getLang() {
    if (currentLang) return currentLang;
    var lang = localStorage.getItem(STORAGE_KEY);
    if (lang && ['zh-CN', 'en', 'ja'].includes(lang)) {
      currentLang = lang;
      return lang;
    }
    var browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('zh')) currentLang = 'zh-CN';
    else if (browserLang.startsWith('ja')) currentLang = 'ja';
    else currentLang = 'en';
    return currentLang;
  }

  function isPostPage() {
    var path = window.location.pathname;
    if (path.indexOf('/about/') !== -1) return true;
    if (path.match(/\/(tags|categories|archives|page)\//)) return false;
    if (path === '/' || path === '/index.html') return false;
    return path.match(/\/\d{4}\/\d{2}\/\d{2}\//);
  }

  function getTranslatedPath(targetLang) {
    var path = window.location.pathname;
    var cleanPath = path.replace(/\/+$/, '').replace(/\.html$/, '');
    
    if (cleanPath.indexOf('/about') !== -1) {
      if (targetLang === 'ja') return {primary: '/about/index-ja.html', fallback: '/about/index-en.html'};
      if (targetLang === 'en') return {primary: '/about/index-en.html', fallback: null};
      return {primary: '/about/', fallback: null};
    }

    var currentIsJa = cleanPath.match(/-ja$/);
    var currentIsEn = cleanPath.match(/-en$/);
    var basePath = cleanPath.replace(/-(en|ja)$/, '');

    if (targetLang === 'ja') {
      if (currentIsJa) return null;
      return {primary: basePath + '-ja/', fallback: basePath + '-en/'};
    } else if (targetLang === 'en') {
      if (currentIsEn) return null;
      return {primary: basePath + '-en/', fallback: null};
    } else {
      return (currentIsJa || currentIsEn) ? {primary: basePath + '/', fallback: null} : null;
    }
  }

  function tryJump(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, true);
    xhr.timeout = 1500;
    xhr.onload = function() { callback(xhr.status === 200); };
    xhr.onerror = xhr.ontimeout = function() { callback(false); };
    xhr.send();
  }

  function switchLang(lang) {
    console.log('[Lang] Switch to:', lang);
    localStorage.setItem(STORAGE_KEY, lang);
    currentLang = lang;
    
    if (isPostPage()) {
      var paths = getTranslatedPath(lang);
      if (!paths) {
        window.location.reload();
        return;
      }
      
      var target = paths.primary || paths;
      var fallback = paths.fallback;
      
      tryJump(target, function(ok) {
        if (ok) {
          window.location.href = target;
        } else if (fallback) {
          console.log('[Lang] 404, fallback to:', fallback);
          tryJump(fallback, function(ok2) {
            window.location.href = ok2 ? fallback : target;
          });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  }

  function filterPosts() {
    var lang = getLang();
    var posts = document.querySelectorAll('.recent-post-item');
    var visible = 0;
    
    posts.forEach(function(post) {
      var cat = post.querySelector('.article-meta__categories');
      if (!cat) return;
      
      var href = cat.getAttribute('href') || '';
      var isEn = href.indexOf('/English') > -1;
      var isJa = href.indexOf('/Japanese') > -1;
      
      var show = false;
      if (lang === 'zh-CN') show = !isEn && !isJa;
      else if (lang === 'en') show = isEn;
      else if (lang === 'ja') show = isJa || isEn;
      
      post.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    
    console.log('[Lang] Posts visible:', visible, '/ language:', lang);
  }

  // 手动翻译菜单（备用方案）
  function translateMenu() {
    var lang = getLang();
    var menuMap = {
      'zh-CN': {首页:'首页',归档:'归档',标签:'标签',分类:'分类',关于:'关于'},
      'en': {首页:'Home',归档:'Archives',标签:'Tags',分类:'Categories',关于:'About'},
      'ja': {首页:'ホーム',归档:'アーカイブ',标签:'タグ',分类:'カテゴリー',关于:'について'}
    };
    
    var trans = menuMap[lang];
    if (!trans) return;
    
    document.querySelectorAll('.menus_item a span').forEach(function(span) {
      var text = span.textContent.trim();
      // 反向查找key
      Object.keys(menuMap).forEach(function(l) {
        Object.keys(menuMap[l]).forEach(function(key) {
          if (menuMap[l][key] === text && trans[key]) {
            span.textContent = ' ' + trans[key];
          }
        });
      });
    });
    
    console.log('[Lang] Menu translated to:', lang);
  }

  function createSelector() {
    var links = document.querySelectorAll('a[href*="javascript:void"], a .fa-language');
    var processed = false;
    
    links.forEach(function(elem) {
      var link = elem.tagName === 'A' ? elem : elem.closest('a');
      if (!link || link.getAttribute('data-lang-sel')) return;
      
      var text = link.textContent.trim();
      if (!text.includes('语言') && !text.includes('Language')) return;
      
      link.setAttribute('data-lang-sel', '1');
      
      var sel = document.createElement('select');
      sel.style.cssText = 'padding:6px 12px;border:1px solid rgba(255,255,255,0.3);border-radius:4px;background:rgba(255,255,255,0.15);color:#fff;cursor:pointer;font-size:14px';
      
      var lang = getLang();
      [{v:'zh-CN',l:'🇨🇳 中文'},{v:'en',l:'🇺🇸 EN'},{v:'ja',l:'🇯🇵 日本語'}].forEach(function(o) {
        var opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.l;
        opt.style.cssText = 'background:#fff;color:#333';
        if (o.v === lang) opt.selected = true;
        sel.appendChild(opt);
      });
      
      sel.onchange = function() { switchLang(this.value); };
      link.parentNode.replaceChild(sel, link);
      processed = true;
    });
    
    if (processed) console.log('[Lang] Selector created');
  }

  function applyI18n() {
    if (window.i18n && typeof window.i18n.setLang === 'function') {
      console.log('[Lang] Calling i18n.setLang()');
      window.i18n.setLang(getLang());
    } else if (window.i18n && typeof window.i18n.apply === 'function') {
      console.log('[Lang] Calling i18n.apply()');
      window.i18n.apply();
    }
  }

  function init() {
    var lang = getLang();
    console.log('[Lang] Init, current:', lang);
    
    createSelector();
    
    var isHome = window.location.pathname === '/' || window.location.pathname.match(/^\/page\/\d+\//);
    if (isHome) {
      setTimeout(filterPosts, 100);
      setTimeout(filterPosts, 500);
    }
    
    // 翻译菜单 - 多次尝试
    setTimeout(translateMenu, 50);
    setTimeout(translateMenu, 200);
    setTimeout(translateMenu, 500);
    
    // 触发 i18n.js
    setTimeout(applyI18n, 100);
    setTimeout(applyI18n, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 10);
  }
  setTimeout(init, 300);
  setTimeout(init, 800);
  setTimeout(init, 1500);
})();
