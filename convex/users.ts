import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
    }
  },
});

export const getAllUsers = query({
  args: { currentClerkId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.filter((u) => u.clerkId !== args.currentClerkId);
  },
});

export const updateLastSeen = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { lastSeen: Date.now() });
    }
  },
});