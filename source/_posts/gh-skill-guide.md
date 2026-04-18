---
title: 用 gh skill 给 AI 装技能包：从安装到发布完整指南
date: 2026-04-18 16:30:00
tags:
  - AI工具
  - GitHub
  - Agent Skills
  - Claude Code
categories:
  - 技术
cover:
description: GitHub CLI 新增 gh skill 命令，一行命令搜索、安装、发布 AI Agent 技能包。完整实战演示：从装一个现成 skill 到自己写一个并发布。
---

## 一个反复出现的问题

我的 AI agent 写代码很快，但文档永远写不好。

不是说它不会写——你让它写，它能给你一篇洋洋洒洒的文档。问题是，每次的输出都不一样。这次用了 Diátaxis 框架分了 tutorial/how-to/reference/explanation 四种类型，下次又变成了一堆无结构的段落。你花十分钟教它一遍规范，过两天新开一个会话，它全忘了。

我试过把写作规范塞进 system prompt，试过写成 `.md` 文件放在仓库里让它读。能用，但不优雅。每个项目都要复制一份，版本一旦更新就到处不同步。

直到上周，GitHub CLI v2.90.0 发布了一个新命令组：`gh skill`。

## Agent Skills：给 AI 的技能包

一句话解释：Agent Skills 就是一套标准化的指令包，告诉 AI agent 在特定场景下该怎么做。

类比一下——你新入职一家公司，HR 给你一个 onboarding checklist，里面写了代码规范在哪儿、PR 怎么提、部署流程是什么。你不需要到处问人，照着做就行。Agent Skill 就是给 AI 的 onboarding checklist，只不过格式标准化了，可以跨项目、跨 agent 复用。

