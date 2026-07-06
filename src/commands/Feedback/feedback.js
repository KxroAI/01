/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import { Command } from '#classes/Command';
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { getEmoji } from '../../feedback/emoji.js';
import { pendingGuildMap } from '../../feedback/feedbackConfig.js';

function buildFeedbackPanel(botAvatarURL) {
  const c = new ContainerBuilder().setAccentColor(0x5865F2);

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${getEmoji('review')} Feedback\nYour honest opinion actually matters here.\nNo fake reviews, no filters — just real experiences from real users.`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarURL)),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `Hit the button below to open the review form.\nIt only takes a minute — and every submission gets read.`,
    ),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_feedback_modal')
        .setLabel('Write Your Review')
        .setStyle(ButtonStyle.Primary),
    ),
  );

  return c;
}

class FeedbackCommand extends Command {
  constructor() {
    super({
      name: 'feedback',
      description: 'Submit a review or open the feedback panel',
      usage: 'feedback',
      examples: ['feedback'],
      userPermissions: [],
      botPermissions: [],
      enabledSlash: true,
      slashData: {
        name: 'feedback',
        description: 'Open the feedback panel to submit a review',
        options: [],
      },
    });
  }

  async execute({ ctx }) {
    const botAvatar = ctx.client.user.displayAvatarURL({ size: 128, extension: 'png' });
    const panel = buildFeedbackPanel(botAvatar);

    if (ctx.isSlash) {
      // Store guild so the button handler knows where to post
      pendingGuildMap.set(ctx.user.id, ctx.guild.id);

      await ctx.reply({
        components: [panel],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      });
    } else {
      // Prefix: send panel in the guild channel
      pendingGuildMap.set(ctx.user.id, ctx.guild.id);

      await ctx.reply({
        components: [panel],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }
}

export default new FeedbackCommand();
