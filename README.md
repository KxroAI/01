<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/discord.js-5865F2.svg?style=for-the-badge&logo=discorddotjs&logoColor=white" alt="discord.js"/>
  <img src="https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-13aa52.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</p>

# 🎫 Ticket Bot

**Ticket Bot** is a powerful Discord ticket management and feedback system built with Discord.js v14. It features a modular command architecture, full slash + prefix command support, an integrated star-rating feedback system, and a modern Components V2 UI throughout.

---

## ✨ Features

### 🎫 Ticket Management
- Create tickets with customizable categories and panels
- Full ticket lifecycle — open → close → reopen → delete
- Transcript generation via `discord-html-transcripts`
- Add/remove users from tickets with role-based access control
- Blacklist users from opening new tickets

### ⭐ Feedback System
- Members submit star ratings (1–5), written reviews, and an optional image from anywhere in the server
- Admins run `/setup` once to designate a locked feedback channel — the bot posts a panel there automatically
- Review card is posted with the rating, review text, optional image, and reviewer info
- Image-upload flow supported via DM (bot prompts the user to drop an image after the modal, with a Skip option)
- Application emojis synced automatically on startup

### ⚙️ Administration
- Per-server prefix customisation
- Granular ticket panel and settings configuration
- Blacklist management with add/remove/list subcommands

### 🚀 Architecture
- ESM-native Node.js with path aliases (`#classes/*`, `#config/*`, etc.)
- Every command extends a shared `Command` class — both slash and prefix supported without duplication
- One event file per Discord event — `EventLoader` + `DiscordHandler` wire them automatically
- MongoDB/Mongoose for persistent data storage

---

## 🛠️ Tech Stack

| Library | Purpose |
|---------|---------|
| [discord.js v14](https://discord.js.org/) | Discord API |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [discord-html-transcripts](https://github.com/Neroniel/discord-html-transcripts) | Ticket transcript generation |
| [dotenv](https://github.com/Neroniel/dotenv) | Environment variable loading |

---

## 📦 Setup

### Prerequisites
- Node.js **≥ 18.0.0**
- A Discord bot token — [Discord Developer Portal](https://discord.com/developers/applications)
- MongoDB connection string (local or Atlas)

### Installation

```bash
git clone https://github.com/your-repo/ticket-bot.git
cd ticket-bot
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# ── Discord ────────────────────────────────────
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# ── Bot behaviour ──────────────────────────────
PREFIX=.

# ── Database ───────────────────────────────────
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticketbot

# ── Environment ────────────────────────────────
NODE_ENV=production
```

| Variable | Required | Description |
|----------|----------|-------------|
| `TOKEN` | ✅ | Discord bot token |
| `CLIENT_ID` | ✅ | Discord application client ID |
| `PREFIX` | ✅ | Prefix for text commands (e.g. `.`) |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `NODE_ENV` | — | `production` or `development` (default: `development`) |

> **⚠️ Security:** Never commit your `.env` file to version control.

### Starting the Bot

```bash
npm start
```

---

## 🎯 Commands

All commands work as both slash (`/command`) and prefix (`<prefix>command`).

### 🎫 Ticket
| Command | Description |
|---------|-------------|
| `add <user>` | Add a user to the current ticket |
| `remove <user>` | Remove a user from the current ticket |
| `close` | Close the current ticket |
| `delete` | Permanently delete the ticket channel |
| `reopen` | Reopen a closed ticket |

### ⚙️ Panel & Settings
| Command | Description |
|---------|-------------|
| `panel` | Create and manage ticket creation panels |
| `settings` | Configure bot behaviour for this server |

### 👑 Admin *(Manage Server)*
| Command | Description |
|---------|-------------|
| `blacklist add <user>` | Blacklist a user from opening tickets |
| `blacklist remove <user>` | Remove a user from the blacklist |
| `blacklist list` | List all blacklisted users |
| `prefix <new>` | Change the bot prefix for this server |

### ⭐ Feedback
| Command | Description |
|---------|-------------|
| `feedback` | Open the feedback panel to submit a review |
| `setup [#channel]` | Set the feedback channel *(Manage Server)* |

### 🔧 Utility
| Command | Description |
|---------|-------------|
| `ping` | Check WebSocket and REST latency |
| `help` | Show the full command reference |

---

## 🚨 Notes

- This project is actively developed — expect updates and occasional breaking changes.
- Do not remove or modify credits.
- Hosting a public instance without permission is prohibited.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Neroniel">Neroniel</a>
</p>

<p align="center">
  <a href="https://www.roblox.com/communities/5838002/1cy">Support Server</a> •
  <a href="https://github.com/">Report Bug</a> •
  <a href="https://github.com/">Request Feature</a>
</p>
