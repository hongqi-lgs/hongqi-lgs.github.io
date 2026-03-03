---
title: "Windows 电脑安装 OpenClaw 完整指南：从零到运行你的 AI 助手"
date: 2026-03-03 10:30:00
categories: [技术教程]
tags: [OpenClaw, AI, Windows, WSL2, 教程]
description: "手把手教你在 Windows 电脑上安装 OpenClaw AI 助手，包括 WSL2 配置、Node.js 环境准备、OpenClaw 安装和首次运行的完整流程。"
---

## 什么是 OpenClaw？

OpenClaw 是一个**自托管的 AI 助手网关**，可以将你常用的聊天应用（WhatsApp、Telegram、Discord、iMessage 等）与 AI 编程助手连接起来。你可以在自己的机器上运行，完全掌控数据，无需依赖任何托管服务。

**核心特点：**
- **自托管**：运行在你的硬件上，你的规则
- **多渠道支持**：一个网关同时服务多个聊天平台
- **为 AI 代理而生**：支持工具调用、会话管理、记忆系统和多代理路由
- **开源**：MIT 许可证，社区驱动

简单来说，你只需要 Node.js 22+、一个 API 密钥和 5 分钟时间，就能拥有一个随时可用的 AI 助手。

<!-- more -->

## Windows 用户的推荐方案：WSL2

OpenClaw 在 Windows 上推荐**通过 WSL2（Windows Subsystem for Linux）运行**，特别推荐使用 Ubuntu 发行版。

**为什么选择 WSL2？**
1. **运行时一致性**：WSL2 提供完整的 Linux 环境，保证 OpenClaw 的运行时与 macOS/Linux 版本完全一致
2. **工具兼容性更好**：Node.js、pnpm、技能脚本等工具在 Linux 环境下工作得更好
3. **安装简单**：只需一条命令 `wsl --install` 即可完成 WSL2 安装

> **注**：原生 Windows 版本的伴侣应用正在计划中，但目前推荐使用 WSL2。

## 完整安装流程

### 第一步：安装 WSL2 和 Ubuntu

1. **打开 PowerShell（管理员模式）**

   - 按 `Win + X`，选择"Windows PowerShell（管理员）"或"Windows 终端（管理员）"

2. **安装 WSL2**

   ```powershell
   wsl --install
   ```

   如果想明确指定 Ubuntu 24.04：

   ```powershell
   # 先查看可用的发行版
   wsl --list --online
   
   # 安装 Ubuntu 24.04
   wsl --install -d Ubuntu-24.04
   ```

3. **重启电脑**

   安装完成后，如果 Windows 提示需要重启，请重启电脑。

4. **首次启动 Ubuntu**

   重启后，打开"开始菜单"，搜索"Ubuntu"并启动。首次启动会要求你：
   - 设置 Linux 用户名（建议使用小写字母）
   - 设置密码（输入时不显示，这是正常的）

### 第二步：启用 systemd（必需）

OpenClaw 的 Gateway 服务需要 systemd 支持。

1. **在 Ubuntu 终端中运行以下命令**：

   ```bash
   sudo tee /etc/wsl.conf >/dev/null <<'EOF'
   [boot]
   systemd=true
   EOF
   ```

2. **关闭 WSL2**

   回到 PowerShell（管理员），执行：

   ```powershell
   wsl --shutdown
   ```

3. **重新打开 Ubuntu**

   从开始菜单再次启动 Ubuntu。

4. **验证 systemd 是否启用**

   ```bash
   systemctl --user status
   ```

   如果看到 systemd 的状态输出（即使是错误也没关系，只要不是"command not found"），说明启用成功。

### 第三步：安装 OpenClaw

现在我们在 WSL2 的 Ubuntu 环境中安装 OpenClaw。

1. **运行安装脚本**

   ```bash
   curl -fsSL https://openclaw.ai/install.sh | bash
   ```

   这个脚本会自动：
   - 检测并安装 Node.js 22+（如果缺失）
   - 安装 Git（如果缺失）
   - 通过 npm 全局安装 OpenClaw
   - 运行引导向导（如果是交互式终端）

2. **等待安装完成**

   安装过程可能需要几分钟，取决于网络速度。

3. **验证安装**

   ```bash
   openclaw --version
   ```

   如果显示版本号（例如 `0.x.x`），说明安装成功。

### 第四步：运行引导向导

OpenClaw 提供了一个友好的引导向导，帮助你完成初始配置。

```bash
openclaw onboard --install-daemon
```

**引导向导会引导你完成：**
1. **认证配置**：设置 API 密钥（OpenAI、Anthropic 等）
2. **Gateway 设置**：配置网关的基本参数
3. **可选渠道**：配置 WhatsApp、Telegram、Discord 等聊天渠道（可以先跳过）
4. **安装系统服务**：将 Gateway 安装为后台服务

> **提示**：如果你只是想快速试用，可以暂时跳过聊天渠道的配置，直接使用浏览器的 Control UI。

### 第五步：检查 Gateway 状态

如果安装了 Gateway 服务，它应该已经在后台运行了：

```bash
openclaw gateway status
```

你应该看到类似这样的输出：
```
✔ Gateway is running (PID: xxxxx)
```

如果没有运行，可以手动启动：

```bash
openclaw gateway start
```

### 第六步：打开 Control UI

OpenClaw 提供了一个基于浏览器的控制界面（Control UI），你可以直接在浏览器中与 AI 助手对话。

```bash
openclaw dashboard
```

这会自动在你的默认浏览器中打开 `http://127.0.0.1:18789/`。

