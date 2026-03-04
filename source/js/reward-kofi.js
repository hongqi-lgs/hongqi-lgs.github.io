/**
 * 在打赏区域添加 Ko-fi 按钮
 */
(function() {
  'use strict';
  
  function addKofiButton() {
    // 找到打赏主容器
    var rewardMain = document.querySelector('.reward-main');
    if (!rewardMain) return;
    
    // 检查是否已经添加过（避免重复）
    if (rewardMain.querySelector('.kofi-button')) return;
    
    // 创建 Ko-fi 按钮容器
    var wrapper = document.createElement('div');
    wrapper.className = 'post-reward-wrapper';
    
    // 创建 Ko-fi 按钮
    var kofiBtn = document.createElement('a');
    kofiBtn.className = 'kofi-button';
    kofiBtn.href = 'https://ko-fi.com/xiaosen';
    kofiBtn.target = '_blank';
    kofiBtn.rel = 'noopener noreferrer';
    
    // 添加图标
    var icon = document.createElement('i');
    icon.className = 'fas fa-coffee';
    kofiBtn.appendChild(icon);
    
    // 添加文本
    var span = document.createElement('span');
    span.textContent = ' International Support (Ko-fi)';
    kofiBtn.appendChild(span);
    
    wrapper.appendChild(kofiBtn);
    
    // 创建分隔线
    var separator = document.createElement('div');
    separator.className = 'reward-separator';
    separator.innerHTML = '<span>Or scan QR code (China)</span>';
    
    // 插入到打赏区域最前面
    rewardMain.insertBefore(separator, rewardMain.firstChild);
    rewardMain.insertBefore(wrapper, rewardMain.firstChild);
  }
  
  // DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addKofiButton);
  } else {
    addKofiButton();
  }
  
  // Pjax 兼容（Butterfly 主题支持 Pjax 页面切换）
  document.addEventListener('pjax:complete', addKofiButton);
  
  // 延迟执行（确保主题初始化完成）
  setTimeout(addKofiButton, 500);
})();
