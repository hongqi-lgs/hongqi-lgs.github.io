/**
 * Buttondown 订阅者同步脚本
 * 从 Buttondown API 获取订阅者列表，更新到 subscribers.json
 * 
 * 使用方法：
 *   node sync-buttondown.js
 * 
 * 环境变量：
 *   BUTTONDOWN_API_KEY - Buttondown API Key
 */

const fs = require('fs');
const path = require('path');

// 配置
const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
const SUBSCRIBERS_FILE = path.join(__dirname, '../data/subscribers.json');

// Buttondown API 文档: https://docs.buttondown.email/api-reference/subscribers

async function fetchButtondownSubscribers() {
  console.log('🔄 Fetching subscribers from Buttondown...');
  
  const response = await fetch('https://api.buttondown.email/v1/subscribers', {
    headers: {
      'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Buttondown API error: ${response.status} ${error}`);
  }
  
  const data = await response.json();
  
  // 调试：打印 API 响应结构
  console.log('📋 Buttondown API response:', JSON.stringify(data, null, 2));
  
  // Buttondown API 可能直接返回数组，也可能是 { results: [...] }
  const subscribers = Array.isArray(data) ? data : (data.results || []);
  console.log(`✅ Found ${subscribers.length} subscribers from Buttondown`);
  
  return subscribers;
}

function loadLocalSubscribers() {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
}

function saveSubscribers(subscribers) {
  const dir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
  
  // 确保至少有一个订阅者（你自己）
  if (subscribers.length === 0) {
    console.log('⚠️  No subscribers from Buttondown, adding default subscriber');
    subscribers = [{
      email: 'luguosheng1314@126.com',
      name: '小森哥哥',
      subscribed_at: new Date().toISOString().split('T')[0],
      source: 'manual'
    }];
  }
  
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  console.log(`💾 Saved ${subscribers.length} subscribers to ${SUBSCRIBERS_FILE}`);
}

function mergeSubscribers(buttondownSubs, localSubs) {
  // 将 Buttondown 订阅者转换为标准格式
  const buttondownEmails = new Set(buttondownSubs.map(s => s.email));
  
  const merged = buttondownSubs.map(s => {
    // 安全获取订阅日期
    let subscribedDate = new Date().toISOString().split('T')[0];
    if (s.creation_date) {
      subscribedDate = s.creation_date.split('T')[0];
    } else if (s.created) {
      subscribedDate = s.created.split('T')[0];
    } else if (s.subscribe_date) {
      subscribedDate = s.subscribe_date.split('T')[0];
    }
    
    // 安全获取名字
    let name = s.email ? s.email.split('@')[0] : 'Unknown';
    if (s.name) {
      name = s.name;
    } else if (s.metadata?.name) {
      name = s.metadata.name;
    }
    
    return {
      email: s.email,
      name: name,
      subscribed_at: subscribedDate,
      source: 'buttondown'
    };
  });
  
  // 保留本地手动添加的订阅者（不在 Buttondown 中的）
  const manualSubs = localSubs.filter(s => !buttondownEmails.has(s.email));
  manualSubs.forEach(s => {
    s.source = 'manual';
    merged.push(s);
  });
  
  return merged;
}

async function main() {
  console.log('🚀 Starting Buttondown sync...\n');
  
  // 检查 API Key
  if (!BUTTONDOWN_API_KEY) {
    console.error('❌ BUTTONDOWN_API_KEY not found in environment');
    console.error('   Get your API key from: https://buttondown.email/settings');
    process.exit(1);
  }
  
  try {
    // 获取 Buttondown 订阅者
    const buttondownSubs = await fetchButtondownSubscribers();
    
    // 读取本地订阅者
    const localSubs = loadLocalSubscribers();
    console.log(`📋 Current local subscribers: ${localSubs.length}`);
    
    // 合并订阅者
    const merged = mergeSubscribers(buttondownSubs, localSubs);
    console.log(`\n🔀 Merged subscribers: ${merged.length}`);
    console.log(`   - From Buttondown: ${merged.filter(s => s.source === 'buttondown').length}`);
    console.log(`   - Manual: ${merged.filter(s => s.source === 'manual').length}`);
    
    // 保存
    saveSubscribers(merged);
    console.log(`\n✅ Subscribers synced to: ${SUBSCRIBERS_FILE}`);
    
    // 显示新增订阅者
    const localEmails = new Set(localSubs.map(s => s.email));
    const newSubs = merged.filter(s => !localEmails.has(s.email));
    
    if (newSubs.length > 0) {
      console.log(`\n🎉 New subscribers (${newSubs.length}):`);
      newSubs.forEach(s => {
        console.log(`   - ${s.email} (${s.name})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