**如果浏览器没有自动打开**，你也可以手动访问：
- 本地访问：`http://127.0.0.1:18789/`
- 或使用 WSL2 的 IP 地址（见进阶技巧）

## 开始使用

### 方式一：在 Control UI 中对话

在浏览器的 Control UI 中，你可以直接输入消息与 AI 助手对话。试试问它：
- "你好，请介绍一下你自己"
- "帮我总结一下今天的待办事项"
- "搜索一下最新的 AI 新闻"

### 方式二：配置聊天渠道

如果你想在 WhatsApp、Telegram 等应用中使用 OpenClaw，需要配置相应的渠道。

查看具体渠道的配置文档：
```bash
openclaw help channels
```

或访问官方文档：https://docs.openclaw.ai/channels

## 常见问题与解决方案

### Q1: 安装完成后找不到 `openclaw` 命令？

**原因**：通常是 PATH 环境变量问题。

**解决方法**：
1. 关闭当前的 Ubuntu 终端，重新打开一个新的终端
2. 如果仍然找不到，检查 Node.js 的全局安装路径：
   ```bash
   npm config get prefix
   ```
3. 确保该路径已添加到 `~/.bashrc` 或 `~/.zshrc` 中：
   ```bash
   echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Q2: 如何从 Windows 主机访问 WSL2 中的 Gateway？

**问题**：WSL2 有自己的虚拟网络，Windows 主机上的浏览器默认无法访问 `127.0.0.1:18789`。

**解决方法**：使用端口转发（需要管理员权限）。

在 PowerShell（管理员）中运行：

```powershell
# 获取 WSL2 的 IP 地址
$WslIp = (wsl -- hostname -I).Trim().Split(" ")[0]

# 添加端口转发规则
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=18789 connectaddress=$WslIp connectport=18789

# 添加防火墙规则（一次性）
New-NetFirewallRule -DisplayName "OpenClaw Gateway" -Direction Inbound -Protocol TCP -LocalPort 18789 -Action Allow
```

然后在 Windows 主机上访问 `http://localhost:18789/` 即可。

> **注意**：WSL2 的 IP 地址会在重启后变化，需要重新运行端口转发规则。

### Q3: Gateway 无法启动，提示端口占用？

**解决方法**：更改 Gateway 端口。

编辑配置文件：
```bash
nano ~/.openclaw/openclaw.json
```

添加或修改：
```json
{
  "gateway": {
    "port": 18790
  }
}
```

保存后重启 Gateway：
```bash
openclaw gateway restart
```

### Q4: 如何更新 OpenClaw？

```bash
# npm 安装方式
npm update -g openclaw

# git 安装方式（如果你用的是源码安装）
cd ~/openclaw
git pull
pnpm install
pnpm build
```

### Q5: 如何卸载 OpenClaw？

```bash
# 停止并删除服务
openclaw gateway uninstall

# 卸载 npm 包
npm uninstall -g openclaw

# 删除配置和数据（可选）
rm -rf ~/.openclaw
```

## 进阶技巧

### 1. 前台运行 Gateway（调试时使用）

```bash
openclaw gateway --port 18789
```

按 `Ctrl+C` 停止。

### 2. 发送测试消息（需要先配置渠道）

```bash
openclaw message send --target +15555550123 --message "Hello from OpenClaw"
```

### 3. 自定义配置和数据目录

通过环境变量指定：
```bash
export OPENCLAW_HOME=~/my-openclaw
export OPENCLAW_STATE_DIR=~/openclaw-data
export OPENCLAW_CONFIG_PATH=~/openclaw-config.json
```

完整环境变量参考：https://docs.openclaw.ai/help/environment

### 4. 查看 Gateway 日志

```bash
openclaw gateway logs
```

或使用 systemd（如果安装了服务）：
```bash
journalctl --user -u openclaw-gateway -f
```

## 下一步

恭喜！你已经成功在 Windows 电脑上安装并运行了 OpenClaw。

**推荐的下一步：**
1. **探索 Control UI**：熟悉 AI 助手的基本功能
2. **连接聊天渠道**：配置 Telegram、Discord 等，让 AI 助手随时待命
3. **自定义配置**：调整 OpenClaw 的行为，添加工作区文件（`SOUL.md`、`AGENTS.md` 等）
4. **探索技能系统**：为你的 AI 助手添加新技能

**有用的资源：**
- 官方文档：https://docs.openclaw.ai/
- GitHub 仓库：https://github.com/openclaw/openclaw
- 社区讨论：https://discord.com/invite/clawd
- 技能市场：https://clawhub.com

## 总结

通过 WSL2，Windows 用户可以轻松运行 OpenClaw，享受与 Linux/macOS 用户一致的体验。整个安装过程只需要：

1. ✅ 安装 WSL2 和 Ubuntu
2. ✅ 启用 systemd
3. ✅ 运行安装脚本
4. ✅ 完成引导向导
5. ✅ 打开 Control UI，开始对话

整个流程不超过 15 分钟，即使是完全没有 Linux 经验的用户也能轻松完成。

现在，你的个人 AI 助手已经准备就绪了！🎉

---

**相关阅读：**
- [如何用 AI 赚取第一桶金：普通人切实可行的 7 个路径](/2026/03/02/ai-first-money/)
- [Rust 会是 AI 时代的最好的编程语言吗？](/2026/03/02/rust-ai-language/)
- [AI Coding 的绊脚石之一：程序的隐式契约问题](/2026/03/02/ai-coding-implicit-contracts/)
