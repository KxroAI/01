/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import { Bot } from "#classes/client";
import { logger } from "#utils/logger";
import express from "express";

process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (
    warning.name === "DeprecationWarning" &&
    warning.message.includes("ready event has been renamed to clientReady")
  ) {
    return;
  }
  console.warn(warning);
});

const client = new Bot();

const startServer = () => {
  const app = express();
  const port = process.env.PORT || 3000;
  app.get("/", (_req, res) => res.send("Bot is running."));
  app.listen(port, () => logger.info("Server", `Keepalive server listening on port ${port}`));
};

const main = async () => {
  try {
    startServer();
    await client.init();
    logger.success("Main", "Discord bot initialized successfully");
  } catch (error) {
    logger.error("Main", "Failed to initialize Discord bot", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info("Shutdown", `Received ${signal}, shutting down gracefully...`);
  try {
    await client.cleanup();
    logger.success("Shutdown", "Bot shut down successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Shutdown", "Error during shutdown", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Process", "Unhandled Rejection", reason);
  logger.error(promise);
});

process.on("uncaughtException", (error, origin) => {
  logger.error("Process", `Uncaught Exception: ${origin}`, error);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main();

export { client };

// kneaded logic
