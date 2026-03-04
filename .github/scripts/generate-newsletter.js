/**
 * 智能 Newsletter 生成脚本
 * 支持周报、月报、单篇文章等多种模式
 * 
 * 使用方法：
 *   node generate-newsletter.js weekly    # 生成周报
 *   node generate-newsletter.js monthly   # 生成月报
 *   node generate-newsletter.js latest    # 最新文章
 */

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const RSS_URL = 'https://xiaoxiaduoyan.com/atom.xml';
const BLOG_URL = 'https://xiaoxiaduoyan.com';

// 生成周报内容
async function generateWeekly() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  
  // 获取最近7天的文章
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentArticles = feed.items.filter(item => {
    const pubDate = new Date(item.pubDate);
    return pubDate >= oneWeekAgo;
  });
  
  if (recentArticles.length === 0) {
    return null; // 本周无更新
  }
  
  const subject = `📮 本周精选 (${getWeekRange()})`;
  
  const intro = `
这周我更新了 ${recentArticles.length} 篇文章，涵盖技术实践、AI应用等话题。

以下是本周精选：
  `.trim();
  
  const articlesList = recentArticles.map((article, index) => {
    const excerpt = getExcerpt(article);
    return `
## ${index + 1}. ${article.title}

📅 ${formatDate(article.pubDate)}

${excerpt}

👉 [阅读全文](${article.link})
    `.trim();
  }).join('\n\n---\n\n');
  
  const outro = `
💬 欢迎回复这封邮件与我交流想法。

📧 转发给朋友订阅：${BLOG_URL}

---
红齐 Ideas · 技术·产品·思考
  `.trim();
  
  return {
    subject,
    content: `${intro}\n\n---\n\n${articlesList}\n\n${outro}`,
    articles: recentArticles
  };
}

// 生成月报内容
async function generateMonthly() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  
  // 获取最近30天的文章
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  const recentArticles = feed.items.filter(item => {
    const pubDate = new Date(item.pubDate);
    return pubDate >= oneMonthAgo;
  });
  
  if (recentArticles.length === 0) {
    return null;
  }
  
  const subject = `📮 ${getCurrentMonth()}月刊 - 精选${recentArticles.length}篇`;
  
  // 按分类整理
  const byCategory = {};
  recentArticles.forEach(article => {
    // 从 URL 或标签推断分类（简化处理）
    const category = '技术实践'; // 可以扩展分类逻辑
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(article);
  });
  
  const intro = `
${getCurrentMonth()}月，我在博客更新了 ${recentArticles.length} 篇文章。

本期亮点：
${recentArticles.slice(0, 3).map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

---
  `.trim();
  
  const categoryBlocks = Object.entries(byCategory).map(([category, articles]) => {
    const list = articles.map((article, index) => {
      const excerpt = getExcerpt(article);
      return `
### ${article.title}

📅 ${formatDate(article.pubDate)}

${excerpt}

👉 [阅读全文](${article.link})
      `.trim();
    }).join('\n\n');
    
    return `## ${category}\n\n${list}`;
  }).join('\n\n---\n\n');
  
  const outro = `
💬 这个月的内容，你最感兴趣哪篇？回复告诉我。

📧 转发给朋友订阅：${BLOG_URL}

---
红齐 Ideas · 技术·产品·思考
  `.trim();
  
  return {
    subject,
    content: `${intro}\n\n${categoryBlocks}\n\n${outro}`,
    articles: recentArticles
  };
}

// 生成最新文章通知
async function generateLatest() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  
  if (!feed.items || feed.items.length === 0) {
    throw new Error('No articles found');
  }
  
  const article = feed.items[0];
  const excerpt = getExcerpt(article);
  
  const subject = `新文章：${article.title}`;
  
  const content = `
你好！

我刚发布了一篇新文章：

# ${article.title}

📅 ${formatDate(article.pubDate)}

${excerpt}

👉 [阅读全文](${article.link})

---

💬 有什么想法？回复这封邮件与我交流。

📧 转发给朋友订阅：${BLOG_URL}

---
红齐 Ideas · 技术·产品·思考
  `.trim();
  
  return {
    subject,
    content,
    articles: [article]
  };
}

// 辅助函数
function getExcerpt(article) {
  let text = '';
  if (article.contentSnippet) {
    text = article.contentSnippet;
  } else if (article.content) {
    text = article.content.replace(/<[^>]*>/g, '');
  } else {
    text = '点击阅读全文查看完整内容。';
  }
  
  // 限制长度
  if (text.length > 200) {
    text = text.substring(0, 200) + '...';
  }
  
  return text;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function getWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

// 主函数
async function main() {
  const mode = process.argv[2] || 'latest';
  
  let newsletter;
  
  switch (mode) {
    case 'weekly':
      console.log('📊 Generating weekly newsletter...');
      newsletter = await generateWeekly();
      if (!newsletter) {
        console.log('⚠️  No articles published this week');
        process.exit(0);
      }
      break;
      
    case 'monthly':
      console.log('📊 Generating monthly newsletter...');
      newsletter = await generateMonthly();
      if (!newsletter) {
        console.log('⚠️  No articles published this month');
        process.exit(0);
      }
      break;
      
    case 'latest':
      console.log('📊 Generating latest article newsletter...');
      newsletter = await generateLatest();
      break;
      
    default:
      console.error('Unknown mode:', mode);
      console.log('Usage: node generate-newsletter.js [weekly|monthly|latest]');
      process.exit(1);
  }
  
  // 输出到环境变量（供 GitHub Actions 使用）
  console.log('\n✅ Newsletter generated:\n');
  console.log(`Subject: ${newsletter.subject}`);
  console.log(`Articles: ${newsletter.articles.length}`);
  console.log('');
  
  // 输出到文件
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'newsletter.json'),
    JSON.stringify(newsletter, null, 2)
  );
  
  console.log('📝 Saved to: .github/data/newsletter.json');
  console.log('\nPreview:\n');
  console.log(newsletter.content.substring(0, 500) + '...\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
