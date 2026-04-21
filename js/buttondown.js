/**
 * Buttondown 邮件订阅功能
 * 用户名: luguosheng1314
 */
(function() {
  'use strict';
  
  // 获取当前语言
  function getCurrentLang() {
    return (window.i18n && window.i18n.getLang && window.i18n.getLang()) || 
           localStorage.getItem('ideas-lang') || 
           'zh-CN';
  }
  
  // 翻译文本
  var translations = {
    'zh-CN': {
      title: '邮件订阅',
      desc: '订阅我的博客，获取最新文章推送',
      button: '订阅',
      note: '隐私保护，随时可取消订阅'
    },
    'en': {
      title: 'Email Subscribe',
      desc: 'Subscribe to get latest posts',
      button: 'Subscribe',
      note: 'Privacy protected, unsubscribe anytime'
    },
    'ja': {
      title: 'メール購読',
      desc: 'ブログを購読して最新記事を受け取る',
      button: '購読',
      note: 'プライバシー保護、いつでも解除可能'
    }
  };
  
  // 在侧边栏添加订阅卡片
  function addSubscribeCard() {
    var asideContent = document.getElementById('aside-content');
    if (!asideContent) {
      console.log('[Buttondown] aside-content not found');
      return;
    }
    
    // 检查是否已添加
    if (document.querySelector('.card-subscribe')) {
      console.log('[Buttondown] Subscribe card already exists');
      return;
    }
    
    console.log('[Buttondown] Adding subscribe card...');
    
    var lang = getCurrentLang();
    console.log('[Buttondown] Current language:', lang);
    var t = translations[lang] || translations['zh-CN'];
    console.log('[Buttondown] Using translations:', t);
    
    // 创建订阅卡片
    var card = document.createElement('div');
    card.className = 'card-widget card-subscribe';
    card.innerHTML = `
      <div class="item-headline">
        <i class="fas fa-envelope"></i>
        <span data-i18n-key="subscribe-title">${t.title}</span>
      </div>
      <div class="subscribe-content">
        <p class="subscribe-desc" data-i18n-key="subscribe-desc">${t.desc}</p>
        <form action="https://buttondown.email/api/emails/embed-subscribe/luguosheng1314" method="post" target="_blank" class="buttondown-form">
          <input type="email" name="email" placeholder="your@email.com" required class="subscribe-input" />
          <button type="submit" class="subscribe-button">
            <i class="fas fa-paper-plane"></i> <span data-i18n-key="subscribe-button">${t.button}</span>
          </button>
        </form>
        <p class="subscribe-note">
          <i class="fas fa-shield-alt"></i> 
          <span data-i18n-key="subscribe-note">${t.note}</span>
        </p>
      </div>
    `;
    
    // 插入到侧边栏（在第一个卡片之后）
    var firstCard = asideContent.querySelector('.card-widget');
    if (firstCard && firstCard.nextSibling) {
      asideContent.insertBefore(card, firstCard.nextSibling);
    } else {
      asideContent.appendChild(card);
    }
    
    console.log('[Buttondown] Subscribe card added');
  }
  
  // 更新订阅卡片文本
  function updateSubscribeCardLang() {
    var card = document.querySelector('.card-subscribe');
    if (!card) {
      console.log('[Buttondown] Subscribe card not found for language update');
      return;
    }
    
    var lang = getCurrentLang();
    var t = translations[lang] || translations['zh-CN'];
    console.log('[Buttondown] Updating language to', lang, 'translations:', t);
    
    var titleSpan = card.querySelector('[data-i18n-key="subscribe-title"]');
    if (titleSpan) {
      console.log('[Buttondown] Title:', titleSpan.textContent, '->', t.title);
      titleSpan.textContent = t.title;
    }
    
    var descP = card.querySelector('[data-i18n-key="subscribe-desc"]');
    if (descP) {
      console.log('[Buttondown] Desc:', descP.textContent, '->', t.desc);
      descP.textContent = t.desc;
    }
    
    var buttonSpan = card.querySelector('[data-i18n-key="subscribe-button"]');
    if (buttonSpan) {
      console.log('[Buttondown] Button:', buttonSpan.textContent, '->', t.button);
      buttonSpan.textContent = t.button;
    }
    
    var noteSpan = card.querySelector('[data-i18n-key="subscribe-note"]');
    if (noteSpan) {
      console.log('[Buttondown] Note:', noteSpan.textContent, '->', t.note);
      noteSpan.textContent = t.note;
    }
    
    console.log('[Buttondown] Language updated to', lang);
  }
  
  // 多次尝试执行
  var maxRetries = 10;
  var retryCount = 0;
  
  function tryAddCard() {
    addSubscribeCard();
    if (!document.querySelector('.card-subscribe') && retryCount < maxRetries) {
      retryCount++;
      setTimeout(tryAddCard, 300);
    }
  }
  
  // DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAddCard);
  } else {
    tryAddCard();
  }
  
  // window.onload 兜底
  window.addEventListener('load', function() {
    setTimeout(addSubscribeCard, 200);
  });
  
  // Pjax 兼容
  document.addEventListener('pjax:complete', function() {
    retryCount = 0;
    setTimeout(addSubscribeCard, 100);
  });
  
  // 监听语言切换事件
  window.addEventListener('langchange', function(e) {
    console.log('[Buttondown] Language changed to', e.detail.lang);
    updateSubscribeCardLang();
  });
  
  console.log('[Buttondown] Script loaded');
})();
