import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newContent: v.string(),
    senderId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== args.senderId) {
      throw new Error("Unauthorized to edit this message");
    }
    await ctx.db.patch(args.messageId, {
      content: args.newContent,
      isEdited: true,
      editedAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== args.senderId) {
      throw new Error("Unauthorized to delete this message");
    }
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "This message was deleted",
    });
  },
});

export const markMessageAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!existing) {
      await ctx.db.insert("readReceipts", {
        messageId: args.messageId,
        userId: args.userId,
        readAt: Date.now(),
      });
    }
  },
});

export const getReadReceipts = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("readReceipts")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});