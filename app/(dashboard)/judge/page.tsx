"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SubmissionCard } from "./submission-card";
import { useUser } from "@clerk/nextjs";

export default function JudgePage() {
  const { user } = useUser();

  const {
    results: submissions,
    status,
    loadMore,
  } = usePaginatedQuery(
    // @ts-expect-error - IGNORE FOR NOW
    api.submission.getSubmissionsForJudging,
    {},
    { initialNumItems: 10 }
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Regular Judging
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and evaluate qualified competition submissions. Only showing
          submissions that have video, GitHub link, and are submitted.
        </p>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions?.map((submission) => (
            <SubmissionCard
              key={submission._id}
              submission={submission}
              currentJudgeId={user?.id || ""}
              showViewDetailsLink={true}
            />
          ))}

          {submissions?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No qualified submissions available for judging.
              </p>
            </div>
          )}

          {status === "CanLoadMore" && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => loadMore(10)}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          {status === "LoadingMore" && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
