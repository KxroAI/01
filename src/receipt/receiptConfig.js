/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

/**
 * Tracks which guild a user is submitting a receipt to.
 * userId → guildId
 */
export const receiptPendingGuildMap = new Map();

/**
 * Tracks users who submitted the receipt modal and are being prompted
 * to upload a screenshot before the receipt is posted.
 * userId → { guildId, timeout, editFn }
 */
export const receiptPendingImageMap = new Map();

/** The admin log channel — shows receipt cards with Received/Declined buttons. */
export const RECEIPT_LOG_CHANNEL_ID = '1492164409240457446';

/** The only user ID allowed to click Received / Declined. */
export const RECEIPT_ACTION_USER_ID = '1163771452403761193';
