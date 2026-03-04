# Newsletter 订阅功能设置指南

## ✅ 已完成的功能

### 1. Buttondown 订阅表单（前端）
- **位置**: 侧边栏 + About 页面
- **用户名**: `luguosheng1314`
- **订阅链接**: https://buttondown.email/luguosheng1314
- **状态**: ✅ 已部署到网站

**用户体验流程**：
1. 用户在博客侧边栏看到订阅表单
2. 输入邮箱提交到 Buttondown
3. Buttondown 发送确认邮件
4. 用户点击确认链接完成订阅

### 2. Resend Newsletter 自动化（后端）
- **位置**: `.github/workflows/send-newsletter.yml`
- **功能**: 手动触发发送邮件通知
- **状态**: ✅ 代码已提交，等待配置 API Key

## 🔧 需要完成的配置

### 步骤 1：注册 Buttondown（免费）
1. 访问：https://buttondown.email/
2. 使用邮箱注册账号：`hqlgs01@gmail.com`
3. 确认用户名：`luguosheng1314`（已在代码中配置）
4. 配置订阅确认邮件模板（可选）

**免费额度**：
- 1000 订阅者
- 无限邮件发送
- 完全够用

### 步骤 2：注册 Resend（免费）
1. 访问：https://resend.com/
2. 注册账号
3. 进入 Dashboard → API Keys
4. 创建新的 API Key（名称：`newsletter-automation`）
5. **重要**：复制 API Key（只显示一次）

**免费额度**：
- 每月 3000 封邮件
- 每天 100 封
- 对个人博客完全够用

### 步骤 3：配置 GitHub Secrets
1. 进入仓库：https://github.com/hongqi-lgs/ideas/settings/secrets/actions
2. 点击 "New repository secret"
3. 配置：
   - **Name**: `RESEND_API_KEY`
   - **Value**: 粘贴步骤 2 中的 API Key
4. 保存

### 步骤 4：配置 Resend 发件域名（可选但推荐）
**如果你有自定义域名**（如 `ideas.luguosheng.com`）：

1. Resend Dashboard → Domains → Add Domain
2. 添加你的域名
3. 在域名 DNS 中添加验证记录（Resend 会提供）
4. 验证通过后，修改代码中的 `FROM_EMAIL`

**当前配置**（使用 Resend 默认域名）：
```javascript
const FROM_EMAIL = 'newsletter@hongqi-lgs.github.io';
```

**改成自定义域名后**：
```javascript
const FROM_EMAIL = 'newsletter@ideas.luguosheng.com';
```

## 📤 如何发送 Newsletter

### 方式 A：手动触发（推荐）
1. 进入：https://github.com/hongqi-lgs/ideas/actions/workflows/send-newsletter.yml
2. 点击 "Run workflow"
3. 选择参数：
   - **article_url**: 留空（自动使用最新文章）或指定 URL
   - **subject**: 留空（自动生成"新文章：标题"）或自定义
   - **test_mode**: ✅ 勾选（首次测试时）
4. 点击 "Run workflow"

**首次测试建议**：
- ✅ 勾选 `test_mode` → 只发送给你自己（`hqlgs01@gmail.com`）
- 检查邮件效果
- 确认没问题后，取消勾选，正式发送

### 方式 B：自动触发（未来扩展）
可以配置 GitHub Actions，在推送新文章时自动发送：
```yaml
on:
  push:
    paths:
      - 'source/_posts/*.md'
```

## 📋 订阅者管理

### 添加订阅者
编辑文件：`.github/data/subscribers.json`

```json
[
  {
    "email": "user@example.com",
    "name": "User Name",
    "subscribed_at": "2026-03-04"
  }
]
```

**注意**：
- Buttondown 的订阅者需要手动同步到这个文件
- 或者只用这个文件管理"精选订阅者"

### 查看发送历史
文件会自动生成：`.github/data/send-history.json`

```json
[
  {
    "article_url": "https://...",
    "article_title": "文章标题",
    "sent_at": "2026-03-04T12:00:00.000Z",
    "recipient_count": 10
  }
]
```

防止重复发送同一篇文章。

## 🎨 订阅表单样式

已集成到博客侧边栏，样式优化：
- 渐变背景（与导航栏配色一致）
- 响应式设计
- 隐私保护提示
- 表单验证

**位置**：
- 侧边栏（所有页面）
- About 页面（嵌入在页面内容中）

## 🔍 双轨策略对比

| 功能 | Buttondown | Resend Newsletter |
|------|-----------|-------------------|
| 用途 | 用户订阅管理 | 自动化发送通知 |
| 触发 | 用户主动订阅 | 博主手动/自动发送 |
| 订阅者来源 | 博客访客 | 手动管理列表 |
| 邮件内容 | Buttondown 模板 | 自定义 HTML 模板 |
| 适用场景 | 对外开放订阅 | 精准通知特定读者 |

**推荐使用方式**：
- **Buttondown**：对外开放，让访客自由订阅
- **Resend**：重要文章发布时，手动触发通知核心读者

## ✅ 测试清单

完成配置后，按顺序测试：

1. ☐ Buttondown 注册并确认用户名
2. ☐ 测试博客侧边栏订阅表单（提交邮箱）
3. ☐ 检查 Buttondown 后台是否收到订阅
4. ☐ Resend 注册并获取 API Key
5. ☐ GitHub Secrets 配置 `RESEND_API_KEY`
6. ☐ GitHub Actions 手动触发（test_mode=true）
7. ☐ 检查邮箱收到测试邮件
8. ☐ 确认邮件样式和链接正常
9. ☐ 正式发送 Newsletter（test_mode=false）

## 📊 预期效果

**前端（Buttondown）**：
- 侧边栏常驻订阅卡片
- 用户输入邮箱 → Buttondown 处理确认流程
- 零维护成本

**后端（Resend）**：
- 新文章发布时，GitHub Actions 手动触发
- 精美的 HTML 邮件模板
- 自动提取文章摘要
- 防止重复发送

## 🚀 下一步扩展（可选）

1. **自动同步 Buttondown 订阅者**
   - 使用 Buttondown API 定期拉取订阅者列表
   - 更新到 `subscribers.json`

2. **自动触发发送**
   - 检测到新文章推送时自动发送
   - 或定时（每周汇总）

3. **A/B 测试**
   - 测试不同邮件主题的打开率
   - Resend 提供邮件分析

4. **邮件模板优化**
   - 添加文章封面图
   - 优化移动端显示
   - 添加社交分享按钮

---

**当前状态**：
- ✅ 代码已完成并推送
- ⏳ 等待配置 Buttondown 和 Resend API Key
- 📝 测试后即可正式使用
