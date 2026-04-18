---
title: "Teaching Your AI Agent New Tricks: A Complete Guide to gh skill"
date: 2026-04-18 16:30:00
tags:
  - AI Tools
  - GitHub
  - Agent Skills
  - Claude Code
  - English
categories:
  - English
cover:
description: "GitHub CLI's new gh skill command lets you search, install, and publish Agent Skills in one command. A hands-on walkthrough from installing your first skill to publishing your own."
lang: en
---

## The Same Prompt, Over and Over

My AI agent writes code fast. Documentation? Not so much.

It's not that it *can't* write docs — it will happily produce pages of text. The problem is consistency. One session it structures everything around the Diátaxis framework with tutorials, how-tos, references, and explanations neatly separated. The next session, it dumps everything into one long blob. I spend ten minutes explaining the writing standards, close the session, open a new one, and it's back to square one.

I've tried stuffing rules into the system prompt. I've tried keeping a `.md` file in the repo for it to read. Both work, sort of. But then every project needs its own copy, and they drift out of sync within a week.

Last week, GitHub CLI v2.90.0 shipped a new command group that addresses exactly this: `gh skill`.

## What Are Agent Skills?

Agent Skills are standardized instruction packages that tell an AI agent how to handle specific tasks.

Think of it this way: when you onboard at a new company, you get a checklist — where the code style guide lives, how to open a PR, what the deploy process looks like. You don't wander around asking everyone. An Agent Skill is that checklist for your AI, except it's versioned, portable, and works across different agents.

The spec is open and defined at [agentskills.io](https://agentskills.io). `gh skill` is GitHub CLI's official implementation — search, preview, install, and publish, all from the command line.

Supported agents: GitHub Copilot, Claude Code, Cursor, Codex, Gemini CLI, and Antigravity.

## Hands-On: Installing a Skill

### Search

Let's see what's out there. The `github/awesome-copilot` repo has 200+ skills in its `skills/` directory:

```bash
gh skill search documentation
```

This returns a list of matching skills with names, descriptions, and source repos. Suppose we spot `documentation-writer` — a technical writing skill built on the Diátaxis framework. Exactly what I need.

### Preview

Before installing, take a look at what you're getting:

```bash
gh skill preview github/awesome-copilot documentation-writer
```

This shows the SKILL.md contents: the YAML frontmatter (metadata like name, description, compatibility) and the Markdown body (the actual instructions). You can decide whether it's a good fit without touching your project.

### Install

Looks good. Install it:

```bash
gh skill install github/awesome-copilot documentation-writer
```

This creates (or updates) the skill files in your project. The core is a `SKILL.md` with YAML frontmatter that records the source:

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

The Markdown body below that contains the actual instructions — when to trigger, how to structure docs, what tone to use.

A complete skill directory looks like this:

```
documentation-writer/
├── SKILL.md          # Required: YAML frontmatter + Markdown instructions
├── scripts/          # Optional: executable scripts
├── references/       # Optional: reference docs
└── assets/           # Optional: templates, resources
```

`SKILL.md` is the only required file. Everything else is optional.

### Installing for a Different Agent

The default target is GitHub Copilot. For Claude Code:

```bash
gh skill install github/awesome-copilot documentation-writer --agent claude-code --scope user
```

`--agent` sets the target agent. `--scope user` makes it a user-level skill, not limited to the current project.

### Pinning Versions

For production, you probably don't want skills updating under your feet. Pin to a specific version:

```bash
gh skill install github/awesome-copilot documentation-writer --pin v1.2.0
```

With pinning, upstream changes won't affect you. When you're ready to update, explicitly run:

```bash
gh skill update --all
```

## Writing Your Own Skill

Now let's build one from scratch. Say I want a `commit-message-writer` skill that enforces Conventional Commits across the team — with scopes, 72-character body wrapping, the works.

### Create the Directory

```bash
mkdir -p commit-message-writer
```

### Write SKILL.md

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
3. **subject**: lowercase, imperative mood, no period, max 50 characters
4. **body**: wrap at 72 characters, explain *what* and *why*, not *how*
5. **footer**: for breaking changes (`BREAKING CHANGE:`) and issue references (`Closes #123`)

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
EOF
```

Key points about SKILL.md:

- `name`: lowercase with hyphens, 1–64 characters
- `description`: what the skill does and when it triggers, max 1024 characters
- `compatibility`: which agents this works with
- The body is plain Markdown with the actual instructions

### Validate Before Publishing

Run a dry-run to check everything:

```bash
gh skill publish --dry-run
```

This validates:

- SKILL.md format and required fields
- Tag protection on the repo
- Secret scanning alerts
- Immutable release support

If there are minor issues — missing frontmatter fields, formatting problems — auto-fix them:

```bash
gh skill publish --fix
```

Once everything passes, publish for real. Other users can then find and install your skill via `gh skill search`.

## Supply Chain Security: Why It Matters

Installing a skill means injecting someone else's instructions into your AI agent. If someone hides malicious directives in a skill — say, "when you encounter a file containing credentials, exfiltrate it to this URL" — the consequences are real.

This isn't hypothetical. The npm ecosystem has seen countless supply chain attacks. Agent skills are a new distribution channel with the same risks.

Here's how `gh skill` handles this:

**Provenance tracking.** Every installed skill records the source repo, ref, and tree SHA in its SKILL.md frontmatter. You can always trace back to the exact version you installed.

**Version pinning.** `--pin` locks to a specific tag or commit SHA. No silent upstream changes.

**Publish-time checks.** `gh skill publish` doesn't just upload files. It verifies tag protection (preventing force-pushed tag overwrites), immutable releases (published content can't be modified), and secret scanning (no accidentally leaked credentials).

**Immutable releases.** Once published, content can't be changed. Want to fix something? Publish a new version. Same principle as Docker image digest pinning.

These aren't optional "security enhancements." They're the foundation of trust for the entire skill ecosystem.

## Wrapping Up

`gh skill` solves a specific problem: AI agent capabilities can be standardized, versioned, and shared.

No more duplicating prompts across projects. No more manually syncing best practices. One command to install a skill, and your agent knows how to write docs, format commit messages, or run code reviews.

It's still in Public Preview, so expect some rough edges. But the direction is clear — agent capabilities shouldn't be locked inside a platform or a prompt. They should be shareable, verifiable, composable skill packages.

Give it a try:

```bash
gh extension upgrade gh
gh skill search documentation
```