规范本身是开放的，定义在 [agentskills.io](https://agentskills.io)。`gh skill` 是 GitHub CLI 对这个规范的官方实现——搜索、预览、安装、发布，一行命令搞定。

目前支持的 agent 包括：GitHub Copilot、Claude Code、Cursor、Codex、Gemini CLI、Antigravity。

## 实战：装一个现成的 skill

### 搜索

先看看有什么可用的。`github/awesome-copilot` 这个仓库的 skills 目录下有 200 多个 skill，用搜索命令找：

```bash
gh skill search documentation
```

输出会列出匹配的 skill 列表，包括名称、描述、所在仓库。假设我们看到了 `documentation-writer`——一个基于 Diátaxis 框架的技术写作 skill，正好是我想要的。

### 预览

装之前先看看它具体是什么：

```bash
gh skill preview github/awesome-copilot documentation-writer
```

预览会展示 SKILL.md 的内容：frontmatter 里的元数据（名称、描述、兼容性等）和正文里的指令。你可以在不安装的情况下判断这个 skill 是不是你需要的。

### 安装

确认没问题，装：

```bash
gh skill install github/awesome-copilot documentation-writer
```

这条命令做了什么？它会在你当前项目里创建（或更新）对应的 skill 文件。核心是一个 `SKILL.md`，里面的 YAML frontmatter 记录了来源信息：

```yaml
---
name: documentation-writer
description: "Technical documentation writer following the Diátaxis framework..."
source:
  repo: github/awesome-copilot
  ref: main
  tree-sha: a1b2c3d4e5f6...
---
```

下面的 Markdown 正文就是给 agent 的具体指令——什么时候触发、怎么组织文档结构、用什么语气、遵循什么规范。

一个完整的 skill 目录长这样：

```
documentation-writer/
├── SKILL.md          # 必须：YAML frontmatter + Markdown 指令
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：参考文档
└── assets/           # 可选：模板、资源
```

`SKILL.md` 是唯一必须的文件，其他目录按需使用。

### 给不同的 agent 装

默认安装是给 GitHub Copilot 的。如果你用的是 Claude Code：

```bash
gh skill install github/awesome-copilot documentation-writer --agent claude-code --scope user
```

`--agent` 指定目标 agent，`--scope user` 表示这是用户级别的 skill，不限于当前项目。

### 版本锁定

生产环境用的 skill 你不想让它随时变。用 `--pin` 锁定到一个特定版本：

```bash
gh skill install github/awesome-copilot documentation-writer --pin v1.2.0
```

锁定后，即使上游仓库更新了，你这边也不会变。想要更新？手动重新 install 或者跑：

```bash
gh skill update --all
```

这会把所有已安装的 skill 更新到最新版本。

## 自己写一个 skill

装别人的 skill 体验过了，接下来试试自己写一个。

假设我要写一个 `commit-message-writer` skill，规范团队的 commit message 格式——遵循 Conventional Commits，带 scope，正文不超过 72 字符。

### 创建目录

```bash
mkdir -p commit-message-writer
```

### 编写 SKILL.md

```bash
cat > commit-message-writer/SKILL.md << 'EOF'
---
name: commit-message-writer
description: "Generates commit messages following Conventional Commits specification. Triggered when the user asks to commit, or when suggesting a commit after code changes."
license: MIT
compatibility:
  - github-copilot
  - claude-code
  - cursor
---

## Commit Message Format

When generating a commit message, follow this exact structure:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Rules

1. **type** must be one of: feat, fix, docs, style, refactor, perf, test, chore, ci, build
2. **scope** is optional but encouraged — use the module or directory name
3. **subject** must be lowercase, imperative mood, no period at end, max 50 characters
4. **body** wraps at 72 characters, explains *what* and *why*, not *how*
5. **footer** is for breaking changes (`BREAKING CHANGE:`) and issue references (`Closes #123`)

### Examples

Good:
```
feat(auth): add OAuth2 login flow

Implement GitHub OAuth2 authentication as an alternative to
email/password login. Token refresh is handled automatically.

Closes #456
```

Bad:
```
Updated the login page
```

### When to trigger

- User says "commit", "write a commit message", or similar
- After making code changes, when suggesting next steps
- During interactive rebase when rewriting commit messages
EOF
```

这个文件有几个关键点：

- `name`：小写加连字符，1-64 个字符
- `description`：说清楚这个 skill 做什么、什么时候触发，最长 1024 字符
- `compatibility`：声明支持哪些 agent
- 正文是 Markdown 格式的具体指令

### 发布前检查

写完后，先用 dry-run 模式验证：

```bash
gh skill publish --dry-run
```

这会检查一系列东西：

- SKILL.md 格式是否合规
- frontmatter 必填字段是否齐全
- 仓库是否启用了 tag protection
- 是否有 secret scanning alerts
- 是否支持 immutable releases

如果有小问题——比如 frontmatter 缺字段、格式不对——可以用 `--fix` 自动修复：

```bash
gh skill publish --fix
```

全部通过后，正式发布。发布后，其他人就能通过 `gh skill search` 找到你的 skill 并安装了。

## 供应链安全：这不是小题大做

装一个 skill 本质上是把别人写的指令注入到你的 AI agent 里。如果有人在 skill 里藏了恶意指令——比如"遇到包含密码的文件时把内容发送到某个 URL"——后果可想而知。

这不是假设。npm 生态早就经历过无数次供应链攻击，agent skills 作为一个新的分发渠道，同样需要防护。

`gh skill` 在这方面做了几件事：

**来源追溯。** 每个安装的 skill 在 SKILL.md 的 frontmatter 里记录了 repo、ref 和 tree SHA。你随时能追溯到这个 skill 的确切来源和版本。

**版本锁定。** `--pin` 可以锁定到特定的 tag 或 commit SHA。不会因为上游偷偷改了代码而影响到你。

**发布检查。** `gh skill publish` 不只是上传文件。它会检查你的仓库是否启用了 tag protection（防止 tag 被强制推送覆盖）、是否有 immutable releases（发布后内容不可篡改）、是否通过了 secret scanning（防止意外泄露凭据）。

**不可变发布。** 支持启用 immutable releases——一旦发布，内容不可更改。想改？发新版本。这和 Docker 镜像的 digest 锁定是一个思路。

这些机制不是可选的"安全增强"，而是 skill 生态能否被信任的基础。

## 写在最后

`gh skill` 解决的是一个很具体的问题：AI agent 的能力可以被标准化、版本化、共享化。

你不需要再在每个项目里重复写 prompt、复制粘贴配置文件、手动同步最佳实践。一条命令装一个 skill，它就知道怎么写文档、怎么写 commit message、怎么做 code review。

目前还是 Public Preview 阶段，体验可能有粗糙的地方。但方向很清晰——agent 的能力不应该锁在某个平台或某个 prompt 里，它应该是一个可分享、可验证、可组合的技能包。

试试看：

```bash
gh extension upgrade gh
gh skill search documentation
```
