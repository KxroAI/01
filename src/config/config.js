/**
 * Copyright (c) 2025 N
 * Code by Neroniel
 * MIT License
 */

import dotenv from "dotenv";
dotenv.config();

export const config = {
  token: process.env.TOKEN || process.env.token || "yourtokenhere",

  clientId: process.env.CLIENT_ID || "botclientidhere",

  prefix: process.env.PREFIX || ".",

  environment: process.env.NODE_ENV || "development",

  database: {
    url: process.env.MONGO_URI || process.env.MONGODB_URI || "",
  },

  debug: true,

  links: {
    supportServer: "https://discord.gg/",
    github: "https://github.com/",
    invite:
      "https://discord.com/oauth2/authorize?client_id=0000&permissions=8&integration_type=0&scope=bot%20applications.commands",
  },

  watermark: "coded by Neroniel",
  version: "2.0.0",
};
