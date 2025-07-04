"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useCallback, useRef } from "react";

type Submission = {
  _id: Id<"submissions">;
  projectName: string;
  members: string[];
  githubUrl: string;
  hostedSiteUrl?: string;
  videoOverviewUrl?: string;
  description?: string;
  favoriteParts?: string;
  biggestChallenges?: string;
  testingInstructions?: string;
  status: "in-progress" | "submitted";
  reviewed?: boolean;
  score?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  judgeNotes?: string;
  judgeId?: string;
  createdAt: number;
  updatedAt: number;
  finalistScores?: Array<{
    judgeId: string;
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    submittedAt: number;
  }>;
  totalFinalistScore?: number;
};

interface TabContentProps {
  submissions: Submission;
}

function ProjectTabs({ submissions }: TabContentProps) {
  const [activeTab, setActiveTab] = useState<string>("description");

  const tabs = [
    {
      id: "description",
      label: "Description",
      content: submissions.description,
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "favorite",
      label: "Favorite Parts",
      content: submissions.favoriteParts,
      icon: (
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "challenges",
      label: "Challenges",
      content: submissions.biggestChallenges,
      icon: (
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: "testing",
      label: "Testing",
      content: submissions.testingInstructions,
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ].filter((tab) => tab.content); // Only show tabs that have content

  if (tabs.length === 0) return null;

  // If there's only one tab, show it without the tab interface
  if (tabs.length === 1) {
    const singleTab = tabs[0];
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-blue-500">{singleTab.icon}</div>
          <h4 className="text-sm font-medium text-foreground">
            {singleTab.label}
          </h4>
        </div>
        <div className="bg-muted/30 rounded-md p-4 border border-border/50">
          <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
            {singleTab.content}
          </p>
        </div>
      </div>
    );
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="mb-6">
      {/* Tab Headers */}
      <div className="flex border-b border-border mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
            }`}
          >
            <div
              className={
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }
            >
              {tab.icon}
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-muted/30 rounded-md p-4 border border-border/50 min-h-[120px]">
        <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
          {activeTabData.content}
        </p>
      </div>
    </div>
  );
}

interface SubmissionCardProps {
  submission: Submission;
  currentJudgeId?: string;
  showViewDetailsLink?: boolean;
}

export function SubmissionCard({
  submission,
  currentJudgeId,
  showViewDetailsLink = false,
}: SubmissionCardProps) {
  const updateJudging = useMutation(api.submission.updateSubmissionJudging);
  const unsetScore = useMutation(api.submission.unsetSubmissionScore);
  const claimSubmission = useMutation(api.submission.claimSubmission);
  const releaseSubmissionClaim = useMutation(
    api.submission.releaseSubmissionClaim
  );

  const [notes, setNotes] = useState(submission.judgeNotes || "");
  const [selectedScore, setSelectedScore] = useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null
  >(submission.score || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isClaimedByCurrentJudge = submission.judgeId === currentJudgeId;
  const isClaimedByOther = submission.judgeId && !isClaimedByCurrentJudge;

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await claimSubmission({
        submissionId: submission._id,
      });
    } catch (error) {
      console.error("Failed to claim submission:", error);
      alert(
        "Failed to claim submission. It may have been claimed by another judge."
      );
    } finally {
      setIsClaiming(false);
    }
  };

  const handleReleaseClaim = async () => {
    try {
      setIsClaiming(true);
      await releaseSubmissionClaim({
        submissionId: submission._id,
      });
    } catch (error) {
      console.error("Failed to release claim:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  const debouncedSaveNotes = useCallback(
    (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          setIsUpdating(true);
          await updateJudging({
            submissionId: submission._id,
            updates: { judgeNotes: value },
          });
        } catch (error) {
          console.error("Failed to save notes:", error);
        } finally {
          setIsUpdating(false);
        }
      }, 1000);
    },
    [submission._id, updateJudging]
  );

  const handleNotesChange = (value: string) => {
    setNotes(value);
    debouncedSaveNotes(value);
  };

  const handleScoreSelect = async (
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  ) => {
    if (selectedScore === score) {
      // Clear the score if it's already selected
      try {
        await unsetScore({
          submissionId: submission._id,
        });
        setSelectedScore(null);
      } catch (error) {
        console.error("Failed to clear score:", error);
      }
    } else {
      setSelectedScore(score);
    }
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      await updateJudging({
        submissionId: submission._id,
        updates: {
          reviewed: true,
          score: selectedScore || undefined,
        },
      });
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isYouTubeVideo = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div
      className={`bg-card rounded-lg shadow-md border border-border p-6 ${isClaimedByOther ? "opacity-60" : ""}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-foreground">
              {submission.projectName}
            </h3>
            {showViewDetailsLink && (
              <a
                href={`/judge/${submission._id}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <span>View Details</span>
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {submission.members.map((member, index) => (
                <span key={member}>
                  <a
                    href={`https://github.com/${member}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors underline"
                  >
                    {member}
                  </a>
                  {index < submission.members.length - 1 && ", "}
                </span>
              ))}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                submission.status === "submitted"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}
            >
              {submission.status}
            </span>
            {submission.reviewed && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                Reviewed
              </span>
            )}
            {submission.score && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Score: {submission.score}/10
              </span>
            )}
            {submission.score && submission.score >= 9 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                Finalist
              </span>
            )}
            {isClaimedByCurrentJudge && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                Your Claim
              </span>
            )}
            {isClaimedByOther && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                Claimed by Another Judge
              </span>
            )}
          </div>
        </div>

        {/* Project Links moved to top right */}
        <div className="flex items-center gap-4 text-sm">
          {/* Claim/Release buttons */}
          {currentJudgeId && !isClaimedByOther && (
            <div>
              {!isClaimedByCurrentJudge ? (
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isClaiming ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground"></div>
                  ) : (
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  )}
                  Claim for Review
                </button>
              ) : (
                <button
                  onClick={handleReleaseClaim}
                  disabled={isClaiming}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  {isClaiming ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-muted-foreground"></div>
                  ) : (
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
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  Release Claim
                </button>
              )}
            </div>
          )}

          <a
            href={submission.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>GitHub</span>
          </a>

          {submission.hostedSiteUrl ? (
            <a
              href={submission.hostedSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>Live Site</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground/60">
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span>No Live Site</span>
            </span>
          )}

          {submission.videoOverviewUrl ? (
            <a
              href={submission.videoOverviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Video</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground/60">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>No Video</span>
            </span>
          )}
        </div>
      </div>

      {/* Embedded Video with Max Width */}
      {submission.videoOverviewUrl &&
        isYouTubeVideo(submission.videoOverviewUrl) && (
          <div className="mb-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="aspect-video w-full">
                <iframe
                  src={getYouTubeEmbedUrl(submission.videoOverviewUrl)}
                  title="Video Overview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        )}

      {/* Tabbed Project Content */}
      <ProjectTabs submissions={submission} />

      {/* Show judging controls only if claimed by current judge or unclaimed */}
      {(!submission.judgeId || isClaimedByCurrentJudge) && (
        <>
          {/* Judge Notes */}
          <div className="mb-4">
            <label
              htmlFor={`notes-${submission._id}`}
              className="block text-sm font-medium text-foreground mb-2"
            >
              Judge Notes
              {isUpdating && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (saving...)
                </span>
              )}
            </label>
            <textarea
              id={`notes-${submission._id}`}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add your judging notes here..."
            />
          </div>

          {/* Score Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-3">
              Score (1-10)
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() =>
                    handleScoreSelect(
                      score as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                    )
                  }
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 font-medium ${
                    selectedScore === score
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background text-foreground border-border hover:border-primary hover:bg-primary/10"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Review Button */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Created: {new Date(submission.createdAt).toLocaleDateString()} |
              Updated: {new Date(submission.updatedAt).toLocaleDateString()}
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting || submission.reviewed || !selectedScore}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  submission.reviewed
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : !selectedScore
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isSubmitting
                  ? "Submitting..."
                  : submission.reviewed
                    ? "Review Submitted"
                    : "Submit Review"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
