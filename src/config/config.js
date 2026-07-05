/**
 * Copyright (c) 2025 openUwU
 * Code by Neroniel
 * MIT License
 */

import dotenv from "dotenv";
dotenv.config();


export const config = {
  token:
    process.env.token ||
    "yourtokenhere",

  clientId: "botclientidhere",
  prefix: process.env.PREFIX || ".",


  environment: process.env.NODE_ENV || "development",
  database: {
    url: "",
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

// bread signature
