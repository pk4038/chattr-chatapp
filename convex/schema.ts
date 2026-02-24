import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    lastSeen: v.optional(v.number()),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participantIds: v.array(v.string()),
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    timestamp: v.optional(v.number()),
  }).index("by_conversationId", ["conversationId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    timestamp: v.number(),
  }).index("by_conversationId", ["conversationId"]),
});