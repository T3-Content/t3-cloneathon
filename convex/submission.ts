import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }

  // Check if user has admin role in Clerk metadata
  const isAdmin = identity?.public_metadata?.role === "admin";
  if (!isAdmin) {
    throw new Error("Admin access required");
  }

  return identity;
}

export const updateSubmission = mutation({
  args: {
    submission: v.object({
      projectName: v.string(),
      members: v.array(v.string()),

      githubUrl: v.string(),
      hostedSiteUrl: v.optional(v.string()),
      videoOverviewUrl: v.optional(v.string()),

      description: v.optional(v.string()),
      favoriteParts: v.optional(v.string()),
      biggestChallenges: v.optional(v.string()),
      testingInstructions: v.optional(v.string()),

      status: v.union(v.literal("in-progress"), v.literal("submitted")),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const submission = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .unique();

    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.patch(submission._id, {
      ...args.submission,
      updatedAt: Date.now(),
    });
  },
});

export const getSubmission = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

export const getAllSubmissions = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filter: v.optional(
      v.object({
        status: v.optional(
          v.union(v.literal("in-progress"), v.literal("submitted"))
        ),
        reviewed: v.optional(v.boolean()),
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
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let query = ctx.db.query("submissions");

    // Apply filters sequentially
    if (args.filter?.status !== undefined) {
      query = query.filter((q) => q.eq(q.field("status"), args.filter!.status));
    }
    if (args.filter?.reviewed !== undefined) {
      query = query.filter((q) => {
        if (args.filter!.reviewed) {
          return q.eq(q.field("reviewed"), true);
        } else {
          return q.or(
            q.eq(q.field("reviewed"), false),
            q.eq(q.field("reviewed"), undefined)
          );
        }
      });
    }
    if (args.filter?.score !== undefined) {
      query = query.filter((q) => q.gte(q.field("score"), args.filter!.score!));
    }

    // Apply pagination
    return await query.paginate(args.paginationOpts);
  },
});

export const updateSubmissionJudging = mutation({
  args: {
    submissionId: v.id("submissions"),
    updates: v.object({
      reviewed: v.optional(v.boolean()),
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
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.patch(args.submissionId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const unsetSubmissionScore = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.patch(args.submissionId, {
      score: undefined,
      updatedAt: Date.now(),
    });

    return null;
  },
});

export const getSubmissionCounts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const submitted = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("status"), "submitted"))
      .collect();

    const submittedCount = submitted.length;
    const reviewedCount = submitted.filter((s) => s.reviewed).length;

    return {
      reviewed: reviewedCount,
      submitted: submittedCount,
    };
  },
});

// New function to get qualified submissions count (for judge page)
export const getQualifiedSubmissionCounts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const submitted = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("status"), "submitted"))
      .collect();

    // Filter for qualified submissions (has video, github, and is submitted)
    const qualified = submitted.filter(
      (s) => s.videoOverviewUrl && s.githubUrl && s.status === "submitted"
    );

    const qualifiedCount = qualified.length;
    const reviewedCount = qualified.filter((s) => s.reviewed).length;

    return {
      reviewed: reviewedCount,
      submitted: qualifiedCount,
    };
  },
});

// Get submissions for judging (qualified, unclaimed or claimed by current judge)
export const getSubmissionsForJudging = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAdmin(ctx);

    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("status"), "submitted"))
      .collect();

    // Filter for qualified submissions
    const qualified = submissions.filter(
      (s) => s.videoOverviewUrl && s.githubUrl
    );

    // Filter for unclaimed or claimed by current judge
    const available = qualified.filter(
      (s) => !s.judgeId || s.judgeId === identity.subject
    );

    // Sort by whether it's claimed by current judge (claimed first), then by creation time
    return available.sort((a, b) => {
      if (a.judgeId === identity.subject && b.judgeId !== identity.subject)
        return -1;
      if (a.judgeId !== identity.subject && b.judgeId === identity.subject)
        return 1;
      return b.createdAt - a.createdAt;
    });
  },
});

// Claim a submission for judging
export const claimSubmission = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Check if already claimed by someone else
    if (submission.judgeId && submission.judgeId !== identity.subject) {
      throw new Error("Submission already claimed by another judge");
    }

    await ctx.db.patch(args.submissionId, {
      judgeId: identity.subject,
      updatedAt: Date.now(),
    });
  },
});

// Release a claim on a submission
export const releaseSubmissionClaim = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    // Only the judge who claimed it can release it
    if (submission.judgeId !== identity.subject) {
      throw new Error("You can only release your own claims");
    }

    await ctx.db.patch(args.submissionId, {
      judgeId: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Get all submissions with sorting (for the all submissions page)
export const getAllSubmissionsWithSort = query({
  args: {
    sortBy: v.optional(
      v.union(
        v.literal("createdAt"),
        v.literal("score"),
        v.literal("projectName"),
        v.literal("status")
      )
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    filter: v.optional(
      v.object({
        status: v.optional(
          v.union(v.literal("in-progress"), v.literal("submitted"))
        ),
        reviewed: v.optional(v.boolean()),
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
        hasVideo: v.optional(v.boolean()),
        hasGithub: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let submissions = await ctx.db.query("submissions").collect();

    // Apply filters
    if (args.filter) {
      if (args.filter.status !== undefined) {
        submissions = submissions.filter(
          (s) => s.status === args.filter!.status
        );
      }
      if (args.filter.reviewed !== undefined) {
        submissions = submissions.filter((s) =>
          args.filter!.reviewed ? s.reviewed === true : !s.reviewed
        );
      }
      if (args.filter.score !== undefined) {
        submissions = submissions.filter(
          (s) => s.score !== undefined && s.score >= args.filter!.score!
        );
      }
      if (args.filter.hasVideo !== undefined) {
        submissions = submissions.filter((s) =>
          args.filter!.hasVideo ? !!s.videoOverviewUrl : !s.videoOverviewUrl
        );
      }
      if (args.filter.hasGithub !== undefined) {
        submissions = submissions.filter((s) =>
          args.filter!.hasGithub ? !!s.githubUrl : !s.githubUrl
        );
      }
    }

    // Apply sorting
    const sortBy = args.sortBy || "createdAt";
    const sortOrder = args.sortOrder || "desc";

    submissions.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "score":
          // Handle undefined scores by treating them as 0
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          compareValue = scoreA - scoreB;
          break;
        case "projectName":
          compareValue = a.projectName.localeCompare(b.projectName);
          break;
        case "status":
          compareValue = a.status.localeCompare(b.status);
          break;
        case "createdAt":
        default:
          compareValue = a.createdAt - b.createdAt;
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return submissions;
  },
});
