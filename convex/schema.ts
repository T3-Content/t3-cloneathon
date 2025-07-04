import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    projectName: v.string(),
    members: v.array(v.string()),

    userId: v.string(), // Subject from Clerk

    githubUrl: v.string(),
    hostedSiteUrl: v.optional(v.string()),
    videoOverviewUrl: v.optional(v.string()),

    description: v.optional(v.string()),
    favoriteParts: v.optional(v.string()),
    biggestChallenges: v.optional(v.string()),
    testingInstructions: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),

    status: v.union(v.literal("in-progress"), v.literal("submitted")),

    // Admin judging fields
    reviewed: v.optional(v.boolean()),
    judgeId: v.optional(v.string()), // ID of the judge who claimed this submission
    score: v.optional(
      v.union(
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5),
        v.literal(6),
        v.literal(7),
        v.literal(8),
        v.literal(9),
        v.literal(10)
      )
    ),
    judgeNotes: v.optional(v.string()),

    // Finalist judging fields
    finalistScores: v.optional(
      v.array(
        v.object({
          judgeId: v.string(),
          score: v.union(
            v.literal(1),
            v.literal(2),
            v.literal(3),
            v.literal(4),
            v.literal(5),
            v.literal(6),
            v.literal(7),
            v.literal(8),
            v.literal(9),
            v.literal(10)
          ),
          submittedAt: v.number(),
        })
      )
    ),
    totalFinalistScore: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});
