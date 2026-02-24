import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { timestamp: Date.now() });
    } else {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: args.userId,
        timestamp: Date.now(),
      });
    }
  },
});

export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getTyping = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return indicators.filter(
      (i) =>
        i.userId !== args.currentUserId &&
        Date.now() - i.timestamp < 3000
    );
  },
});