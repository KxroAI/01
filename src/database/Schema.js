/**
 * Copyright (c) 2026 N
 * Code by Neroniel
 * MIT License
 */

import mongoose from "mongoose";

const guildSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prefix: {
      type: String,
      default: "b",
    },
    blacklistedUsers: [
      {
        userId: String,
        reason: String,
        blacklistedAt: { type: Date, default: Date.now },
        blacklistedBy: String,
      },
    ],
    staffRoles: [String],
    feedbackChannel: {
      type: String,
      default: null,
    },
    feedbackReviewerRole: {
      type: String,
      default: null,
    },
    receiptChannel: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  emoji: String,
  supportRoles: [String],
  ticketChannelCategory: String,
  namingFormat: {
    type: String,
    default: "ticket-{username}-{number}",
  },
  settings: {
    pingUser: { type: Boolean, default: true },
    pingRole: { type: Boolean, default: false },
    userCanClose: { type: Boolean, default: true },
    maxTicketsPerUser: { type: Number, default: 1 },
    dmUserOnOpen: { type: Boolean, default: true },
    dmUserOnClose: { type: Boolean, default: true },
    welcomeMessage: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const panelSchema = new mongoose.Schema(
  {
    panelId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    channelId: String,
    panelMessage: {
      title: { type: String, default: "Ticket Panel" },
      description: { type: String, default: "Select a category below to create a ticket" }
    },
    messageId: String,
    categories: [categorySchema],
    selectMenuConfig: {
      placeholder: {
        type: String,
        default: "Select a ticket category",
      },
      minValues: { type: Number, default: 1 },
      maxValues: { type: Number, default: 1 },
    },
    logs: {
      createChannel: String,
      closeChannel: String,
      deleteChannel: String,
      userAddChannel: String,
      userRemoveChannel: String,
      ratingChannel: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    panelId: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    channelId: String,
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },
    addedUsers: [
      {
        userId: String,
        addedBy: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    removedUsers: [
      {
        userId: String,
        removedBy: String,
        removedAt: { type: Date, default: Date.now },
      },
    ],
    controlMessageId: String,
    closedBy: String,
    closedAt: Date,
    closeReason: String,
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      feedback: String,
      ratedAt: Date,
    },
  },
  { timestamps: true }
);

panelSchema.index({ guildId: 1, isActive: 1 });
ticketSchema.index({ guildId: 1, status: 1 });
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ panelId: 1, categoryId: 1 });

const receiptLogSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    guildId: { type: String, required: true, index: true },
    imageUrl: { type: String, default: null },
    submitterTag: { type: String, required: true },
    submitterId: { type: String, required: true },
    submitterAvatar: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'received', 'declined'],
      default: 'pending',
      index: true,
    },
    actionedBy: { type: String, default: null },
    actionedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Guild = mongoose.model("Guild", guildSchema);
export const Panel = mongoose.model("Panel", panelSchema);
export const Ticket = mongoose.model("Ticket", ticketSchema);
export const ReceiptLog = mongoose.model("ReceiptLog", receiptLogSchema);

// bread end
