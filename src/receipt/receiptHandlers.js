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
import { getEmoji } from '../feedback/emoji.js';
import { RECEIPT_LOG_CHANNEL_ID } from './receiptConfig.js';

function timestamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function isSendable(channel) {
  return typeof channel?.send === 'function';
}

// ── Public card (configured receipt channel — no buttons) ────────────────────

export function buildPublicReceiptCard({ imageUrl, user }) {
  const avatarURL = user.displayAvatarURL({ size: 256, extension: 'png' });
  const time = timestamp();

  const c = new ContainerBuilder().setAccentColor(0x57F287);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 🧾 Payment Receipt`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Submitted by **${user.username}**  ·  \`${user.id}\`  ·  ${time}`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL)),
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

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// ── Log card (admin channel — pending state, has action buttons) ─────────────

export function buildLogReceiptCard({ imageUrl, user }) {
  const avatarURL = user.displayAvatarURL({ size: 256, extension: 'png' });
  const time = timestamp();

  const c = new ContainerBuilder().setAccentColor(0xFEE75C); // yellow = pending

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📬 Incoming Receipt`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('user') || '👤'} **${user.username}**\n-# User ID: \`${user.id}\`  ·  ${time}`,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL)),
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
        .setCustomId('receipt_received')
        .setLabel('✅  Mark as Received')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('receipt_declined')
        .setLabel('❌  Decline')
        .setStyle(ButtonStyle.Danger),
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// ── Resolved cards (after action button click) ───────────────────────────────

export function buildReceivedCard({ imageUrl, submitterTag, submitterId, submitterAvatar, originalTime, actorTag }) {
  const time = timestamp();

  const c = new ContainerBuilder().setAccentColor(0x57F287); // green = success

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ✅ Receipt Verified`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('success') || '✅'} Payment confirmed — all good.`,
        ),
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder().setURL(submitterAvatar),
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

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# Submitted by **${submitterTag}** (\`${submitterId}\`)  ·  Originally at ${originalTime}\n-# Verified by **${actorTag}**  ·  ${time}`,
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

export function buildDeclinedCard({ imageUrl, submitterTag, submitterId, submitterAvatar, originalTime, actorTag }) {
  const time = timestamp();

  const c = new ContainerBuilder().setAccentColor(0xED4245); // red = declined

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ❌ Receipt Declined`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('error') || '❌'} This receipt didn't check out.`,
        ),
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder().setURL(submitterAvatar),
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

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# Submitted by **${submitterTag}** (\`${submitterId}\`)  ·  Originally at ${originalTime}\n-# Declined by **${actorTag}**  ·  ${time}`,
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// ── Image upload prompt ───────────────────────────────────────────────────────

export function buildReceiptImagePrompt() {
  const c = new ContainerBuilder().setAccentColor(0x5865F2);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 📸 One more thing — drop your screenshot!\nYou didn't include a URL, so just send your receipt image directly in this channel.\n\n> A screenshot is **required** to submit a receipt.\n\n-# You have **60 seconds** before this times out.`,
    ),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('cancel_receipt')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// ── Post receipt ──────────────────────────────────────────────────────────────

export async function postReceipt({ client, guildId, imageUrl, user, editFn }) {
  const receiptChannelId = await client.db.getReceiptChannel(guildId);

  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('error') || '❌'} Couldn't find the server — make sure the bot is still in it.`,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  let posted = false;

  // Post public card to configured receipt channel (no buttons)
  if (receiptChannelId) {
    const receiptChannel = guild.channels.cache.get(receiptChannelId);
    if (isSendable(receiptChannel)) {
      const card = buildPublicReceiptCard({ imageUrl: imageUrl || null, user });
      await receiptChannel.send(card).then(() => { posted = true; }).catch(() => {});
    }
  }

  // Post log card to admin channel with Received/Declined buttons (guild-scoped)
  const logChannel = guild.channels.cache.get(RECEIPT_LOG_CHANNEL_ID);
  if (isSendable(logChannel)) {
    const logCard = buildLogReceiptCard({ imageUrl: imageUrl || null, user });
    const msg = await logChannel.send(logCard).catch(() => null);
    if (msg) {
      posted = true;
      // Persist receipt data in MongoDB so buttons survive bot restarts
      await client.db.createReceiptLog(msg.id, {
        guildId,
        imageUrl: imageUrl || null,
        submitterTag: user.username,
        submitterId: user.id,
        submitterAvatar: user.displayAvatarURL({ size: 256, extension: 'png' }),
      }).catch(() => {});
    }
  }

  if (!posted) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('error') || '❌'} **Delivery failed.** Your receipt couldn't be posted — ask an admin to check the bot's channel permissions or run \`/receiptsetup\` again.`,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  const c = new ContainerBuilder().setAccentColor(0x57F287);
  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ✅ Receipt Submitted!\nYour payment receipt is now under review.\n\n-# ${getEmoji('info') || 'ℹ️'} Sit tight — you'll know once it's been checked.`,
    ),
  );
  await editFn({ components: [c], flags: MessageFlags.IsComponentsV2 });
}
