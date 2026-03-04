/**
 * 重写打赏区域：单按钮 + Tab切换（Ko-fi / 微信 / 支付宝）
 */
(function() {
  'use strict';
  
  function rebuildRewardArea() {
    var postReward = document.querySelector('.post-reward');
    if (!postReward) {
      console.log('[Reward] .post-reward not found');
      return;
    }
    
    // 检查是否已经重建过
    if (document.querySelector('.reward-panel-rebuilt')) {
      console.log('[Reward] Already rebuilt');
      return;
    }
    
    console.log('[Reward] Rebuilding reward area...');
    
    // 清空原有内容
    postReward.innerHTML = '';
    postReward.className = 'post-reward reward-panel-rebuilt';
    
    // 创建触发按钮
    var triggerBtn = document.createElement('div');
    triggerBtn.className = 'reward-trigger-button';
    triggerBtn.innerHTML = '<i class="fas fa-coffee"></i> 请我喝杯咖啡';
    
    // 创建弹窗面板
    var panel = document.createElement('div');
    panel.className = 'reward-panel';
    panel.style.display = 'none';
    
    // 创建 Tab 导航
    var tabNav = document.createElement('div');
    tabNav.className = 'reward-tabs';
    tabNav.innerHTML = `
      <button class="reward-tab active" data-tab="kofi">
        <i class="fas fa-coffee"></i> Ko-fi
      </button>
      <button class="reward-tab" data-tab="wechat">
        <i class="fab fa-weixin"></i> 微信
      </button>
      <button class="reward-tab" data-tab="alipay">
        <i class="fab fa-alipay"></i> 支付宝
      </button>
    `;
    
    // 创建 Tab 内容区
    var tabContent = document.createElement('div');
    tabContent.className = 'reward-tab-content';
    tabContent.innerHTML = `
      <div class="reward-content active" data-content="kofi">
        <p style="margin-bottom: 20px; color: #666;">Support me on Ko-fi</p>
        <a href="https://ko-fi.com/xiaosen" target="_blank" rel="noopener noreferrer" class="kofi-button-large">
          <i class="fas fa-coffee"></i>
          <span>Buy me a coffee on Ko-fi</span>
        </a>
      </div>
      <div class="reward-content" data-content="wechat">
        <p style="margin-bottom: 15px; color: #07c160; font-weight: 600;">微信扫码打赏</p>
        <img src="/images/wx.jpg" alt="微信" style="width: 200px; height: 200px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);" />
      </div>
      <div class="reward-content" data-content="alipay">
        <p style="margin-bottom: 15px; color: #1677ff; font-weight: 600;">支付宝扫码打赏</p>
        <img src="/images/zfb.jpg" alt="支付宝" style="width: 200px; height: 200px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);" />
      </div>
    `;
    
    panel.appendChild(tabNav);
    panel.appendChild(tabContent);
    postReward.appendChild(triggerBtn);
    postReward.appendChild(panel);
    
    // ========== 交互逻辑 ==========
    var isOpen = false;
    
    // 点击按钮切换面板
    triggerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      isOpen = !isOpen;
      panel.style.display = isOpen ? 'block' : 'none';
      console.log('[Reward] Panel toggled:', isOpen);
    });
    
    // Tab 切换
    var tabs = tabNav.querySelectorAll('.reward-tab');
    var contents = tabContent.querySelectorAll('.reward-content');
    
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function(e) {
        e.stopPropagation();
        var targetTab = this.getAttribute('data-tab');
        
        // 更新 Tab 激活状态
        tabs.forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        
        // 更新内容显示
        contents.forEach(function(content) {
          if (content.getAttribute('data-content') === targetTab) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
        
        console.log('[Reward] Switched to tab:', targetTab);
      });
    });
    
    // 点击外部关闭面板
    document.addEventListener('click', function(e) {
      if (isOpen && !postReward.contains(e.target)) {
        isOpen = false;
        panel.style.display = 'none';
        console.log('[Reward] Panel closed by outside click');
      }
    });
    
    // 点击面板内部不关闭
    panel.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    console.log('[Reward] Rebuild complete');
  }
  
  // 多次尝试执行
  var maxRetries = 10;
  var retryCount = 0;
  
  function tryRebuild() {
    rebuildRewardArea();
    if (!document.querySelector('.reward-panel-rebuilt') && retryCount < maxRetries) {
      retryCount++;
      console.log('[Reward] Retry attempt', retryCount);
      setTimeout(tryRebuild, 300);
    }
  }
  
  // DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryRebuild);
  } else {
    tryRebuild();
  }
  
  // window.onload 兜底
  window.addEventListener('load', function() {
    setTimeout(rebuildRewardArea, 200);
  });
  
  // Pjax 兼容
  document.addEventListener('pjax:complete', function() {
    retryCount = 0;
    setTimeout(rebuildRewardArea, 100);
  });
})();
