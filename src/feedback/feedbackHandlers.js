/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { getEmoji } from './emoji.js';
import { getGuildConfig, buildStars } from './feedbackConfig.js';

/**
 * Builds a rich feedback card component from a submitted review.
 */
export function buildFeedbackCard({ rating, review, imageUrl, user }) {
  const stars = buildStars(rating);
  const avatarURL = user.displayAvatarURL({ size: 256, extension: 'png' });
  const time = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const accent = rating >= 4 ? 0x57F287 : rating === 3 ? 0xFEE75C : 0xED4245;
  const c = new ContainerBuilder().setAccentColor(accent);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${getEmoji('feedback')} New Feedback Is Here`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> *"${review}"*\n\n${stars}  **${rating} / 5**`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL)),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${getEmoji('user')} **${user.username}**\n-# ${getEmoji('date')} User ID: \`${user.id}\`  ·  ${time}`,
    ),
  );

  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      c.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false),
      );
      const g = new MediaGalleryBuilder();
      g.addItems(new MediaGalleryItemBuilder().setURL(imageUrl));
      c.addMediaGalleryComponents(g);
    } catch {}
  }

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_feedback_modal')
        .setLabel('Leave a Review Too')
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

/**
 * Builds the "attach an image?" prompt shown after modal submission.
 */
export function buildImagePrompt() {
  const c = new ContainerBuilder().setAccentColor(0x5865F2);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${getEmoji('info')} **Got it!** Want to attach a screenshot to your review?\n\n**Drop an image** in this channel right now, or hit **Skip** to post without one.\n-# You have 60 seconds`,
    ),
  );
  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );
  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('skip_image')
        .setLabel('Skip — post without image')
        .setStyle(ButtonStyle.Secondary),
    ),
  );
  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

/**
 * Posts a completed feedback card to the guild's configured feedback channel.
 * Calls editFn with the result message (success or error).
 */
export async function postFeedback({ client, guildId, ratingNum, review, imageUrl, user, editFn }) {
  const guildCfg = getGuildConfig(guildId);
  if (!guildCfg?.feedbackChannel) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('warning')} Feedback channel not configured yet — ask an admin to run \`/setup\``,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('error')} Couldn't find the server — make sure the bot is still in it`,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  const channel = guild.channels.cache.get(guildCfg.feedbackChannel);
  if (!channel) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('error')} Feedback channel not found — ask an admin to re-run \`/setup\``,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  const card = buildFeedbackCard({ rating: ratingNum, review, imageUrl: imageUrl || null, user });
  await channel.send(card);

  const c = new ContainerBuilder().setAccentColor(0x57F287);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${getEmoji('success')} **Posted.** Your review is live in <#${channel.id}>\n-# ${getEmoji('heart')} Thanks for taking the time — it genuinely helps`,
    ),
  );
  await editFn({ components: [c], flags: MessageFlags.IsComponentsV2 });
}
