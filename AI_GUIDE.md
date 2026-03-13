# AI 指导文档 — Ideas 博客项目

> 本文档供 AI 助手接手此项目时参考，记录了博客写作规则、项目结构和注意事项。

---

## 📁 项目结构

```
ideas/
├── _config.yml                # Hexo 站点配置
├── _config.butterfly.yml      # Butterfly 主题配置
├── source/
│   ├── _posts/                # 文章目录（中英文都放这里）
│   ├── about/index.md         # 关于页
│   ├── tags/index.md          # 标签页
│   ├── categories/index.md    # 分类页
│   ├── images/                # 图片资源（打赏二维码等）
│   └── css/custom.css         # 自定义样式
├── scripts/
│   └── filter-lang.js         # 首页语言过滤脚本（排除 English 分类）
├── scaffolds/                 # 文章模板
├── package.json
└── AI_GUIDE.md                # 本文档
```

---

## ✍️ 写文章规则

### 1. 三语文章（必须同时生成中英日）

每篇文章需要 **中文版 + 英文版 + 日文版** 三个文件，放在同一个 `source/_posts/` 目录下。

**命名规则**：
- 中文版：`文章名.md`（如 `why-blog.md`）
- 英文版：`文章名-en.md`（如 `why-blog-en.md`）
- 日文版：`文章名-ja.md`（如 `why-blog-ja.md`）

### 2. Front-matter 规范

**中文文章** front-matter 示例：

```yaml
---
title: 为什么要写博客
date: 2026-02-28 12:00:00
tags:
  - 随想
  - 写作
categories:
  - 随想
cover:
description: 在信息爆炸的时代，为什么还要写博客？这是我的三个理由。
---
```

**英文文章** front-matter 示例：

```yaml
---
title: Why Blog?
date: 2026-02-28 12:00:00
tags:
  - Thoughts
  - Writing
  - English
categories:
  - English
cover:
description: In the age of information overload, why still blog? Here are my three reasons.
lang: en
---
```

**日文文章** front-matter 示例：

```yaml
---
title: なぜブログを書くのか
date: 2026-02-28 12:00:00
tags:
  - 考え
  - 執筆
  - Japanese
categories:
  - Japanese
cover:
description: 情報過多の時代に、なぜブログを書くのか？私の3つの理由。
lang: ja
---
```

### ⚠️ 关键规则

| 规则 | 说明 |
|------|------|
| 英文文章必须加 `categories: [English]` | 首页过滤脚本依赖此分类来排除英文文章 |
| 英文文章必须加 `lang: en` | 标记文章语言 |
| 英文文章 tags 中加 `English` | 方便按标签筛选 |
| 日文文章必须加 `categories: [Japanese]` | 首页过滤脚本依赖此分类来排除日文文章 |
| 日文文章必须加 `lang: ja` | 标记文章语言 |
| 日文文章 tags 中加 `Japanese` | 方便按标签筛选 |
| 中文文章 **不要** 加 `English` 或 `Japanese` 分类 | 否则会被首页过滤掉 |
| `date` 字段三语保持一致 | 方便对应同一篇文章 |

### 3. 写作风格要求

#### ❌ 绝对禁止：无中生友

**问题**：AI 容易编造不存在的链接、仓库、工具、人名等，这是"一眼 AI"的标志。

**典型错误示例**：
- ❌ 访问 `github.com/your-org/ai-native-testing` 获取模板
- ❌ 参考论文：Smith et al. (2024) "AI Testing at Scale"
- ❌ 工具推荐：TestMaster Pro（虚构的工具）
- ❌ 感谢 John Doe 提供的反馈（虚构的人名）

**正确做法**：
1. **不提供链接**，只描述概念
2. 如果要引用，使用**真实存在的资源**（需要先验证）
3. 感谢时用**角色描述**而非具体姓名："感谢 QA 团队"而非"感谢张三"
4. 工具/框架只提**确定存在**的（pytest、Cucumber 等）

#### 🚫 避免 AI 写作痕迹

| 痕迹类型 | ❌ 错误示例 | ✅ 正确做法 |
|---------|------------|-----------|
| **过度排比递进** | "不仅...而且...更重要的是..." | 直接陈述，简洁有力 |
| **空洞的总结性开头** | "在当今 AI 技术飞速发展的时代..." | 直接进入主题："过去三个月，我们..." |
| **机械的转折词** | "首先...其次...最后...综上所述..." | 用叙事自然衔接 |
| **过度热情的感叹** | "这是一个激动人心的发现！" | "实验结果令人震撼："（客观陈述数据）|

#### ✅ 写作核心原则

| 原则 | 说明 |
|------|------|
| **宁可少说，不可编造** | 无法验证的数据不写具体数字；不存在的资源不提供链接；虚构案例需明确标注"假设场景" |
| **深入浅出** | 复杂概念用简单易懂的方式讲解，让非专业读者也能理解 |
| **前瞻性观点** | 观点需要有让人眼前一亮的洞察力和前瞻性，不要人云亦云 |
| **观点准确切合实际** | 确保技术内容准确，观点有依据，不空谈理论 |
| **引入配图** | 适当插入图片、示意图、截图，增强可读性和说服力 |
| **自然、有个性** | 用自然、有个性的语言写作，避免模板化、套话式的表达 |

