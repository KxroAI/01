/**
 * Copyright (c) 2025 openUwU
 * Code by bre4d777
 * MIT License
 */

import { Command } from "#structures/classes/Command";
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

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        (textDisplay) => textDisplay.setContent("## Help Panel")
      )
      .addSeparatorComponents(
        (separator) =>
          separator
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
      )
      .addTextDisplayComponents(
        (textDisplay) =>
          textDisplay.setContent(
            "Available commands in the bot are listed below."
          ),
        (textDisplay) =>
          textDisplay.setContent(
            "-# All commands are available as both prefix and slash."
          )
      )
      .addSeparatorComponents(
        (separator) => separator.setSpacing(SeparatorSpacingSize.Small)
      )
      .addSectionComponents(
        (section) =>
          section
            .addTextDisplayComponents(
              (textDisplay) =>
                textDisplay.setContent(
                  "`add` , `close` , `delete` , `remove` , `reopen` , `panel` , `settings` , `prefix` , `blacklist add` , `blacklist remove` , `blacklist list`"
                )
            )
            .setThumbnailAccessory(
              (thumbnail) =>
                thumbnail.setURL(botAvatarURL)
            )
      )
      .addSeparatorComponents(
        (separator) =>
          separator
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
      )
      .addActionRowComponents(
        (actionRow) =>
          actionRow.addComponents(
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
      .addSeparatorComponents(
        (separator) => separator.setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        (textDisplay) =>
          textDisplay.setContent("-# © Bre4d OpenUwU")
      );

    await ctx.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}

export default new HelpCommand();
