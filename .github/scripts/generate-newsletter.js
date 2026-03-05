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
  
  // 配对中英文文章
  const pairedArticles = pairArticles(recentArticles);
  
  if (pairedArticles.length === 0) {
    return null; // 本周无更新
  }
  
  const subject = `📮 本周精选 (${getWeekRange()})`;
  
  const intro = `
这周我更新了 ${pairedArticles.length} 篇文章，涵盖技术实践、AI应用等话题。

以下是本周精选：
  `.trim();
  
  const articlesList = pairedArticles.map((article, index) => {
    const mainTitle = article.title_en || article.title_zh;
    return `
## ${index + 1}. ${mainTitle}

📅 ${formatDate(article.pubDate)}

${article.excerpt_en || article.excerpt_zh}

👉 [阅读全文](${article.link_zh || article.link_en})
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
    articles: pairedArticles
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
  
  // 配对中英文文章
  const pairedArticles = pairArticles(recentArticles);
  
  if (pairedArticles.length === 0) {
    return null;
  }
  
  const subject = `📮 ${getCurrentMonth()}月刊 - 精选${pairedArticles.length}篇`;
  
  // 按分类整理
  const byCategory = {};
  pairedArticles.forEach(article => {
    // 从 URL 或标签推断分类（简化处理）
    const category = '技术实践'; // 可以扩展分类逻辑
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(article);
  });
  
  const intro = `
${getCurrentMonth()}月，我在博客更新了 ${pairedArticles.length} 篇文章。

本期亮点：
${pairedArticles.slice(0, 3).map((a, i) => `${i + 1}. ${a.title_en || a.title_zh}`).join('\n')}

---
  `.trim();
  
  const categoryBlocks = Object.entries(byCategory).map(([category, articles]) => {
    const list = articles.map((article, index) => {
      const mainTitle = article.title_en || article.title_zh;
      return `
### ${mainTitle}

📅 ${formatDate(article.pubDate)}

${article.excerpt_en || article.excerpt_zh}

👉 [阅读全文](${article.link_zh || article.link_en})
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
    articles: pairedArticles
  };
}

// 生成最新文章通知
async function generateLatest() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  
  if (!feed.items || feed.items.length === 0) {
    throw new Error('No articles found');
  }
  
  // 配对中英文文章
  const pairedArticles = pairArticles(feed.items);
  
  if (pairedArticles.length === 0) {
    throw new Error('No articles found after pairing');
  }
  
  const article = pairedArticles[0];
  
  // 使用英文标题作为主标题（如果有），否则用中文
  const mainTitle = article.title_en || article.title_zh;
  const subject = `新文章：${article.title_zh || article.title_en}`;
  
  const content = `
你好！

我刚发布了一篇新文章：

# ${mainTitle}

📅 ${formatDate(article.pubDate)}

${article.excerpt_en || article.excerpt_zh}

👉 [阅读全文](${article.link_zh || article.link_en})

---

💬 有什么想法？回复这封邮件与我交流。

📧 转发给朋友订阅：${BLOG_URL}

---
红齐 Ideas · 技术·产品·思考
  `.trim();
  
  return {
    subject,
    content,
    articles: pairedArticles.slice(0, 1)
  };
}

// 辅助函数

// 配对中英文文章
function pairArticles(articles) {
  const paired = [];
  const processed = new Set();
  
  articles.forEach((article, index) => {
    if (processed.has(index)) return;
    
    // 检查是否是英文版（URL 包含 -en）
    const isEnglish = article.link.includes('-en/') || article.link.endsWith('-en.html');
    
    if (isEnglish) {
      // 尝试找到对应的中文版
      const chineseLink = article.link.replace('-en/', '/').replace('-en.html', '.html');
      const chineseIndex = articles.findIndex(a => a.link === chineseLink);
      
      if (chineseIndex !== -1) {
        // 找到配对，合并
        paired.push({
          title_en: article.title,
          title_zh: articles[chineseIndex].title,
          excerpt_en: getExcerpt(article),
          excerpt_zh: getExcerpt(articles[chineseIndex]),
          link_en: article.link,
          link_zh: articles[chineseIndex].link,
          pubDate: article.pubDate,
          isBilingual: true
        });
        processed.add(index);
        processed.add(chineseIndex);
      } else {
        // 没找到配对，单独处理
        paired.push({
          title_en: article.title,
          title_zh: null,
          excerpt_en: getExcerpt(article),
          excerpt_zh: null,
          link_en: article.link,
          link_zh: null,
          pubDate: article.pubDate,
          isBilingual: false
        });
        processed.add(index);
      }
    } else {
      // 中文版：检查是否已被配对
      const englishLink = article.link.replace(/\/$/, '-en/').replace('.html', '-en.html');
      const englishIndex = articles.findIndex(a => a.link === englishLink);
      
      if (englishIndex !== -1 && !processed.has(englishIndex)) {
        // 找到配对，合并
        paired.push({
          title_en: articles[englishIndex].title,
          title_zh: article.title,
          excerpt_en: getExcerpt(articles[englishIndex]),
          excerpt_zh: getExcerpt(article),
          link_en: articles[englishIndex].link,
          link_zh: article.link,
          pubDate: article.pubDate,
          isBilingual: true
        });
        processed.add(index);
        processed.add(englishIndex);
      } else if (!processed.has(index)) {
        // 没找到配对，单独处理
        paired.push({
          title_en: null,
          title_zh: article.title,
          excerpt_en: null,
          excerpt_zh: getExcerpt(article),
          link_en: null,
          link_zh: article.link,
          pubDate: article.pubDate,
          isBilingual: false
        });
        processed.add(index);
      }
    }
  });
  
  return paired;
}

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
