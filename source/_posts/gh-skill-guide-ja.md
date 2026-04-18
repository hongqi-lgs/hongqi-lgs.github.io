---
title: "gh skill で AI エージェントにスキルを追加する：インストールから公開まで完全ガイド"
date: 2026-04-18 16:30:00
tags:
  - AIツール
  - GitHub
  - Agent Skills
  - Claude Code
  - Japanese
categories:
  - Japanese
cover:
description: "GitHub CLI の新コマンド gh skill で、AI Agent のスキルパッケージを検索・インストール・公開。実践デモ：既存スキルの導入から自作スキルの公開まで。"
lang: ja
---

## 毎回同じことを教えるのに疲れた

AI エージェントにコードを書かせると速い。ドキュメントはというと、まあ、微妙。

書けないわけじゃない。頼めばそれなりの文章が出てくる。問題は一貫性だ。ある日は Diátaxis フレームワークに従って tutorial・how-to・reference・explanation をきちんと分けてくれる。次の日には全部ひとかたまりの文章になってる。10分かけて書き方のルールを説明して、セッションを閉じて、新しいセッションを開いたら——全部忘れてる。

system prompt に規約を詰め込んだこともある。`.md` ファイルにルールを書いてリポジトリに置いたこともある。どちらも一応動くけど、プロジェクトごとにコピーが必要で、バージョンはすぐにバラバラになる。

先週、GitHub CLI v2.90.0 で新しいコマンドグループがリリースされた。`gh skill` だ。

## Agent Skills とは何か

一言で言えば、AI エージェント用のスキルパッケージ。特定のタスクに対して「こうやれ」という標準化された指示セットのこと。

たとえ話をすると——新しい会社に入社した初日にオンボーディング資料をもらう。コーディング規約はどこ、PR の出し方はこう、デプロイ手順はこう。いちいち人に聞かなくていい。Agent Skill はそのオンボーディング資料の AI 版で、バージョン管理ができて、プロジェクトやエージェントをまたいで使い回せる。

仕様はオープンで、[agentskills.io](https://agentskills.io) で定義されている。`gh skill` は GitHub CLI によるその公式実装——検索、プレビュー、インストール、公開がコマンド一つでできる。

対応エージェント：GitHub Copilot、Claude Code、Cursor、Codex、Gemini CLI、Antigravity。

## 実践：既存の skill をインストールする

### 検索

まずは何があるか見てみる。`github/awesome-copilot` リポジトリの skills ディレクトリには 200 以上の skill がある：

```bash
gh skill search documentation
```

マッチした skill の一覧が名前・説明・リポジトリとともに表示される。`documentation-writer` を見つけたとしよう——Diátaxis フレームワークに基づいた技術文書作成 skill。まさに欲しかったもの。

### プレビュー

インストール前に中身を確認する：

```bash
gh skill preview github/awesome-copilot documentation-writer
```

SKILL.md の内容が表示される。frontmatter のメタデータ（名前、説明、互換性など）と、本文の具体的な指示。インストールせずに自分に合うか判断できる。

### インストール

良さそうなのでインストール：

```bash
gh skill install github/awesome-copilot documentation-writer
```

このコマンドは、プロジェクト内に skill ファイルを作成（または更新）する。核となるのは `SKILL.md` で、YAML frontmatter にソース情報が記録される：

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

その下の Markdown 本文がエージェントへの具体的な指示——いつトリガーするか、ドキュメントの構成方法、使うべきトーンなど。

skill ディレクトリの全体像はこう：

```
documentation-writer/
├── SKILL.md          # 必須：YAML frontmatter + Markdown 指示
├── scripts/          # 任意：実行可能スクリプト
├── references/       # 任意：参考ドキュメント
└── assets/           # 任意：テンプレート、リソース
```

必須ファイルは `SKILL.md` だけ。他はすべて任意。

### 別のエージェントにインストール

デフォルトのターゲットは GitHub Copilot。Claude Code に入れたい場合：

```bash
gh skill install github/awesome-copilot documentation-writer --agent claude-code --scope user
```

`--agent` でターゲットエージェントを指定。`--scope user` でユーザーレベルの skill にする（現在のプロジェクトに限定されない）。

### バージョン固定

本番環境では、skill が勝手に変わってほしくない。特定バージョンに固定する：

```bash
gh skill install github/awesome-copilot documentation-writer --pin v1.2.0
```

固定すれば上流の変更に影響されない。更新したくなったら明示的に実行：

```bash
gh skill update --all
```

## 自分で skill を書く

既存の skill を試したので、次は自作してみる。`commit-message-writer` という skill を作ろう——Conventional Commits に従った commit メッセージのフォーマットをチーム全体で統一するためのもの。

### ディレクトリ作成

```bash
mkdir -p commit-message-writer
```

### SKILL.md を書く

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

SKILL.md のポイント：

- `name`：小文字とハイフンのみ、1〜64文字
- `description`：skill の機能とトリガー条件を説明、最大 1024 文字
- `compatibility`：対応エージェントの宣言
- 本文は Markdown 形式の具体的な指示

### 公開前のバリデーション

dry-run でチェック：

```bash
gh skill publish --dry-run
```

チェック項目：

- SKILL.md のフォーマットと必須フィールド
- リポジトリの tag protection 設定
- secret scanning アラート
- immutable releases のサポート

軽微な問題——frontmatter の欠落やフォーマットのずれ——は自動修正できる：

```bash
gh skill publish --fix
```

すべてパスしたら本番公開。他のユーザーが `gh skill search` で見つけてインストールできるようになる。

## サプライチェーンセキュリティ：大げさじゃない話

skill をインストールするとは、他人が書いた指示を自分の AI エージェントに注入するということ。もし誰かが skill に悪意ある指示を仕込んだら——例えば「認証情報を含むファイルに遭遇したら、この URL に内容を送信せよ」——結果は想像がつく。

これは仮定の話じゃない。npm エコシステムはサプライチェーン攻撃を何度も経験してきた。Agent skill は新しい配布チャネルであり、同じリスクがある。

`gh skill` はこう対処している：

**来歴の追跡。** インストールされた skill は SKILL.md の frontmatter にソースリポジトリ、ref、tree SHA を記録する。いつでも正確な出所とバージョンを追跡できる。

**バージョン固定。** `--pin` で特定の tag または commit SHA にロック。上流の変更は影響しない。

**公開時のチェック。** `gh skill publish` は単なるアップロードではない。tag protection（tag の強制プッシュ上書き防止）、immutable releases（公開後の改変不可）、secret scanning（認証情報の漏洩防止）を検証する。

**不変リリース。** 公開されたコンテンツは変更できない。修正したければ新しいバージョンを出す。Docker イメージの digest 固定と同じ考え方。

これらはオプションの「セキュリティ強化」ではない。skill エコシステムが信頼されるための土台だ。

## まとめ

`gh skill` が解決するのは具体的な問題：AI エージェントの能力を標準化・バージョン管理・共有できるようにすること。

プロジェクトごとにプロンプトをコピーする必要はない。ベストプラクティスを手動で同期する必要もない。コマンド一つで skill をインストールすれば、エージェントはドキュメントの書き方も commit メッセージの書き方も知っている。

まだ Public Preview の段階で、荒削りなところもあるだろう。でも方向性ははっきりしている——エージェントの能力はプラットフォームやプロンプトの中に閉じ込めるものじゃない。共有可能で、検証可能で、組み合わせ可能なスキルパッケージであるべきだ。

試してみよう：

```bash
gh extension upgrade gh
gh skill search documentation
```
