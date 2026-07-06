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

// ── Log card after action (replaces log message once Received/Declined is clicked) ──

export function buildLogActionedCard({ status, imageUrl, submitterTag, submitterId, submitterAvatar, actorTag }) {
  const time = timestamp();
  const isReceived = status === 'received';

  const c = new ContainerBuilder().setAccentColor(isReceived ? 0x57F287 : 0xED4245);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      isReceived ? `## ✅ Marked as Received` : `## ❌ Marked as Declined`,
    ),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('user') || '👤'} **${submitterTag}**\n-# User ID: \`${submitterId}\``,
        ),
      )
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(submitterAvatar)),
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
      `-# ${isReceived ? 'Verified' : 'Declined'} by **${actorTag}**  ·  ${time}`,
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// ── DM/channel cards sent to the submitter after action ──────────────────────

export function buildReceivedCard({ imageUrl, submitterTag, submitterId, submitterAvatar, originalTime, actorTag }) {
  const time = timestamp();

  const c = new ContainerBuilder().setAccentColor(0x57F287); // green = success

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 💚 Payment Received & Verified!`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addSectionComponents(
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${getEmoji('success') || '✅'} **All good!** The receipt has been reviewed and the payment is confirmed on our end.\n\nThe submitter has been verified — everything checks out. ✔️`,
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
      `## 📸 Drop your screenshot!\nSend your receipt image in **any channel in this server** — just attach it to your next message.\n\n> A screenshot is **required** to complete your submission.\n\n-# You have **60 seconds** before this expires.`,
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

export function buildReceiptVerifyingCard() {
  const c = new ContainerBuilder().setAccentColor(0xFEE75C);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 🔍 Got it — verifying now!\nYour screenshot has been received and is being logged into our system.\n\n> Sit tight, this only takes a moment!\n\n-# Please don't send anything else while we process your receipt.`,
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

// ── Post receipt ──────────────────────────────────────────────────────────────

export async function postReceipt({ client, guildId, imageUrl, user, editFn, channel }) {
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

  // Post log card to admin channel with Received/Declined buttons
  const logChannel = guild.channels.cache.get(RECEIPT_LOG_CHANNEL_ID);
  if (!isSendable(logChannel)) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('error') || '❌'} **Delivery failed.** The receipt log channel isn't accessible — ask an admin to check the bot's permissions.`,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  const logCard = buildLogReceiptCard({ imageUrl: imageUrl || null, user });
  const msg = await logChannel.send(logCard).catch(() => null);
  if (!msg) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${getEmoji('error') || '❌'} **Delivery failed.** Couldn't send to the receipt log. Please try again.`,
      ),
    );
    await editFn({ components: [err], flags: MessageFlags.IsComponentsV2 });
    return;
  }

  // Persist in MongoDB (submitterChannelId lets us message the user back later)
  await client.db.createReceiptLog(msg.id, {
    guildId,
    submitterChannelId: channel?.id ?? null,
    imageUrl: imageUrl || null,
    submitterTag: user.username,
    submitterId: user.id,
    submitterAvatar: user.displayAvatarURL({ size: 256, extension: 'png' }),
  }).catch(() => {});

  // Send success publicly to the channel where the user uploaded their image
  const successCard = new ContainerBuilder().setAccentColor(0x57F287);
  successCard.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ✅ Receipt Submitted!\nYour payment receipt is now under review.\n\n-# ${getEmoji('info') || 'ℹ️'} Sit tight — you'll hear back once it's been checked.`,
    ),
  );
  const successPayload = { components: [successCard], flags: MessageFlags.IsComponentsV2 };

  if (isSendable(channel)) {
    await channel.send(successPayload).catch(() => editFn(successPayload));
  } else {
    await editFn(successPayload);
  }
}
