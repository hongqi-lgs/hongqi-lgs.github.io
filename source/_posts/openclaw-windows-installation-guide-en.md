---
title: "Complete Guide to Installing OpenClaw on Windows: From Zero to Your AI Assistant"
date: 2026-03-03 10:30:00
categories: [English]
tags: [OpenClaw, AI, Windows, WSL2, Tutorial]
lang: en
description: "A comprehensive step-by-step guide to installing OpenClaw AI assistant on Windows, including WSL2 setup, Node.js environment preparation, and first-time configuration."
---

## What is OpenClaw?

OpenClaw is a **self-hosted AI assistant gateway** that connects your favorite chat apps (WhatsApp, Telegram, Discord, iMessage, etc.) with AI coding agents. You run it on your own machine, maintain complete control over your data, and don't rely on any hosted services.

**Core Features:**
- **Self-hosted**: Runs on your hardware, your rules
- **Multi-channel**: One gateway serves multiple chat platforms simultaneously
- **Agent-native**: Built for AI agents with tool use, session management, memory, and multi-agent routing
- **Open source**: MIT licensed, community-driven

Simply put, all you need is Node.js 22+, an API key, and 5 minutes to have an always-available AI assistant.

<!-- more -->

## Recommended Approach for Windows: WSL2

OpenClaw on Windows is recommended **via WSL2 (Windows Subsystem for Linux)**, particularly with the Ubuntu distribution.

**Why WSL2?**
1. **Runtime consistency**: WSL2 provides a complete Linux environment, ensuring OpenClaw's runtime is identical to macOS/Linux versions
2. **Better tool compatibility**: Node.js, pnpm, skill scripts, and other tools work better in Linux
3. **Simple installation**: Just one command `wsl --install` to set up WSL2

> **Note**: Native Windows companion apps are planned but currently WSL2 is the recommended approach.

## Complete Installation Process

### Step 1: Install WSL2 and Ubuntu

1. **Open PowerShell (Administrator mode)**

   - Press `Win + X`, select "Windows PowerShell (Admin)" or "Windows Terminal (Admin)"

2. **Install WSL2**

   ```powershell
   wsl --install
   ```

   To explicitly specify Ubuntu 24.04:

   ```powershell
   # First, check available distributions
   wsl --list --online
   
   # Install Ubuntu 24.04
   wsl --install -d Ubuntu-24.04
   ```

3. **Restart your computer**

   If Windows prompts for a restart, please restart your computer.

4. **First Ubuntu launch**

   After restart, open the Start menu, search for "Ubuntu" and launch it. The first launch will ask you to:
   - Set a Linux username (lowercase letters recommended)
   - Set a password (input is hidden, this is normal)

### Step 2: Enable systemd (Required)

OpenClaw's Gateway service requires systemd support.

1. **Run the following command in the Ubuntu terminal**:

   ```bash
   sudo tee /etc/wsl.conf >/dev/null <<'EOF'
   [boot]
   systemd=true
   EOF
   ```

2. **Shutdown WSL2**

   Back in PowerShell (Admin), execute:

   ```powershell
   wsl --shutdown
   ```

3. **Reopen Ubuntu**

   Launch Ubuntu again from the Start menu.

4. **Verify systemd is enabled**

   ```bash
   systemctl --user status
   ```

   If you see systemd status output (even errors are okay, just not "command not found"), systemd is enabled.

### Step 3: Install OpenClaw

Now we install OpenClaw in the WSL2 Ubuntu environment.

1. **Run the installation script**

   ```bash
   curl -fsSL https://openclaw.ai/install.sh | bash
   ```

   This script will automatically:
   - Detect and install Node.js 22+ (if missing)
   - Install Git (if missing)
   - Install OpenClaw globally via npm
   - Run the onboarding wizard (for interactive terminals)

2. **Wait for installation to complete**

   The installation may take a few minutes depending on network speed.

3. **Verify installation**

   ```bash
   openclaw --version
   ```

   If it shows a version number (e.g., `0.x.x`), installation succeeded.

### Step 4: Run the Onboarding Wizard

OpenClaw provides a friendly onboarding wizard to help with initial configuration.

```bash
openclaw onboard --install-daemon
```

**The wizard will guide you through:**
1. **Authentication setup**: Configure API keys (OpenAI, Anthropic, etc.)
2. **Gateway settings**: Configure basic gateway parameters
3. **Optional channels**: Set up WhatsApp, Telegram, Discord, etc. (can skip for now)
4. **Install system service**: Install Gateway as a background service

> **Tip**: If you just want to try it quickly, you can skip chat channel configuration and use the browser Control UI directly.

### Step 5: Check Gateway Status

If you installed the Gateway service, it should already be running:

```bash
openclaw gateway status
```

You should see output like:
```
✔ Gateway is running (PID: xxxxx)
```

If not running, manually start it:

```bash
openclaw gateway start
```

### Step 6: Open the Control UI

OpenClaw provides a browser-based Control UI where you can chat directly with your AI assistant.

```bash
openclaw dashboard
```

