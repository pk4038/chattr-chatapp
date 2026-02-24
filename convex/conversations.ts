import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
  args: {
    currentClerkId: v.string(),
    otherClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .collect();

    const found = existing.find(
      (c) =>
        c.participantIds.includes(args.currentClerkId) &&
        c.participantIds.includes(args.otherClerkId)
    );

    if (found) return found._id;

    const newId = await ctx.db.insert("conversations", {
      participantIds: [args.currentClerkId, args.otherClerkId],
    });

    return newId;
  },
});

export const getConversations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    return conversations.filter((c) =>
      c.participantIds.includes(args.clerkId)
    );
  },
});

export const getConversationsWithUsers = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = conversations.filter((c) =>
      c.participantIds.includes(args.clerkId)
    );

    const result = await Promise.all(
      userConversations.map(async (conv) => {
        const otherClerkId = conv.participantIds.find((id) => id !== args.clerkId);
        const otherUser = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", otherClerkId!))
          .first();

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();

        return { conversation: conv, otherUser, lastMessage };
      })
    );

    return result;
  },
});