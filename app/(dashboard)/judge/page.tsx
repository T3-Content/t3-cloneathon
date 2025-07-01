"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SubmissionCard } from "./submission-card";

export default function JudgePage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const specificSubmissionId = searchParams.get("id");

  const submissionCounts = useQuery(
    api.submission.getQualifiedSubmissionCounts
  );
  const submissions = useQuery(api.submission.getSubmissionsForJudging);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  // If a specific submission ID is provided, filter to just that submission
  const displaySubmissions = specificSubmissionId
    ? submissions?.filter((s) => s._id === specificSubmissionId)
    : submissions;

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
            Submission Judging
          </h1>
          <p className="text-muted-foreground">
            Review and evaluate qualified competition submissions.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Only showing submissions that have video, GitHub link, and are
            submitted.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Reviewed</p>
            <p className="text-2xl font-bold text-foreground">
              {submissionCounts?.reviewed ?? "-"}/
              {submissionCounts?.submitted ?? "-"}
            </p>
          </div>
          <a
            href="/judge/all-submissions"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            View All Submissions
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>

      {!displaySubmissions ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {displaySubmissions?.map((submission) => (
            <SubmissionCard
              key={submission._id}
              submission={submission}
              currentJudgeId={user.id}
            />
          ))}

          {displaySubmissions?.length === 0 && specificSubmissionId && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                This submission doesn't exist or doesn't qualify for judging.
              </p>
              <a href="/judge" className="text-primary hover:underline">
                Back to all qualified submissions
              </a>
            </div>
          )}

          {displaySubmissions?.length === 0 && !specificSubmissionId && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No qualified submissions available for judging.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
