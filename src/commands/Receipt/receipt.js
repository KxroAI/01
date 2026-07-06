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
function buildReceiptPanel(botAvatarURL) {
  const c = new ContainerBuilder().setAccentColor(0x57F287);

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# 🧾 Payment Receipt\nJust made a payment? Get it logged in seconds.\n\nClick the button below and upload your screenshot as proof of payment.`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarURL)),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# 📸 A screenshot is required to submit your receipt.`,
    ),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_receipt_modal')
        .setLabel('Submit Receipt')
        .setStyle(ButtonStyle.Success),
    ),
  );

  return c;
}

class ReceiptCommand extends Command {
  constructor() {
    super({
      name: 'receipt',
      description: 'Submit a payment receipt',
      usage: 'receipt',
      examples: ['receipt'],
      userPermissions: [],
      botPermissions: [],
      enabledSlash: true,
      slashData: {
        name: 'receipt',
        description: 'Submit a payment receipt for verification',
        options: [],
      },
    });
  }

  async execute({ ctx }) {
    const botAvatar = ctx.client.user.displayAvatarURL({ size: 128, extension: 'png' });
    const panel = buildReceiptPanel(botAvatar);

    await ctx.reply({
      components: [panel],
      flags: ctx.isSlash
        ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        : MessageFlags.IsComponentsV2,
    });
  }
}

export default new ReceiptCommand();
