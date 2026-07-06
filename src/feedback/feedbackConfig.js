/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getEmoji } from './emoji.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_PATH = join(__dirname, '../../data/feedback-config.json');

export function getConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

export function setConfig(data) {
  try {
    const current = getConfig();
    const merged = { ...current, ...data };
    writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
    return true;
  } catch {
    return false;
  }
}

export function getGuildConfig(guildId) {
  const cfg = getConfig();
  return cfg[guildId] ?? null;
}

export function setGuildConfig(guildId, data) {
  const cfg = getConfig();
  cfg[guildId] = { ...(cfg[guildId] ?? {}), ...data };
  return setConfig(cfg);
}

export function buildStars(rating) {
  const n = Math.min(Math.max(parseInt(rating) || 0, 0), 5);
  const filled = getEmoji('star') || '⭐';
  const empty = getEmoji('star_empty') || '☆';
  return filled.repeat(n) + (n < 5 ? empty.repeat(5 - n) : '');
}

/**
 * Tracks which guild a user is submitting feedback to.
 * Needed when the feedback panel is used from a context that may lack guild info.
 * userId → guildId
 */
export const pendingGuildMap = new Map();

/**
 * Tracks users who have submitted the feedback modal and are being prompted
 * to attach an image before the review is posted.
 * userId → { guildId, ratingNum, review, timeout, editFn }
 */
export const pendingImageMap = new Map();
