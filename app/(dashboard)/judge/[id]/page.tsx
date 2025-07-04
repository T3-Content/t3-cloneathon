"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SubmissionCard } from "../submission-card";
import { FinalistSubmissionCard } from "../finalist-submission-card";
import { Id } from "@/convex/_generated/dataModel";

export default function SingleSubmissionPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as Id<"submissions">;

  const submission = useQuery(
    api.submission.getSubmissionForJudging,
    submissionId ? { submissionId } : "skip"
  );

  // Also get finalist version if this is a finalist submission
  const finalistSubmission = useQuery(
    api.submission.getFinalistSubmissionForJudge,
    submissionId && submission?.score && submission.score >= 9
      ? { submissionId }
      : "skip"
  );

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

  if (!submissionId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Invalid Submission ID
          </h1>
          <p className="text-muted-foreground mb-4">
            The submission ID provided is not valid.
          </p>
          <button
            onClick={() => router.push("/judge")}
            className="text-primary hover:underline"
          >
            Back to All Submissions
          </button>
        </div>
      </div>
    );
  }

  if (submission === undefined) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (submission === null) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Submission Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            This submission doesn't exist, doesn't qualify for judging, or is
            claimed by another judge.
          </p>
          <button
            onClick={() => router.push("/judge")}
            className="text-primary hover:underline"
          >
            Back to All Submissions
          </button>
        </div>
      </div>
    );
  }

  const isFinalist = submission.score && submission.score >= 9;

  return (
    <div className="w-[80rem] max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={() =>
              router.push(isFinalist ? "/judge/finalists" : "/judge")
            }
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm mb-4"
          >
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
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            {isFinalist
              ? "Back to Finalist Judging"
              : "Back to All Submissions"}
          </button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isFinalist ? "Review Finalist Submission" : "Review Submission"}
          </h1>
          <p className="text-muted-foreground">{submission.projectName}</p>
          {isFinalist && (
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Finalist (Score: {submission.score}/10)
              </span>
            </div>
          )}
        </div>
      </div>

      {isFinalist && finalistSubmission ? (
        <FinalistSubmissionCard submission={finalistSubmission} />
      ) : (
        <SubmissionCard submission={submission} currentJudgeId={user.id} />
      )}
    </div>
  );
}
