/**
 * Buttondown 邮件订阅功能
 * 用户名: luguosheng1314
 */
(function() {
  'use strict';
  
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
    
    // 创建订阅卡片
    var card = document.createElement('div');
    card.className = 'card-widget card-subscribe';
    card.innerHTML = `
      <div class="item-headline">
        <i class="fas fa-envelope"></i>
        <span>邮件订阅</span>
      </div>
      <div class="subscribe-content">
        <p class="subscribe-desc">订阅我的博客，获取最新文章推送</p>
        <form action="https://buttondown.email/api/emails/embed-subscribe/luguosheng1314" method="post" target="_blank" class="buttondown-form">
          <input type="email" name="email" placeholder="your@email.com" required class="subscribe-input" />
          <button type="submit" class="subscribe-button">
            <i class="fas fa-paper-plane"></i> 订阅
          </button>
        </form>
        <p class="subscribe-note">
          <i class="fas fa-shield-alt"></i> 
          隐私保护，随时可取消订阅
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
  
  console.log('[Buttondown] Script loaded');
})();
