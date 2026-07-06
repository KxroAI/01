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
  RoleSelectMenuBuilder,
} from 'discord.js';
import { getEmoji } from '../../feedback/emoji.js';
import { config } from '#config/config';

function buildFeedbackPanel() {
  const c = new ContainerBuilder().setAccentColor(0x5865F2);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${getEmoji('review')} Feedback`),
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `Share your experience.\nEvery single review gets read — nothing goes ignored.`,
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

async function finishSetup(client, guildId, guild, channel, botAvatar, replyFn, isSlash = true) {
  await client.db.setFeedbackChannel(guildId, channel.id);
  await lockChannel(channel, guild);
  await channel.send({
    components: [buildFeedbackPanel()],
    flags: MessageFlags.IsComponentsV2,
  });

  const ok = new ContainerBuilder().setAccentColor(0x57F287);
  ok.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('success')} **Setup Complete**\n<#${channel.id}> is now the feedback channel.\nThe channel has been locked — only the bot can post there.`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(botAvatar)),
  );
  ok.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );
  ok.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${getEmoji('info')} Users can submit reviews with \`/feedback\` or \`${config.prefix}feedback\` from anywhere in the server`,
    ),
  );

  ok.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );
  ok.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎭 **Reviewer Role** *(optional)*\nRestrict who can submit reviews to a specific role. Administrators can always review regardless.`,
    ),
  );
  ok.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('reviewer_role_select')
        .setPlaceholder('Pick a role — or leave blank to allow everyone'),
    ),
  );

  // Ephemeral is set at deferReply/reply time; edits only need IsComponentsV2
  await replyFn({ components: [ok], flags: MessageFlags.IsComponentsV2 });
}

class SetupCommand extends Command {
  constructor() {
    super({
      name: 'setup',
      description: 'Configure the feedback channel for this server',
      usage: 'setup [#channel]',
      examples: ['setup', 'setup #feedback'],
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [],
      enabledSlash: true,
      slashData: {
        name: 'setup',
        description: 'Configure the feedback channel for this server',
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
          `${getEmoji('error')} You need **Manage Server** permission to run this command.`,
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
      // Slash: defer → editReply throughout
      await ctx.deferReply({ flags: MessageFlags.Ephemeral });
      channel = ctx.interaction.options.getChannel('channel');
      replyFn = (data) => ctx.editReply(data);
    } else {
      // Prefix: send a holding reply first so editReply works
      await ctx.reply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${getEmoji('setup')} Setting up feedback channel...`),
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });

      // Parse channel mention from args, e.g. <#123456>
      const mention = ctx.args[0];
      const match = mention?.match(/^<#(\d+)>$/);
      if (match) channel = ctx.guild.channels.cache.get(match[1]);
      replyFn = (data) => ctx.editReply(data);
    }

    if (!channel) {
      // Create a new #feedback channel
      try {
        channel = await ctx.guild.channels.create({
          name: 'feedback',
          type: ChannelType.GuildText,
          topic: 'Submit your feedback here',
        });
      } catch {
        const err = new ContainerBuilder().setAccentColor(0xED4245);
        err.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${getEmoji('error')} Failed to create a feedback channel. Please provide one manually or give me **Manage Channels** permission.`,
          ),
        );
        return replyFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
      }
    }

    await finishSetup(ctx.client, ctx.guild.id, ctx.guild, channel, botAvatar, replyFn, ctx.isSlash);
  }
}

export default new SetupCommand();
