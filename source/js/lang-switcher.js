// 语言切换器 - 带页面跳转
(function() {
  function getLang() {
    var lang = localStorage.getItem('ideas-lang');
    if (lang && ['zh-CN', 'en', 'ja'].includes(lang)) return lang;
    var browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('ja')) return 'ja';
    return 'en';
  }

  function isPostPage() {
    var path = window.location.pathname;
    // 关于页面
    if (path.indexOf('/about/') !== -1) return true;
    // 排除特殊页面
    if (path.match(/\/(tags|categories|archives|page)\//)) return false;
    // 首页
    if (path === '/' || path === '/index.html') return false;
    // 有年月日的文章路径
    if (path.match(/\/\d{4}\/\d{2}\/\d{2}\//)) return true;
    return false;
  }

  function getTranslatedPath(targetLang) {
    var path = window.location.pathname;
    var cleanPath = path.replace(/\/+$/, '').replace(/\.html$/, '');
    
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

    // 文章页面
    var currentIsJa = cleanPath.match(/-ja$/);
    var currentIsEn = cleanPath.match(/-en$/);
    var basePath = cleanPath.replace(/-(en|ja)$/, '');

    if (targetLang === 'ja') {
      if (currentIsJa) return null;
      // 检查日文版本是否存在（先尝试跳转，如果404则回退到英文）
      return basePath + '-ja/';
    } else if (targetLang === 'en') {
      if (currentIsEn) return null;
      return basePath + '-en/';
    } else {
      // 中文
      return (currentIsJa || currentIsEn) ? basePath + '/' : null;
    }
  }

  function switchLang(lang) {
    console.log('[Lang Switcher] Switching to:', lang);
    localStorage.setItem('ideas-lang', lang);
    
    // 如果在文章页，尝试跳转到对应语言版本
    if (isPostPage()) {
      var targetPath = getTranslatedPath(lang);
      if (targetPath) {
        console.log('[Lang Switcher] Jumping to:', targetPath);
        window.location.href = targetPath;
        return;
      }
    }
    
    // 否则刷新页面（i18n.js会处理UI翻译）
    console.log('[Lang Switcher] Reloading page');
    window.location.reload();
  }

  function init() {
    console.log('[Lang Switcher] Initializing...');
    
    var links = document.querySelectorAll('a');
    var replaced = false;
    
    links.forEach(function(link) {
      if (link.getAttribute('data-lang-bound')) return;
      
      if (link.textContent.includes('语言') || link.href.includes('javascript:void')) {
        console.log('[Lang Switcher] Found link:', link.textContent);
        link.setAttribute('data-lang-bound', '1');
        
        var select = document.createElement('select');
        select.style.cssText = 'padding: 6px 12px; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; background: rgba(255,255,255,0.15); color: #fff; cursor: pointer; font-size: 14px;';
        
        var currentLang = getLang();
        var options = [
          {value: 'zh-CN', label: '🇨🇳 中文'},
          {value: 'en', label: '🇺🇸 EN'},
          {value: 'ja', label: '🇯🇵 日本語'}
        ];
        
        options.forEach(function(opt) {
          var option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          option.style.cssText = 'background: #fff; color: #333;';
          if (opt.value === currentLang) option.selected = true;
          select.appendChild(option);
        });
        
        select.addEventListener('change', function() {
          switchLang(this.value);
        });
        
        link.parentNode.replaceChild(select, link);
        replaced = true;
        console.log('[Lang Switcher] Link replaced successfully');
      }
    });
    
    if (!replaced) {
      console.warn('[Lang Switcher] No language link found');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  setTimeout(init, 500);
  setTimeout(init, 1000);
})();
