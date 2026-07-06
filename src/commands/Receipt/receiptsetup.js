/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import { Command } from '#classes/Command';
import {
  PermissionFlagsBits,
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
  ChannelType,
} from 'discord.js';
import { getEmoji } from '../../feedback/emoji.js';
import { config } from '#config/config';
import { RECEIPT_LOG_CHANNEL_ID } from '../../receipt/receiptConfig.js';

function buildReceiptPanel(botAvatarURL) {
  const c = new ContainerBuilder().setAccentColor(0x57F287);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 🧾 Payment Receipts`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Made a payment? Submit your receipt here for verification.\n\nClick **Submit Receipt** and upload your screenshot — we'll take it from there.`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatarURL)),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# 📸 A screenshot is required to complete your submission.`,
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

async function lockChannel(channel, guild) {
  try {
    await channel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false,
      AddReactions: false,
    });
    const me = guild.members.me;
    if (me) {
      await channel.permissionOverwrites.edit(me, {
        SendMessages: true,
        ViewChannel: true,
        EmbedLinks: true,
        AttachFiles: true,
        AddReactions: true,
      });
    }
  } catch {}
}

async function finishSetup(client, guildId, guild, channel, botAvatar, replyFn) {
  await client.db.setReceiptChannel(guildId, channel.id);
  await lockChannel(channel, guild);
  await channel.send({
    components: [buildReceiptPanel(botAvatar)],
    flags: MessageFlags.IsComponentsV2,
  });

  const ok = new ContainerBuilder().setAccentColor(0x57F287);
  ok.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('success') || '✅'} **Setup Complete**\n<#${channel.id}> is now the receipt channel.\nThe channel has been locked — only the bot can post there.`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatar)),
  );
  ok.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );
  ok.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${getEmoji('info') || 'ℹ️'} Receipts will also be logged to <#${RECEIPT_LOG_CHANNEL_ID}> automatically.\nUsers can submit receipts with \`/receipt\` or \`${config.prefix}receipt\` from anywhere in the server.`,
    ),
  );

  await replyFn({ components: [ok], flags: MessageFlags.IsComponentsV2 });
}

class ReceiptSetupCommand extends Command {
  constructor() {
    super({
      name: 'receiptsetup',
      description: 'Configure the receipt channel for this server',
      usage: 'receiptsetup [#channel]',
      examples: ['receiptsetup', 'receiptsetup #receipts'],
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [],
      enabledSlash: true,
      slashData: {
        name: 'receiptsetup',
        description: 'Configure the receipt channel for this server',
        defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
        options: [
          {
            name: 'channel',
            description: 'Channel to use (creates one if not provided)',
            type: 7,
            required: false,
            channel_types: [0],
          },
        ],
      },
    });
  }

  async execute({ ctx }) {
    if (!ctx.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      const err = new ContainerBuilder().setAccentColor(0xED4245);
      err.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('error') || '❌'} You need **Manage Server** permission to run this command.`,
        ),
      );
      return ctx.reply({
        components: [err],
        flags: ctx.isSlash
          ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
          : MessageFlags.IsComponentsV2,
      });
    }

    const botAvatar = ctx.client.user.displayAvatarURL({ size: 128, extension: 'png' });
    let channel = null;
    let replyFn;

    if (ctx.isSlash) {
      await ctx.deferReply({ flags: MessageFlags.Ephemeral });
      channel = ctx.interaction.options.getChannel('channel');
      replyFn = (data) => ctx.editReply(data);
    } else {
      await ctx.reply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`🧾 Setting up receipt channel...`),
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });

      const mention = ctx.args[0];
      const match = mention?.match(/^<#(\d+)>$/);
      if (match) {
        const resolved = ctx.guild.channels.cache.get(match[1]);
        if (resolved && resolved.type !== ChannelType.GuildText && resolved.type !== ChannelType.GuildAnnouncement) {
          const err = new ContainerBuilder().setAccentColor(0xED4245);
          err.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${getEmoji('error') || '❌'} Please provide a **text channel** for receipts.`,
            ),
          );
          return ctx.reply({ components: [err], flags: MessageFlags.IsComponentsV2 });
        }
        channel = resolved;
      }
      replyFn = (data) => ctx.editReply(data);
    }

    if (!channel) {
      try {
        channel = await ctx.guild.channels.create({
          name: 'receipts',
          type: ChannelType.GuildText,
          topic: 'Submit your payment receipts here',
        });
      } catch {
        const err = new ContainerBuilder().setAccentColor(0xED4245);
        err.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${getEmoji('error') || '❌'} Failed to create a receipt channel. Please provide one manually or give me **Manage Channels** permission.`,
          ),
        );
        return replyFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
      }
    }

    await finishSetup(ctx.client, ctx.guild.id, ctx.guild, channel, botAvatar, replyFn);
  }
}

export default new ReceiptSetupCommand();
