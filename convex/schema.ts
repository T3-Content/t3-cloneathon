import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  submissions: defineTable({
    projectName: v.string(),
    members: v.array(v.string()),

    githubUrl: v.string(),
    hostedSiteUrl: v.optional(v.string()),
    videoOverviewUrl: v.optional(v.string()),

    description: v.optional(v.string()),
    favoriteParts: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),

    status: v.union(v.literal("in-progress"), v.literal("submitted")),
  }),
});
