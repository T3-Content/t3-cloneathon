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
      shared: v.optional(v.boolean()),
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
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
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

    // Remove submissions that are already reviewed
    const unreviewed = available.filter((s) => !s.reviewed);

    // Sort by whether it's claimed by current judge (claimed first), then by creation time
    const sorted = unreviewed.sort((a, b) => {
      if (a.judgeId === identity.subject && b.judgeId !== identity.subject)
        return -1;
      if (a.judgeId !== identity.subject && b.judgeId === identity.subject)
        return 1;
      return b.createdAt - a.createdAt;
    });

    // Apply pagination manually since we can't use .paginate() after filtering
    const { numItems, cursor } = args.paginationOpts;
    const startIndex = cursor ? parseInt(cursor) : 0;
    const endIndex = startIndex + numItems;
    const page = sorted.slice(startIndex, endIndex);

    const isDone = endIndex >= sorted.length;
    const continueCursor = isDone ? undefined : endIndex.toString();

    return {
      page,
      isDone,
      continueCursor,
    };
  },
});

// Get a single submission for judging by ID
export const getSubmissionForJudging = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      return null;
    }

    return submission;
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

// Get all finalist submissions (submissions with score >= 9)
export const getFinalistSubmissions = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.gte(q.field("score"), 9))
      .collect();

    return submissions;
  },
});

// Get finalist submissions for judging (excluding already judged by current user)
export const getFinalistSubmissionsForJudging = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.gte(q.field("score"), 9))
      .collect();

    // Filter out submissions already judged by current user
    const unjudged = submissions.filter((submission) => {
      if (!submission.finalistScores) return true;
      return !submission.finalistScores.some(
        (score) => score.judgeId === identity.subject
      );
    });

    // Sort by creation time (newest first)
    unjudged.sort((a, b) => b.createdAt - a.createdAt);

    return unjudged;
  },
});

// Submit a finalist score
export const submitFinalistScore = mutation({
  args: {
    submissionId: v.id("submissions"),
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
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("Submission not found");
    }

    if (!submission.score || submission.score < 9) {
      throw new Error(
        "Submission must have a score of 9 or higher to be eligible for finalist judging"
      );
    }

    // Check if this judge has already scored this submission
    const existingScores = submission.finalistScores || [];
    const existingScoreIndex = existingScores.findIndex(
      (s) => s.judgeId === identity.subject
    );

    const newScore = {
      judgeId: identity.subject,
      score: args.score,
      submittedAt: Date.now(),
    };

    let updatedScores;
    if (existingScoreIndex >= 0) {
      // Update existing score
      updatedScores = [...existingScores];
      updatedScores[existingScoreIndex] = newScore;
    } else {
      // Add new score
      updatedScores = [...existingScores, newScore];
    }

    // Calculate total score
    const totalScore = updatedScores.reduce((sum, s) => sum + s.score, 0);

    await ctx.db.patch(args.submissionId, {
      finalistScores: updatedScores,
      totalFinalistScore: totalScore,
      updatedAt: Date.now(),
    });
  },
});

// Get top 3 winners based on finalist scores
export const getTopWinnersIds = query({
  args: {},
  handler: async (ctx, args) => {
    const finalists = await ctx.db
      .query("submissions")
      .filter((q) => q.gte(q.field("score"), 9))
      .collect();

    // Sort by total finalist score (highest first)
    finalists.sort((a, b) => {
      const scoreA = a.totalFinalistScore || 0;
      const scoreB = b.totalFinalistScore || 0;
      return scoreB - scoreA; // Descending order
    });

    // Return top 3
    return finalists.slice(0, 3).map((s) => ({
      _id: s._id,
    }));
  },
});

// Get top 3 winners based on finalist scores
export const getTopWinners = query({
  args: {},
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const finalists = await ctx.db
      .query("submissions")
      .filter((q) => q.gte(q.field("score"), 9))
      .collect();

    // Sort by total finalist score (highest first)
    finalists.sort((a, b) => {
      const scoreA = a.totalFinalistScore || 0;
      const scoreB = b.totalFinalistScore || 0;
      return scoreB - scoreA; // Descending order
    });

    // Return top 3
    return finalists.slice(0, 3);
  },
});

// Get finalist submission with judge's score
export const getFinalistSubmissionForJudge = query({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAdmin(ctx);

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      return null;
    }

    if (!submission.score || submission.score < 9) {
      throw new Error(
        "Submission must have a score of 9 or higher to be eligible for finalist judging"
      );
    }

    // Find this judge's score if it exists
    const judgeScore = submission.finalistScores?.find(
      (s) => s.judgeId === identity.subject
    );

    return {
      ...submission,
      judgeScore: judgeScore?.score,
    };
  },
});

// Get shared submissions for the gallery (only submissions that are shared and submitted)
export const getSharedSubmissions = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const submissions = await ctx.db
      .query("submissions")
      .filter((q) =>
        q.and(
          q.eq(q.field("shared"), true),
          q.eq(q.field("status"), "submitted")
        )
      )
      .collect();

    // Sort by creation time (newest first)
    submissions.sort((a, b) => b.createdAt - a.createdAt);

    return submissions.map((s) => ({
      _id: s._id,
      projectName: s.projectName,
      members: s.members,
      githubUrl: s.githubUrl,
      hostedSiteUrl: s.hostedSiteUrl,
      videoOverviewUrl: s.videoOverviewUrl,
      status: s.status,
    }));
  },
});
