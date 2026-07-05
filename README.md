![Header](https://raw.githubusercontent.com/OpenUwU/.github/refs/heads/main/header.jpg)

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/discord.js-5865F2.svg?style=for-the-badge&logo=discorddotjs&logoColor=white" alt="discord.js"/>
  <img src="https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-13aa52.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</p>

<p align="center">
  
  <img src="https://img.shields.io/github/stars/OpenUwU/TicketBot?style=for-the-badge" alt="Stars"/>
  <img src="https://img.shields.io/github/forks/OpenUwU/TicketBot?style=for-the-badge" alt="Forks"/>
  <img src="https://img.shields.io/github/issues/OpenUwU/TicketBot?style=for-the-badge" alt="Issues"/>
</p>

# 🎫 Ticket Bot

**Ticket Bot** is a powerful and versatile Discord ticket management system built with Discord.js, featuring advanced ticket handling capabilities and a modular command architecture. Designed for efficient support ticket management and comprehensive server administration, Ticket Bot streamlines communication between server moderators and members.

## ✨ Key Features

### 🎫 Ticket Management
- **Create Tickets:** Members can easily create support tickets with customizable categories
- **Ticket Lifecycle:** Complete ticket workflow from creation to closure and archival
- **Reopen Tickets:** Closed tickets can be reopened if needed with full history preservation
- **Ticket Ratings:** Rate ticket quality and handler performance with built-in rating system

### 🛠️ Customization
- **Custom Panel Settings:** Configure ticket creation panels with custom messages and buttons
- **Role-Based Access:** Assign support roles with specific permissions and capabilities
- **Emoji Customization:** Beautiful custom emojis for enhanced visual appeal
- **Server Configuration:** Granular control over ticket behavior and settings

### 📊 Admin Features
- **Panel Management:** Create and manage multiple ticket panels
- **Settings Dashboard:** Configure bot behavior from a dedicated settings command
- **Ticket Logs:** Complete audit trail of all ticket interactions
- **User Management:** Remove and manage users within ticket channels

### 🚀 Performance
- **Fast Processing:** Optimized for rapid ticket creation and management
- **Database Efficiency:** MongoDB integration for reliable data storage
- **Scalable Architecture:** Handles multiple concurrent tickets seamlessly
- **Component V2 Support:** Modern Discord UI with interactive components

## 🛠️ Technologies Used

- **[Discord.js](https://discord.js.org/)** - Discord API library
- **[MongoDB](https://www.mongodb.com/)** - Document database for data persistence
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[discord-html-transcripts](https://github.com/ItzDerock/discord-html-transcripts)** - Ticket transcript generation

## 📦 Setup Instructions

### Prerequisites
- Node.js v16.9.0 or higher
- A Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- MongoDB database (local or cloud instance)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OpenUwU/ticket-bot.git
   cd ticket-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Required
   token=your_bot_token_here
   clientID=your_client_id_here
   
   # Database
   mongodbURL=your_mongodb_connection_string
   ```

4. **Start the bot:**
   
   For production:
   ```bash
   npm start
   ```
   
   For development (with hot-reloading):
   ```bash
   npm run dev
   ```

## 📝 Configuration Guide

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `token` | Your Discord bot token | ✅ Yes | - |
| `clientID` | Discord application client ID | ✅ Yes | - |
| `mongodbURL` | MongoDB connection string | ✅ Yes | - |

See `.env.example` for the complete list of configuration options.

## 🎯 Commands

### Ticket Management Commands
- `add <user>` - Add a user to the current ticket
- `close` - Close the current ticket
- `delete` - Delete the closed ticket
- `remove <user>` - Remove a user from the ticket
- `reopen` - Reopen a closed ticket

### Admin Commands
- `panel` - Create and manage ticket creation panels
- `settings` - Configure bot settings and behavior
- `help` - Display help information with all available commands

## 📄 Example .env File

Here's a complete example of a configured `.env` file:

```env
# ====================================
# DISCORD BOT CONFIGURATION
# ====================================
token=your_bot_token_here
clientID=your_client_id_here

# ====================================
# DATABASE CONFIGURATION
# ====================================
mongodbURL=mongodb+srv://username:password@cluster.mongodb.net/ticketbot

# ====================================
# ENVIRONMENT
# ====================================
NODE_ENV=production
```

> **⚠️ Security Warning:** Never commit your `.env` file to version control! Always keep your tokens and connection strings private.

## 🚨 Important Notes

- **Under Development:** This project is actively being developed. Expect potential bugs and breaking changes.
- **Report Issues:** Found a bug? Please report it on the [GitHub Issues](https://github.com/OpenUwU/ticket-bot/issues) page.
- **Public Hosting:** Hosting a public instance without permission is prohibited.
- **Credits:** Do not remove or modify the project credits.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 👥 Credits

**Ticket Bot** is maintained by [The OpenUwU Project](https://github.com/OpenUwU) and created by **bre4d777**.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/bre4d777">bre4d777</a>
</p>

<p align="center">
  <a href="https://discord.gg/aerox">Support Server</a> •
  <a href="https://github.com/OpenUwU/ticket-bot/issues">Report Bug</a> •
  <a href="https://github.com/OpenUwU/ticket-bot/issues">Request Feature</a>
</p>
