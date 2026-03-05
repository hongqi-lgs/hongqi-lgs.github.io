/**
 * Newsletter 发送脚本
 * 使用 Resend API 发送邮件通知
 */

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// 配置
const RSS_URL = 'https://xiaoxiaduoyan.com/atom.xml';
const BLOG_URL = 'https://xiaoxiaduoyan.com';
// 使用 Resend 提供的免费测试域名（或者配置自己的域名）
const FROM_EMAIL = 'onboarding@resend.dev'; // Resend 免费测试域名
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// 发送记录文件
const SEND_HISTORY_PATH = path.join(__dirname, '../data/send-history.json');

// 邮件模板
function generateEmailHTML(article) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #667eea; }
    .header h1 { margin: 0; color: #667eea; font-size: 28px; }
    .content { padding: 30px 0; }
    .article-title { font-size: 24px; color: #333; margin-bottom: 10px; }
    .article-meta { color: #999; font-size: 14px; margin-bottom: 20px; }
    .article-excerpt { font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 30px; }
    .read-more { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .read-more:hover { opacity: 0.9; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center; color: #999; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>红齐 Ideas</h1>
    <p style="color: #666; margin: 10px 0 0 0;">技术·产品·思考</p>
  </div>
  
  <div class="content">
    <h2 class="article-title">${article.title}</h2>
    <div class="article-meta">
      📅 ${new Date(article.pubDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
    <div class="article-excerpt">
      ${article.excerpt}
    </div>
    <a href="${article.link}" class="read-more">阅读全文 →</a>
  </div>
  
  <div class="footer">
    <p>
      💬 回复这封邮件与我交流<br>
      🐦 Twitter: <a href="https://twitter.com/xiaosen_lu">@xiaosen_lu</a><br>
      ☕ <a href="https://ko-fi.com/xiaosen">请我喝杯咖啡</a>
    </p>
    <p style="margin-top: 20px;">
      <a href="{{unsubscribe_url}}">取消订阅</a> · <a href="${BLOG_URL}">访问博客</a>
    </p>
    <div style="background: #f8f9fa; padding: 15px; margin-top: 20px; border-left: 3px solid #667eea; font-size: 12px; color: #666;">
      ⚠️ 本邮件由系统自动发送，请勿直接回复。<br>
      ⚠️ This email is sent automatically. Please do not reply directly.
    </div>
  </div>
</body>
</html>
  `.trim();
}

// 纯文本版本
function generateEmailText(article) {
  return `
${article.title}

${article.excerpt}

阅读全文：${article.link}

---

💬 回复这封邮件与我交流
🐦 Twitter: @xiaosen_lu
☕ 请我喝杯咖啡：https://ko-fi.com/xiaosen

取消订阅：{{unsubscribe_url}}
访问博客：${BLOG_URL}

---
⚠️ 本邮件由系统自动发送，请勿直接回复。
⚠️ This email is sent automatically. Please do not reply directly.
  `.trim();
}

// 发送邮件
async function sendEmail(to, subject, html, text) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `红齐 Ideas <${FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      html: html,
      text: text
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

// 读取发送记录
function loadSendHistory() {
  if (!fs.existsSync(SEND_HISTORY_PATH)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(SEND_HISTORY_PATH, 'utf8'));
}

// 保存发送记录
function saveSendHistory(history) {
  fs.writeFileSync(SEND_HISTORY_PATH, JSON.stringify(history, null, 2));
}

// 检查文章是否已发送
function isArticleSent(articleUrl) {
  const history = loadSendHistory();
  return history.some(record => record.article_url === articleUrl);
}

// 记录发送
function recordSend(article, recipientCount) {
  const history = loadSendHistory();
  history.push({
    article_url: article.link,
    article_title: article.title,
    sent_at: new Date().toISOString(),
    recipient_count: recipientCount
  });
  saveSendHistory(history);
}

// 主函数
async function main() {
  console.log('🚀 Starting newsletter send...');

  // 检查 API Key
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    process.exit(1);
  }

  // 读取订阅者列表
  const subscribersPath = path.join(__dirname, '../data/subscribers.json');
  if (!fs.existsSync(subscribersPath)) {
    console.error('❌ Subscribers file not found:', subscribersPath);
    process.exit(1);
  }

  const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
  console.log(`📧 Found ${subscribers.length} subscribers`);

  // 过滤掉无效邮箱
  const validSubscribers = subscribers.filter(s => s.email && s.email.includes('@'));
  if (validSubscribers.length < subscribers.length) {
    console.log(`⚠️  Filtered out ${subscribers.length - validSubscribers.length} invalid emails`);
  }

  // 测试模式：只发送给第一个订阅者（应该是你自己）
  const testMode = process.env.TEST_MODE === 'true';
  const recipients = testMode ? validSubscribers.slice(0, 1) : validSubscribers;
  
  if (testMode) {
    console.log('🧪 TEST MODE: Only sending to first subscriber');
  }

  // 读取生成的 Newsletter 内容
  const newsletterPath = path.join(__dirname, '../data/newsletter.json');
  let newsletter;
  
  if (fs.existsSync(newsletterPath)) {
    console.log('📰 Using generated newsletter content');
    newsletter = JSON.parse(fs.readFileSync(newsletterPath, 'utf8'));
  } else {
    // 降级：使用最新文章
    console.log('📡 Fetching latest article from RSS (fallback)...');
    const parser = new Parser();
    const feed = await parser.parseURL(RSS_URL);
    
    if (!feed.items || feed.items.length === 0) {
      console.error('❌ No articles found in RSS feed');
      process.exit(1);
    }

    const article = feed.items[0];
    const excerpt = article.contentSnippet || article.content?.replace(/<[^>]*>/g, '').substring(0, 300) + '...' || '';
    
    newsletter = {
      subject: `新文章：${article.title}`,
      content: `# ${article.title}\n\n${excerpt}\n\n[阅读全文](${article.link})`,
      articles: [article]
    };
  }

  // 生成邮件内容
  const subject = newsletter.subject;
  
  // 生成文章列表 HTML（支持双语）
  let articlesHTML = '';
  if (newsletter.articles && newsletter.articles.length > 0) {
    articlesHTML = newsletter.articles.map((article, index) => {
      if (article.isBilingual) {
        // 双语文章
        return `
          <div class="article-item" style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #eee;">
            <h2 style="font-size: 24px; color: #333; margin-bottom: 8px; line-height: 1.4;">
              ${article.title_en}
            </h2>
            <h3 style="font-size: 18px; color: #999; font-weight: normal; margin-top: 0; margin-bottom: 12px; line-height: 1.4;">
              ${article.title_zh}
            </h3>
            <div class="article-meta" style="color: #999; font-size: 14px; margin-bottom: 16px;">
              📅 ${new Date(article.pubDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div class="excerpt-en" style="font-size: 15px; line-height: 1.8; color: #555; margin-bottom: 12px;">
              ${article.excerpt_en}
            </div>
            <div class="excerpt-zh" style="font-size: 14px; line-height: 1.7; color: #999; margin-bottom: 20px;">
              ${article.excerpt_zh}
            </div>
            <div class="button-group" style="margin-top: 20px;">
              <a href="${article.link_zh}" class="read-button" style="display: inline-block; padding: 10px 24px; margin-right: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">阅读全文</a>
              <a href="${article.link_en}" class="read-button" style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Read More</a>
            </div>
          </div>
        `;
      } else {
        // 单语文章（中文或英文）
        const title = article.title_zh || article.title_en;
        const excerpt = article.excerpt_zh || article.excerpt_en;
        const link = article.link_zh || article.link_en;
        const buttonText = article.title_zh ? '阅读全文' : 'Read More';
        
        return `
          <div class="article-item" style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #eee;">
            <h2 style="font-size: 24px; color: #333; margin-bottom: 12px; line-height: 1.4;">
              ${title}
            </h2>
            <div class="article-meta" style="color: #999; font-size: 14px; margin-bottom: 16px;">
              📅 ${new Date(article.pubDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div class="excerpt" style="font-size: 15px; line-height: 1.8; color: #555; margin-bottom: 20px;">
              ${excerpt}
            </div>
            <div class="button-group" style="margin-top: 20px;">
              <a href="${link}" class="read-button" style="display: inline-block; padding: 10px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">${buttonText}</a>
            </div>
          </div>
        `;
      }
    }).join('\n');
  } else {
    // 降级：使用 Markdown 内容
    articlesHTML = newsletter.content
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #667eea; }
    .header h1 { margin: 0; color: #667eea; font-size: 28px; }
    .content { padding: 30px 0; }
    h1, h2, h3 { color: #333; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center; color: #999; font-size: 14px; }
    .disclaimer { background: #f8f9fa; padding: 15px; margin-top: 20px; border-left: 3px solid #667eea; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>红齐 Ideas</h1>
    <p style="color: #666; margin: 10px 0 0 0;">技术·产品·思考</p>
  </div>
  <div class="content">
    ${articlesHTML}
  </div>
  <div class="footer">
    <p>💬 回复这封邮件与我交流</p>
    <p><a href="{{unsubscribe_url}}">取消订阅</a> · <a href="${BLOG_URL}">访问博客</a></p>
    <div class="disclaimer">
      ⚠️ 本邮件由系统自动发送，请勿直接回复。<br>
      ⚠️ This email is sent automatically. Please do not reply directly.
    </div>
  </div>
</body>
</html>
  `.trim();
  
  // 生成纯文本版本
  let textContent = '';
  if (newsletter.articles && newsletter.articles.length > 0) {
    textContent = newsletter.articles.map((article, index) => {
      if (article.isBilingual) {
        return `
${article.title_en}
${article.title_zh}

📅 ${new Date(article.pubDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}

${article.excerpt_en}

${article.excerpt_zh}

阅读全文（中文）: ${article.link_zh}
Read More (English): ${article.link_en}
        `.trim();
      } else {
        const title = article.title_zh || article.title_en;
        const excerpt = article.excerpt_zh || article.excerpt_en;
        const link = article.link_zh || article.link_en;
        
        return `
${title}

📅 ${new Date(article.pubDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}

${excerpt}

阅读全文: ${link}
        `.trim();
      }
    }).join('\n\n---\n\n');
  } else {
    textContent = newsletter.content;
  }
  
  const text = textContent + '\n\n---\n⚠️ 本邮件由系统自动发送，请勿直接回复。\n⚠️ This email is sent automatically. Please do not reply directly.';

  // 发送邮件
  console.log(`\n📤 Sending emails to ${recipients.length} recipients...`);
  let successCount = 0;
  let failCount = 0;
  const failedRecipients = [];

  for (const subscriber of recipients) {
    try {
      await sendEmail(subscriber.email, subject, html, text);
      console.log(`✅ Sent to: ${subscriber.email}`);
      successCount++;
      
      // 避免触发速率限制，每封邮件间隔 1 秒
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
      failedRecipients.push({ email: subscriber.email, error: error.message });
      failCount++;
      // 即使失败也继续发送下一个
    }
  }

  console.log(`\n✨ Newsletter send complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  
  // 输出失败详情
  if (failedRecipients.length > 0) {
    console.log(`\n⚠️  Failed recipients:`);
    failedRecipients.forEach(({ email, error }) => {
      console.log(`   - ${email}: ${error}`);
    });
  }

  // 记录发送（只在非测试模式下记录）
  if (!testMode && successCount > 0) {
    const article = newsletter.articles[0] || { link: BLOG_URL, title: subject };
    recordSend(article, successCount);
    console.log(`\n📝 Send recorded in history`);
  }
}

// 执行
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
