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
  MessageFlags,
} from 'discord.js';
import { getEmoji } from '../../feedback/emoji.js';

function buildPingCard(ws, rest) {
  const c = new ContainerBuilder().setAccentColor(0x5865F2);

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${getEmoji('ping')} Latency`),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${getEmoji('info')} **WebSocket Heartbeat** — \`${ws}ms\`\n${getEmoji('arrow')} **REST Round-trip** — \`${rest}ms\``,
    ),
  );

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `-# ${ws < 150 ? (getEmoji('success') + ' All systems nominal') : ws < 250 ? (getEmoji('warning') + ' Slight delay detected') : (getEmoji('error') + ' Elevated latency — keep an eye on it')}`,
    ),
  );

  return { components: [c], flags: MessageFlags.IsComponentsV2 };
}

class PingCommand extends Command {
  constructor() {
    super({
      name: 'ping',
      description: 'Check bot latency',
      usage: 'ping',
      examples: ['ping'],
      userPermissions: [],
      botPermissions: [],
      cooldown: 5,
      enabledSlash: true,
      slashData: {
        name: 'ping',
        description: 'Check bot latency',
        options: [],
      },
    });
  }

  async execute({ ctx }) {
    const ws = ctx.client.ws.ping;

    if (ctx.isSlash) {
      const t = Date.now();
      await ctx.deferReply();
      const rest = Date.now() - t;
      await ctx.editReply(buildPingCard(ws, rest));
    } else {
      const t = Date.now();
      const sent = await ctx.reply({ content: '...' });
      const rest = Date.now() - t;
      await sent.edit({ content: '', ...buildPingCard(ws, rest) });
    }
  }
}

export default new PingCommand();
