/**
 * Copyright (c) 2025 openUwU
 * Code by bre4d777
 * MIT License
 */

import { logger } from "#utils/logger";
import TicketUI from "#structures/classes/TicketUI";

export default {
  name: "ticketClosed",

  async execute({ eventArgs, client }) {
    const { ticketId, guildId, userId, closedBy, reason, channelId } = eventArgs[0];

    try {
      const guild = await client.guilds.fetch(guildId).catch(() => null);
      if (!guild) {
        logger.error("TicketClose", `Guild ${guildId} not found`);
        return;
      }

      const channel = await guild.channels.fetch(channelId).catch(() => null);
      if (!channel) {
        logger.error("TicketClose", `Channel ${channelId} not found`);
        return;
      }

      const ticket = await client.db.getTicket(ticketId);
      if (!ticket) {
        logger.error("TicketClose", `Ticket ${ticketId} not found`);
        return;
      }

      const panel = await client.db.getPanel(ticket.panelId);
      if (!panel) {
        logger.error("TicketClose", `Panel ${ticket.panelId} not found`);
        return;
      }

      const category = panel.categories.find(c => c.categoryId === ticket.categoryId);
      if (!category) {
        logger.error("TicketClose", `Category ${ticket.categoryId} not found`);
        return;
      }

      const controlMsgId = await client.db.getControlMessage(ticketId);
      if (controlMsgId) {
        const controlMsg = await channel.messages.fetch(controlMsgId).catch(() => null);
        if (controlMsg) {
          const closedContent = `## ${category.name}\n\n**Status:** Closed\n**Closed By:** <@${closedBy}>${reason ? `\n**Reason:** ${reason}` : ""}`;

          const container = TicketUI.buildTicketPanel(ticket, category, []);
          await controlMsg.edit({ 
            components: [container],
            flags: TicketUI.getFlags()
          });
        }
      }

      await channel.send({ 
        components: [TicketUI.buildRatingRequest(ticketId, userId)],
        flags: TicketUI.getFlags()
      });
      const discordUser = await client.users.fetch(userId).catch(() => null);
      await channel.permissionOverwrites.edit(discordUser, {
        SendMessages: false,
      }).catch(() => {});
      const addedUsers = await client.db.getAddedUsers(ticketId);
      for (const addedUser of addedUsers) {
        try {
          const user = await client.users.fetch(addedUser.userId)
          await channel.permissionOverwrites.edit(user, {
            SendMessages: false,
          });
        } catch (error) {
          logger.error("TicketClose", `Failed to remove permissions for user ${addedUser.userId}`, error);
        }
      }

      if (category.settings?.dmUserOnClose) {
        try {
          const user = await client.users.fetch(userId);
          await user.send(
            `Your ticket in **${guild.name}** has been closed.${reason ? `\nReason: ${reason}` : ""}`
          );
        } catch (e) {
          logger.debug("TicketClose", `Could not DM user ${userId}`);
        }
      }

      if (panel.logs?.closeChannel) {
        const logChannel = await guild.channels.fetch(panel.logs.closeChannel).catch(() => null);
        if (logChannel?.isTextBased()) {
          await logChannel.send({
            components: [TicketUI.buildLogEmbed("Ticket Closed", {
              User: `<@${userId}>`,
              "Closed By": `<@${closedBy}>`,
              Channel: `<#${channelId}>`,
              "Ticket ID": ticketId,
              ...(reason && { Reason: reason }),
            })],
            flags: TicketUI.getFlags(),
            allowedMentions: { parse: [] }
          });
        }
      }

      logger.info("TicketClose", `Ticket ${ticketId} closed by ${closedBy}`);
    } catch (error) {
      logger.error("TicketClose", `Failed to close ticket ${ticketId}`, error);
    }
  },
};
// kneaded logic
