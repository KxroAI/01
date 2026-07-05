/**
 * Copyright (c) 2025 openUwU
 * Code by bre4d777
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
    url: "mongodb+srv://AeroX:AeroX@aerox.xik7huh.mongodb.net/?retryWrites=true&w=majority&appName=AeroX",
  },
  debug: true,
  
  links: {
    supportServer: "https://discord.gg/aerox",
    github: "https://github.com/OpenUwU",
    invite:
      "https://discord.com/api/oauth2/authorize?client_id624000&permissions=8&scope=bot",
  },

  watermark: "coded by bre4d",
  version: "2.0.0",
};

// bread signature
