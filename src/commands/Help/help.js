/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import { Command } from "#classes/Command";
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SectionBuilder,
  ThumbnailBuilder,
} from "discord.js";
import { config } from "#config/config";

class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Show all available commands",
      usage: "help",
      examples: ["help"],
      userPermissions: [],
      botPermissions: [],
      enabledSlash: true,
      slashData: {
        name: "help",
        description: "Show all available commands",
      },
    });
  }

  async execute({ ctx }) {
    const botAvatarURL = ctx.client.user.displayAvatarURL({ size: 256 });
    const prefix = config.prefix;

    const container = new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 📋 Help Panel\nAll commands are available as both slash (\`/\`) and prefix (\`${prefix}\`).`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(botAvatarURL)
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // ── Ticket ──────────────────────────────────────────────────────────────
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("🎫 **Ticket**")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`add\` — Add a user to the current ticket\n` +
          `\`remove\` — Remove a user from the current ticket\n` +
          `\`close\` — Close the current ticket\n` +
          `\`delete\` — Permanently delete the current ticket\n` +
          `\`reopen\` — Reopen a closed ticket`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // ── Panel & Settings ─────────────────────────────────────────────────────
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("⚙️ **Panel & Settings**")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`panel\` — Create and manage ticket panels\n` +
          `\`settings\` — Configure bot behaviour for this server`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // ── Admin ────────────────────────────────────────────────────────────────
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("👑 **Admin** · *Manage Server*")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`blacklist add <user>\` — Blacklist a user from opening tickets\n` +
          `\`blacklist remove <user>\` — Remove a user from the blacklist\n` +
          `\`blacklist list\` — List all blacklisted users\n` +
          `\`prefix <new>\` — Change the bot prefix for this server`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // ── Feedback ─────────────────────────────────────────────────────────────
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("⭐ **Feedback**")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`feedback\` — Open the feedback panel to submit a review\n` +
          `\`setup [#channel]\` — Set the feedback channel · *Manage Server*`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // ── Utility ──────────────────────────────────────────────────────────────
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("🔧 **Utility**")
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `\`ping\` — Check bot latency\n` +
          `\`help\` — Show this panel`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // ── Footer buttons ───────────────────────────────────────────────────────
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL(config.links.supportServer),
          new ButtonBuilder()
            .setLabel("GitHub")
            .setStyle(ButtonStyle.Link)
            .setURL(config.links.github)
        )
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# © 2026 N · coded by Neroniel · prefix: \`${prefix}\``)
      );

    await ctx.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}

export default new HelpCommand();