### 4. 语言检测机制（完全自动化）

**无需手动配置！** 系统会自动识别文章语言，通过以下三种方式：

1. **Front-matter 的 `lang` 字段**：`lang: en` → 识别为英文
2. **分类包含 "English"**：`categories: [English]` → 识别为英文
3. **文件名以 `-en` 结尾**：`article-en.md` → 识别为英文

只要满足以上**任意一条**，文章就会被识别为英文，否则默认为中文。

**自动化效果：**
- ✅ **首页过滤**：只显示中文文章
- ✅ **上一篇/下一篇**：中文文章只链接到中文文章，英文文章只链接到英文文章
- ✅ **相关推荐**：中文文章只推荐中文文章，英文同理
- ✅ **文章排序**：按语言分组后再按日期排序

**实现原理：**
- `scripts/lang-filter.js`：覆盖 Butterfly 的 `related_posts` helper
- `scripts/post-map.js`：生成按语言分组的文章映射
- `source/js/i18n.js`：前端自动替换链接
- `layout/includes/pagination.pug`：自定义上下篇导航

**写新文章无需改代码**，只需遵循命名和分类规则即可！

### 5. 首页过滤机制

`scripts/filter-lang.js` 自定义了 Hexo 的 index generator：
- **首页**（`/`）只显示 **非 English 分类** 的文章（即中文文章）
- **English 分类页**（`/categories/English/`）只显示英文文章
- **归档、标签页** 显示所有文章（不过滤）
- **侧边栏"最新文章"** 是全站级别的，会同时显示中英文（这是正常的）

### 6. 未来扩展更多语言

如果要支持日语、韩语等：
1. 创建对应分类（如 `Japanese`）
2. 文章 front-matter 加 `categories: [Japanese]`、`lang: ja`
3. 在 `scripts/filter-lang.js` 中把新语言分类加入排除列表
4. 在 `_config.butterfly.yml` 的 `menu` 中加入新语言入口

---

## 🚀 常用命令

```bash
cd ideas

# 新建文章
npx hexo new "文章标题"

# 本地预览
npx hexo server

# 生成静态文件
npx hexo clean && npx hexo generate

# 部署到 GitHub Pages
cd public
rm -rf .git
git init && git checkout -b gh-pages
git add -A && git commit -m "deploy"
git remote add origin git@github.com:hongqi-lgs/ideas.git
git push -f origin gh-pages
cd ..

# 推送源码
git add -A && git commit -m "update" && git push origin main
```

---

## ⚠️ 注意事项

### 图片路径

- 图片放在 `source/images/` 目录
- 在 `_config.butterfly.yml` 中引用图片时，**不要加 `/ideas/` 前缀**
- ✅ 正确：`/images/wx.jpg`
- ❌ 错误：`/ideas/images/wx.jpg`（Hexo 的 `root: /ideas/` 会自动拼接前缀）

### 包管理

- 使用 **pnpm**（不要用 npm，有缓存权限问题）
- 安装依赖：`pnpm install`
- 安装新插件：`pnpm add 插件名`

### 主题配置要点

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| `disable_top_img` | `true` | 所有页面禁用顶部大图（用户明确要求） |
| `busuanzi` | 全部 `true` | 不蒜子访问量统计 |
| `local_search` | `enable: true` | 本地全文搜索 |
| `darkmode` | `enable: true` | 暗色模式切换 |
| `reward` | `enable: true` | 文章底部打赏（微信+支付宝） |
| `inject.head` | 引入 custom.css | 自定义样式 |

### 自定义样式

`source/css/custom.css` 包含：
- 导航栏紫蓝渐变背景
- Footer 同色渐变背景
- 文章卡片圆角阴影
- 暗色模式全套适配
- 滚动条美化

修改样式后需要重新 `hexo generate` 并部署。

### 社交链接

在 `_config.butterfly.yml` 的 `social` 中配置：
```yaml
social:
  fab fa-github: https://github.com/hongqi-lgs || Github
  fab fa-twitter: https://twitter.com/xiaosen_lu || Twitter
  fab fa-weixin: /about/ || WeChat
```

### 联系方式

- **微信**：yundiaodiao
- **Twitter**：@xiaosen_lu
- **GitHub**：hongqi-lgs

---

## 📋 发布新文章 Checklist

- [ ] 中文版文件：`source/_posts/文章名.md`
- [ ] 英文版文件：`source/_posts/文章名-en.md`
- [ ] 日文版文件：`source/_posts/文章名-ja.md`
- [ ] 英文版 front-matter 包含 `categories: [English]` 和 `lang: en`
- [ ] 日文版 front-matter 包含 `categories: [Japanese]` 和 `lang: ja`
- [ ] 中文版 front-matter **不包含** `English` 或 `Japanese` 分类
- [ ] 写作风格：无 AI 味、深入浅出、有配图、观点准确且有前瞻性
- [ ] 本地预览确认：`npx hexo server`
- [ ] 构建：`npx hexo clean && npx hexo generate`
- [ ] 部署 gh-pages 分支
- [ ] 推送 main 分支






