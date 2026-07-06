/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import {
  InteractionType,
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { config } from "#config/config";
import { logger } from "#utils/logger";
import { validateCommand } from "#utils/permissionHandler";
import { CommandContext } from "#classes/context";
import { pendingGuildMap, pendingImageMap } from "../../../feedback/feedbackConfig.js";
import { buildImagePrompt, postFeedback } from "../../../feedback/feedbackHandlers.js";


async function _sendError(interaction, title, description, ephemeral = true) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**${title}**`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(description),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setLabel("Support")
            .setURL(config.links.supportServer)
            .setStyle(ButtonStyle.Link),
        ),
    );

  try {
    const flags = ephemeral
      ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      : MessageFlags.IsComponentsV2;
    const reply = { components: [container], flags };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  } catch (error) {
    logger.error("InteractionCreate", "Failed to send error reply.", error);
  }
}

function _getCommandFile(interaction, client) {
  const { commandName } = interaction;
  const subCommandGroup = interaction.options.getSubcommandGroup(false);
  const subCommandName = interaction.options.getSubcommand(false);

  if (subCommandGroup && subCommandName) {
    const fullKey = [commandName, subCommandGroup, subCommandName].join(":");
    const groupKey = [commandName, subCommandGroup].join(":");
    return (
      client.commandHandler.slashCommandFiles.get(fullKey) ||
      client.commandHandler.slashCommandFiles.get(groupKey) ||
      client.commandHandler.slashCommandFiles.get(commandName)
    );
  }

  if (subCommandName) {
    const key = [commandName, subCommandName].join(":");
    return (
      client.commandHandler.slashCommandFiles.get(key) ||
      client.commandHandler.slashCommandFiles.get(commandName)
    );
  }

  return client.commandHandler.slashCommandFiles.get(commandName);
}


async function _handleCooldown(interaction, command, client) {
  if (!command.cooldown) return { valid: true };

  const cooldown = client.commandHandler.isOnCooldown(
    command,
    interaction.user.id,
    interaction.guild.id,
  );

  if (cooldown) {
    const timestamp = Math.floor((Date.now() + cooldown) / 1000);
    return {
      valid: false,
      error: {
        title: "Cooldown",
        description: `This command is on cooldown. Please wait <t:${timestamp}:R>.\nPremium users and servers get half cooldowns.`,
      },
    };
  }

  await client.commandHandler.setCooldown(
    command,
    interaction.user.id,
    interaction.guild.id,
  );
  return { valid: true };
}

async function handleChatInputCommand(interaction, client) {
  if (!interaction.inGuild()) {
    return _sendError(
      interaction,
      "Server Only",
      "Commands can only be used in a server.",
    );
  }


  const commandToExecute = _getCommandFile(interaction, client);
  if (!commandToExecute) {
    logger.warn(
      "InteractionCreate",
      `No command file found for interaction: /${interaction.commandName}`,
    );
    return _sendError(
      interaction,
      "Command Error",
      "This command seems to be outdated or improperly configured.",
    );
  }

  

  const cooldownValidation = await _handleCooldown(
    interaction,
    commandToExecute,
    client,
  );
  if (!cooldownValidation.valid) {
    return _sendError(
      interaction,
      cooldownValidation.error.title,
      cooldownValidation.error.description,
    );
  }

  try {
    const ctx = new CommandContext({ client, interaction });
    const permissionValidation = await validateCommand(ctx, commandToExecute);

    if (!permissionValidation.valid) {
      return _sendError(
        interaction,
        permissionValidation.error.title,
        permissionValidation.error.description,
      );
    }

    await commandToExecute.execute({ ctx });
  } catch (error) {
    logger.error(
      "InteractionCreate",
      `Error executing slash command '${commandToExecute.slashData.name}'`,
      error,
    );
    await _sendError(
      interaction,
      "Command Error",
      "An unexpected error occurred while running the command.",
    );
  }
}

async function handleAutocomplete(interaction, client) {
  const commandToExecute = _getCommandFile(interaction, client);
  if (!commandToExecute || !commandToExecute.autocomplete) return;

  try {
    await commandToExecute.autocomplete({ interaction, client });
  } catch (error) {
    logger.error(
      "InteractionCreate",
      `Error handling autocomplete for '${interaction.commandName}'`,
      error,
    );
  }
}

// ── Feedback: button & modal handlers ────────────────────────────────────────

async function handleFeedbackButton(interaction, client) {
  // ── Reviewer-role select menu ─────────────────────────────────────────────
  if (interaction.customId === "reviewer_role_select") {
    const roleId = interaction.values?.[0];
    if (!roleId) return;
    await client.db.setFeedbackReviewerRole(interaction.guildId, roleId);

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `✅ **Role saved.** Only members with <@&${roleId}> (and administrators) can now submit reviews.`,
      ),
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    );
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("remove_reviewer_role")
          .setLabel("Remove restriction")
          .setStyle(ButtonStyle.Danger),
      ),
    );
    return interaction.update({ components: [c], flags: MessageFlags.IsComponentsV2 });
  }

  // ── Remove reviewer-role restriction ──────────────────────────────────────
  if (interaction.customId === "remove_reviewer_role") {
    await client.db.setFeedbackReviewerRole(interaction.guildId, null);

    const c = new ContainerBuilder().setAccentColor(0x57F287);
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `✅ **Restriction removed.** Everyone can now submit reviews.`,
      ),
    );
    return interaction.update({ components: [c], flags: MessageFlags.IsComponentsV2 });
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (interaction.customId === "open_feedback_modal") {
    // ── Reviewer-role permission gate ─────────────────────────────────────
    if (interaction.guildId) {
      const reviewerRoleId = await client.db.getFeedbackReviewerRole(interaction.guildId);
      if (reviewerRoleId) {
        const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
        const hasRole = interaction.member?.roles?.cache?.has(reviewerRoleId);
        if (!isAdmin && !hasRole) {
          const c = new ContainerBuilder().setAccentColor(0xED4245);
          c.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `⚠️ Only members with <@&${reviewerRoleId}> can submit a review here.`,
            ),
          );
          return interaction.reply({
            components: [c],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    // Track which guild this feedback targets
    if (interaction.guildId) {
      pendingGuildMap.set(interaction.user.id, interaction.guildId);
    }

    const modal = new ModalBuilder()
      .setCustomId("feedback_modal")
      .setTitle("Submit Your Feedback");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("rating")
          .setLabel("Rating (1–5)")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("Enter a number from 1 to 5")
          .setMinLength(1)
          .setMaxLength(1)
          .setRequired(true),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("review")
          .setLabel("Your Review")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Share your experience...")
          .setMinLength(10)
          .setMaxLength(1000)
          .setRequired(true),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("imageUrl")
          .setLabel("Screenshot URL (optional)")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("https://...")
          .setRequired(false),
      ),
    );

    await interaction.showModal(modal);
    return;
  }

  if (interaction.customId === "skip_image") {
    const pending = pendingImageMap.get(interaction.user.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    pendingImageMap.delete(interaction.user.id);

    await interaction.deferUpdate();
    await postFeedback({
      client,
      guildId: pending.guildId,
      ratingNum: pending.ratingNum,
      review: pending.review,
      imageUrl: null,
      user: interaction.user,
      editFn: (data) => interaction.editReply(data),
    });
  }
}

async function handleFeedbackModal(interaction, client) {
  if (interaction.customId !== "feedback_modal") return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const ratingStr = interaction.fields.getTextInputValue("rating").trim();
  const review    = interaction.fields.getTextInputValue("review").trim();
  const imageUrl  = interaction.fields.getTextInputValue("imageUrl")?.trim() ?? "";

  const ratingNum = parseInt(ratingStr, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "⚠️ Invalid rating — please enter a number between **1** and **5**.",
      ),
    );
    return interaction.editReply({ components: [err], flags: MessageFlags.IsComponentsV2 });
  }

  const guildId = interaction.guildId ?? pendingGuildMap.get(interaction.user.id);
  // Consumed — remove so the map doesn't grow unboundedly
  pendingGuildMap.delete(interaction.user.id);
  if (!guildId) {
    const err = new ContainerBuilder().setAccentColor(0xED4245);
    err.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "⚠️ Could not determine which server to post your review to. Please use `/feedback` inside the server.",
      ),
    );
    return interaction.editReply({ components: [err], flags: MessageFlags.IsComponentsV2 });
  }

  // If a URL was supplied, post immediately
  if (imageUrl && imageUrl.startsWith("http")) {
    await postFeedback({
      client,
      guildId,
      ratingNum,
      review,
      imageUrl,
      user: interaction.user,
      editFn: (data) => interaction.editReply(data),
    });
    return;
  }

  // Otherwise prompt the user to drop an image (60 s window)
  const timeoutId = setTimeout(async () => {
    if (!pendingImageMap.has(interaction.user.id)) return;
    pendingImageMap.delete(interaction.user.id);
    const expired = new ContainerBuilder().setAccentColor(0xED4245);
    expired.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "⚠️ Image upload timed out — your review was **not** posted. Run `/feedback` to try again.",
      ),
    );
    await interaction.editReply({ components: [expired], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
  }, 60_000);

  pendingImageMap.set(interaction.user.id, {
    guildId,
    ratingNum,
    review,
    timeout: timeoutId,
    editFn: (data) => interaction.editReply(data),
  });

  await interaction.editReply(buildImagePrompt());
}

// ─────────────────────────────────────────────────────────────────────────────

export default {
  name: "interactionCreate",
  async execute({ eventArgs, client }) {
    const [interaction] = eventArgs;

    if (interaction.type === InteractionType.ApplicationCommand) {
      await handleChatInputCommand(interaction, client);
    } else if (
      interaction.type === InteractionType.ApplicationCommandAutocomplete
    ) {
      await handleAutocomplete(interaction, client);
    } else if (interaction.type === InteractionType.MessageComponent) {
      try {
        await handleFeedbackButton(interaction, client);
      } catch (error) {
        logger.error("InteractionCreate", "Error in feedback button handler", error);
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      try {
        await handleFeedbackModal(interaction, client);
      } catch (error) {
        logger.error("InteractionCreate", "Error in feedback modal handler", error);
      }
    }
  },
};

// bread sync
