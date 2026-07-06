/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

/**
 * Tracks users who clicked Submit Receipt and are being prompted
 * to upload a screenshot before the receipt is posted.
 * userId → { guildId, timeout, editFn }
 */
export const receiptPendingImageMap = new Map();

/** The admin log channel — shows receipt cards with Received/Declined buttons. */
export const RECEIPT_LOG_CHANNEL_ID = '1523511409441243196';

/** The only user ID allowed to click Received / Declined. */
export const RECEIPT_ACTION_USER_ID = '1163771452403761193';
