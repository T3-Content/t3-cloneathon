"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { FinalistSubmissionCard } from "../finalist-submission-card";

export default function FinalistsPage() {
  const { user } = useUser();

  const finalistSubmissions = useQuery(api.submission.getFinalistSubmissions);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      window.location.href = "/register";
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[80rem] max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Finalist Judging
          </h1>
          <p className="text-muted-foreground">
            Score submissions that received a score of 9 or higher. The top 3
            with the highest total scores will be the winners.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Each judge can submit one score per finalist. Scores are
            automatically summed to determine winners.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Finalists</p>
            <p className="text-2xl font-bold text-foreground">
              {finalistSubmissions?.length ?? 0}
            </p>
          </div>
          <a
            href="/judge"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            Back to Regular Judging
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </a>
        </div>
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
