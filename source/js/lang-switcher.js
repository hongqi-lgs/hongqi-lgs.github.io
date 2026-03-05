// 语言切换器 - 简化版
(function() {
  function getLang() {
    var lang = localStorage.getItem('ideas-lang');
    if (lang && ['zh-CN', 'en', 'ja'].includes(lang)) return lang;
    var browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('ja')) return 'ja';
    return 'en';
  }

  function switchLang(lang) {
    localStorage.setItem('ideas-lang', lang);
    window.location.reload();
  }

  function init() {
    console.log('[Lang Switcher] Initializing...');
    
    // 查找所有包含"语言"的链接
    var links = document.querySelectorAll('a');
    var replaced = false;
    
    links.forEach(function(link) {
      if (link.textContent.includes('语言') || link.href.includes('javascript:void')) {
        console.log('[Lang Switcher] Found link:', link.textContent);
        
        // 创建选择器
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
          console.log('[Lang Switcher] Switching to:', this.value);
          switchLang(this.value);
        });
        
        // 替换链接
        link.parentNode.replaceChild(select, link);
        replaced = true;
        console.log('[Lang Switcher] Link replaced successfully');
      }
    });
    
    if (!replaced) {
      console.warn('[Lang Switcher] No language link found');
    }
  }

  // 多次尝试初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  setTimeout(init, 500);
  setTimeout(init, 1000);
  setTimeout(init, 2000);
})();
