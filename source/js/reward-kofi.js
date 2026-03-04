/**
 * 在打赏按钮旁边添加 Ko-fi 按钮（并排显示，不在弹窗内）
 */
(function() {
  'use strict';
  
  function addKofiButton() {
    // 找到打赏容器（.post-reward 是整个打赏区域）
    var postReward = document.querySelector('.post-reward');
    if (!postReward) {
      console.log('[Ko-fi] .post-reward not found');
      return;
    }
    
    // 检查是否已经添加过
    if (document.querySelector('.reward-buttons-wrapper')) {
      console.log('[Ko-fi] Button wrapper already exists');
      return;
    }
    
    // 找到原始的打赏按钮（.reward-button）
    var rewardButton = postReward.querySelector('.reward-button');
    if (!rewardButton) {
      console.log('[Ko-fi] .reward-button not found');
      return;
    }
    
    // 找到弹窗容器（.reward-main）
    var rewardMain = postReward.querySelector('.reward-main');
    if (!rewardMain) {
      console.log('[Ko-fi] .reward-main not found');
      return;
    }
    
    console.log('[Ko-fi] Adding button...');
    
    // 创建按钮容器（让两个按钮并排显示）
    var buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'reward-buttons-wrapper';
    
    // 将 buttonWrapper 插入到 .post-reward 的最前面（在 .reward-button 之前）
    postReward.insertBefore(buttonWrapper, postReward.firstChild);
    
    // 将原始按钮移到 wrapper 里
    buttonWrapper.appendChild(rewardButton);
    
    // 创建分隔符
    var separator = document.createElement('span');
    separator.className = 'reward-button-separator';
    separator.textContent = 'or';
    buttonWrapper.appendChild(separator);
    
    // 创建 Ko-fi 按钮
    var kofiBtn = document.createElement('a');
    kofiBtn.className = 'kofi-inline-button';
    kofiBtn.href = 'https://ko-fi.com/xiaosen';
    kofiBtn.target = '_blank';
    kofiBtn.rel = 'noopener noreferrer';
    
    var icon = document.createElement('i');
    icon.className = 'fas fa-coffee';
    kofiBtn.appendChild(icon);
    
    var span = document.createElement('span');
    span.textContent = ' Ko-fi';
    kofiBtn.appendChild(span);
    
    // 阻止 Ko-fi 按钮触发弹窗事件
    kofiBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      // 确保弹窗关闭
      if (rewardMain) {
        rewardMain.style.display = 'none';
      }
    });
    
    kofiBtn.addEventListener('mouseenter', function(e) {
      e.stopPropagation();
      // 确保弹窗不显示
      if (rewardMain) {
        rewardMain.style.display = 'none';
      }
    });
    
    buttonWrapper.appendChild(kofiBtn);
    
    console.log('[Ko-fi] Button added successfully');
    console.log('[Ko-fi] Wrapper:', buttonWrapper);
    console.log('[Ko-fi] Parent:', buttonWrapper.parentNode);
  }
  
  // 多次尝试执行（确保覆盖各种加载时机）
  var maxRetries = 10;
  var retryCount = 0;
  
  function tryAddButton() {
    addKofiButton();
    // 如果失败且还有重试次数，继续重试
    if (!document.querySelector('.reward-buttons-wrapper') && retryCount < maxRetries) {
      retryCount++;
      console.log('[Ko-fi] Retry attempt', retryCount);
      setTimeout(tryAddButton, 300);
    }
  }
  
  // DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAddButton);
  } else {
    tryAddButton();
  }
  
  // window.onload 兜底
  window.addEventListener('load', function() {
    setTimeout(addKofiButton, 200);
  });
  
  // Pjax 兼容
  document.addEventListener('pjax:complete', function() {
    retryCount = 0; // 重置重试计数
    setTimeout(addKofiButton, 100);
  });
})();
