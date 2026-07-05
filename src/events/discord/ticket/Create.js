/**
 * Copyright (c) 2025 openUwU
 * Code by bre4d777
 * MIT License
 */

import { ChannelType, PermissionFlagsBits } from "discord.js";
import { logger } from "#utils/logger";
import TicketUI from "#structures/classes/TicketUI";

export default {
  name: "ticketCreated",

  async execute({ eventArgs, client }) {
    const { ticketId, guildId, panelId, categoryId, userId } = eventArgs[0];

    try {
      const isBlacklisted = await client.db.isUserBlacklisted(guildId, userId);
      if (isBlacklisted) {
        logger.warn("TicketCreate", `Blacklisted user ${userId} attempted to create ticket`);
        return;
      }

      const guild = await client.guilds.fetch(guildId).catch(() => null);
      if (!guild) {
        logger.error("TicketCreate", `Guild ${guildId} not found`);
        return;
      }

      const panel = await client.db.getPanel(panelId);
      if (!panel) {
        logger.error("TicketCreate", `Panel ${panelId} not found`);
        return;
      }

      const category = panel.categories.find(c => c.categoryId === categoryId);
      if (!category) {
        logger.error("TicketCreate", `Category ${categoryId} not found`);
        return;
      }

      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) {
        logger.error("TicketCreate", `User ${userId} not found`);
        return;
      }

      const userTickets = await client.db.getUserCategoryOpenTickets(guildId, userId, categoryId);
      const ticketNumber = userTickets.length;

      const channelName = category.namingFormat
        .replace("{username}", user.username.toLowerCase().replace(/[^a-z0-9]/g, ""))
        .replace("{number}", ticketNumber.toString().padStart(3, '0'));

      const permissionOverwrites = [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: userId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
          ],
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
          ],
        },
      ];

      for (const roleId of category.supportRoles || []) {
        const role = await guild.roles.fetch(roleId).catch(() => null);
        if (role) {
          permissionOverwrites.push({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
            ],
          });
        }
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.ticketChannelCategory || null,
        permissionOverwrites,
        topic: `Ticket #${ticketId} | User: ${user.tag}`,
      });

      await client.db.setTicketChannel(ticketId, channel.id);

      let pingContent = "";
      if (category.settings.pingUser) pingContent += `<@${userId}> `;
      if (category.settings.pingRole && category.supportRoles?.length > 0) {
        pingContent += category.supportRoles.map(r => `<@&${r}>`).join(" ");
      }

      if (pingContent) {
        await channel.send({ content: pingContent });
      }

      const ticket = await client.db.getTicket(ticketId);
      const controlMsg = await channel.send({ 
        components: [TicketUI.buildTicketPanel(ticket, category, [])],
        flags: TicketUI.getFlags()
      });

      await controlMsg.pin().catch(() => {});
      await client.db.setTicketControlMessage(ticketId, controlMsg.id);

      if (category.settings.dmUserOnOpen) {
        try {
          await user.send(`Your ticket has been created in **${guild.name}**: <#${channel.id}>`);
        } catch (e) {
          logger.debug("TicketCreate", `Could not DM user ${userId}`);
        }
      }

      if (panel.logs?.createChannel) {
        const logChannel = await guild.channels.fetch(panel.logs.createChannel).catch(() => null);
        if (logChannel?.isTextBased()) {
          await logChannel.send({
            components: [TicketUI.buildLogEmbed("Ticket Created", {
              User: `<@${userId}>`,
              Category: category.name,
              Channel: `<#${channel.id}>`,
              "Ticket ID": ticketId,
            })],
            flags: TicketUI.getFlags(),
            allowedMentions: { parse: [] }
          });
        }
      }

      logger.info("TicketCreate", `Ticket ${ticketId} created in ${channel.id}`);
    } catch (error) {
      logger.error("TicketCreate", `Failed to create ticket ${ticketId}`, error);
    }
  },
};
// silent bread
