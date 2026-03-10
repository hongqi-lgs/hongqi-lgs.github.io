// 语言切换器
(function() {
  var STORAGE_KEY = 'ideas-lang';

  function getLang() {
    var lang = localStorage.getItem(STORAGE_KEY);
    if (lang && ['zh-CN', 'en', 'ja'].includes(lang)) return lang;
    var browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('ja')) return 'ja';
    return 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    var event = new CustomEvent('langchange', { detail: { lang: lang } });
    window.dispatchEvent(event);
  }

  function isPostPage() {
    var path = window.location.pathname;
    if (path.indexOf('/about/') !== -1) return true;
    if (path.match(/\/(tags|categories|archives|page)\//)) return false;
    if (path === '/' || path === '/index.html') return false;
    return path.match(/\/\d{4}\/\d{2}\/\d{2}\//);
  }

  function getTranslatedPath(targetLang) {
    var path = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/, '');
    
    if (path.indexOf('/about') !== -1) {
      if (targetLang === 'ja') return {primary: '/about/index-ja.html', fallback: '/about/index-en.html'};
      if (targetLang === 'en') return {primary: '/about/index-en.html', fallback: null};
      return {primary: '/about/', fallback: null};
    }

    var isJa = path.match(/-ja$/);
    var isEn = path.match(/-en$/);
    var base = path.replace(/-(en|ja)$/, '');

    if (targetLang === 'ja') {
      return isJa ? null : {primary: base + '-ja/', fallback: base + '-en/'};
    } else if (targetLang === 'en') {
      return isEn ? null : {primary: base + '-en/', fallback: null};
    } else {
      return (isJa || isEn) ? {primary: base + '/', fallback: null} : null;
    }
  }

  function checkUrl(url, callback) {
    fetch(url, {method: 'HEAD'})
      .then(function(res) { callback(res.ok); })
      .catch(function() { callback(false); });
  }

  function switchLang(lang) {
    console.log('[Lang] Switch to:', lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    if (isPostPage()) {
      var paths = getTranslatedPath(lang);
      if (!paths) {
        window.location.reload();
        return;
      }
      
      var target = paths.primary || paths;
      var fallback = paths.fallback;
      
      checkUrl(target, function(ok) {
        if (ok) {
          window.location.href = target;
        } else if (fallback) {
          console.log('[Lang] Fallback:', fallback);
          checkUrl(fallback, function(ok2) {
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

  function createSelector() {
    console.log('[Lang] Creating selector...');
    var links = document.querySelectorAll('a');
    var found = 0;
    
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.getAttribute('data-lang-sel')) continue;
      
      var text = link.textContent.trim();
      var href = link.href || '';
      
      if (text.includes('语言') || href.includes('javascript:void')) {
        found++;
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
        console.log('[Lang] Selector created #' + found);
      }
    }
    
    if (found === 0) {
      console.warn('[Lang] No language link found');
    }
  }

  // 拦截菜单链接，根据语言调整URL
  function interceptMenuLinks() {
    var lang = getLang();
    console.log('[Lang] Intercepting menu links, current lang:', lang);
    
    document.querySelectorAll('.menus_item a.site-page').forEach(function(link) {
      if (link.getAttribute('data-lang-intercept')) return;
      link.setAttribute('data-lang-intercept', '1');
      
      link.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        
        // 关于页面：根据语言跳转到对应版本
        if (href && href.includes('/about')) {
          e.preventDefault();
          var targetUrl = '/about/';
          if (lang === 'en') targetUrl = '/about/index-en.html';
          else if (lang === 'ja') targetUrl = '/about/index-ja.html';
          
          console.log('[Lang] Redirecting to:', targetUrl);
          window.location.href = targetUrl;
        }
        // 其他页面（归档/标签/分类）：主题会自动根据语言显示
      });
    });
  }

  function init() {
    console.log('[Lang] Init, lang:', getLang());
    
    createSelector();
    interceptMenuLinks();  // 拦截菜单链接
    
    setLang(getLang());
  }

  // 多次尝试
  function tryInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
  
  tryInit();
  setTimeout(tryInit, 500);
  setTimeout(tryInit, 1500);
})();