This will automatically open `http://127.0.0.1:18789/` in your default browser.

**If the browser doesn't auto-open**, you can manually visit:
- Local access: `http://127.0.0.1:18789/`
- Or use WSL2's IP address (see Advanced Tips)

## Getting Started

### Method 1: Chat in Control UI

In the browser Control UI, you can directly message your AI assistant. Try asking:
- "Hello, please introduce yourself"
- "Help me summarize today's todos"
- "Search for the latest AI news"

### Method 2: Configure Chat Channels

If you want to use OpenClaw in WhatsApp, Telegram, etc., you need to configure the respective channels.

View channel configuration docs:
```bash
openclaw help channels
```

Or visit the official docs: https://docs.openclaw.ai/channels

## Common Issues & Solutions

### Q1: Can't find `openclaw` command after installation?

**Cause**: Usually a PATH environment variable issue.

**Solution**:
1. Close the current Ubuntu terminal and open a new one
2. If still not found, check Node.js global install path:
   ```bash
   npm config get prefix
   ```
3. Ensure this path is added to `~/.bashrc` or `~/.zshrc`:
   ```bash
   echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Q2: How to access WSL2's Gateway from Windows host?

**Problem**: WSL2 has its own virtual network, Windows host browser can't access `127.0.0.1:18789` by default.

**Solution**: Use port forwarding (requires administrator privileges).

In PowerShell (Admin), run:

```powershell
# Get WSL2's IP address
$WslIp = (wsl -- hostname -I).Trim().Split(" ")[0]

# Add port forwarding rule
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=18789 connectaddress=$WslIp connectport=18789

# Add firewall rule (one-time)
New-NetFirewallRule -DisplayName "OpenClaw Gateway" -Direction Inbound -Protocol TCP -LocalPort 18789 -Action Allow
```

Then access `http://localhost:18789/` from Windows host.

> **Note**: WSL2's IP address changes after restart, you'll need to re-run the port forwarding rule.

### Q3: Gateway won't start, port already in use?

**Solution**: Change Gateway port.

Edit config file:
```bash
nano ~/.openclaw/openclaw.json
```

Add or modify:
```json
{
  "gateway": {
    "port": 18790
  }
}
```

Save and restart Gateway:
```bash
openclaw gateway restart
```

### Q4: How to update OpenClaw?

```bash
# npm installation method
npm update -g openclaw

# git installation method (if you installed from source)
cd ~/openclaw
git pull
pnpm install
pnpm build
```

### Q5: How to uninstall OpenClaw?

```bash
# Stop and remove service
openclaw gateway uninstall

# Uninstall npm package
npm uninstall -g openclaw

# Delete config and data (optional)
rm -rf ~/.openclaw
```

## Advanced Tips

### 1. Run Gateway in foreground (for debugging)

```bash
openclaw gateway --port 18789
```

Press `Ctrl+C` to stop.

### 2. Send test message (requires configured channel)

```bash
openclaw message send --target +15555550123 --message "Hello from OpenClaw"
```

### 3. Customize config and data directories

Specify via environment variables:
```bash
export OPENCLAW_HOME=~/my-openclaw
export OPENCLAW_STATE_DIR=~/openclaw-data
export OPENCLAW_CONFIG_PATH=~/openclaw-config.json
```

Full environment variable reference: https://docs.openclaw.ai/help/environment

### 4. View Gateway logs

```bash
openclaw gateway logs
```

Or use systemd (if service is installed):
```bash
journalctl --user -u openclaw-gateway -f
```

## Next Steps

Congratulations! You've successfully installed and run OpenClaw on Windows.

**Recommended next steps:**
1. **Explore Control UI**: Familiarize yourself with basic AI assistant features
2. **Connect chat channels**: Configure Telegram, Discord, etc. for always-on assistance
3. **Customize configuration**: Adjust OpenClaw's behavior, add workspace files (`SOUL.md`, `AGENTS.md`, etc.)
4. **Explore skill system**: Add new skills to your AI assistant

**Useful resources:**
- Official docs: https://docs.openclaw.ai/
- GitHub repo: https://github.com/openclaw/openclaw
- Community: https://discord.com/invite/clawd
- Skill marketplace: https://clawhub.com

## Summary

With WSL2, Windows users can easily run OpenClaw and enjoy the same experience as Linux/macOS users. The entire installation requires only:

1. ✅ Install WSL2 and Ubuntu
2. ✅ Enable systemd
3. ✅ Run installation script
4. ✅ Complete onboarding wizard
5. ✅ Open Control UI and start chatting

The whole process takes less than 15 minutes, and even users with no Linux experience can complete it easily.

Now your personal AI assistant is ready! 🎉

---

**Related Reading:**
- [How to Make Your First Money with AI: 7 Practical Paths for Ordinary People](/2026/03/02/ai-first-money-en/)
- [Will Rust Be the Best Programming Language in the AI Era?](/2026/03/02/rust-ai-language-en/)
- [One Stumbling Block in AI Coding: The Problem of Implicit Contracts](/2026/03/02/ai-coding-implicit-contracts-en/)
