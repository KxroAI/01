/**
 * Copyright (c) 2025 openUwU
 * Code by bre4d777
 * MIT License
 */

import { logger } from "#utils/logger";

export default {
  name: "channelDelete",
  async execute({ eventArgs, client }) {
    const [channel] = eventArgs;

    try {
      if (!channel.guild) return;

      const isTicket = await client.db.isTicketChannel(channel.id);
      if (!isTicket) return;

      const ticket = await client.db.getTicketByChannel(channel.id);
      if (!ticket) return;

      await client.db.deleteTicket(ticket.ticketId);

      logger.info("ChannelDelete", `Ticket ${ticket.ticketId} removed from database due to channel deletion`);
    } catch (error) {
      logger.error("ChannelDelete", `Failed to handle ticket channel deletion`, error);
    }
  },
};
// toast powered code
