"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { FinalistSubmissionCard } from "../finalist-submission-card";

export default function FinalistsPage() {
  const finalistSubmissions = useQuery(api.submission.getFinalistSubmissions);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Finalist Judging
        </h1>
        <p className="text-muted-foreground">
          Score submissions that received a score of 9 or higher. The top 3 with
          the highest total scores will be the winners.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Each judge can submit one score per finalist. Scores are automatically
          summed to determine winners.
        </p>
      </div>

      {finalistSubmissions === undefined ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : finalistSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Finalists Yet
          </h2>
          <p className="text-muted-foreground mb-4">
            No submissions have received a score of 9 or higher yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Use the regular judging interface to review submissions. Submissions
            with scores of 9 or higher automatically become finalists.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {finalistSubmissions.map((submission) => (
            <FinalistSubmissionCard
              key={submission._id}
              submission={submission}
            />
          ))}
        </div>
      )}
    </div>
  );
}
