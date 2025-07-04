"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

type FinalistSubmission = {
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
  judgeScore?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
};

interface FinalistSubmissionCardProps {
  submission: FinalistSubmission;
}

export function FinalistSubmissionCard({
  submission,
}: FinalistSubmissionCardProps) {
  const submitFinalistScore = useMutation(api.submission.submitFinalistScore);
  const [selectedScore, setSelectedScore] = useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | null
  >(submission.judgeScore || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreSelect = async (
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  ) => {
    try {
      setIsSubmitting(true);
      await submitFinalistScore({
        submissionId: submission._id,
        score,
      });
      setSelectedScore(score);
    } catch (error) {
      console.error("Failed to submit score:", error);
      alert("Failed to submit score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isYouTubeVideo = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.includes("youtube.com/watch?v=")
      ? url.split("v=")[1]?.split("&")[0]
      : url.includes("youtu.be/")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getScoreCount = () => {
    return submission.finalistScores?.length || 0;
  };

  const getAverageScore = () => {
    if (!submission.finalistScores || submission.finalistScores.length === 0) {
      return 0;
    }
    const total = submission.finalistScores.reduce(
      (sum, s) => sum + s.score,
      0
    );
    return (total / submission.finalistScores.length).toFixed(1);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {submission.projectName}
          </h2>
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
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              Finalist
            </span>
          </div>
        </div>

        {/* Finalist Score Summary */}
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            {submission.totalFinalistScore || 0}
          </div>
          <div className="text-sm text-muted-foreground">Total Score</div>
          <div className="text-sm text-muted-foreground">
            {getScoreCount()} judge{getScoreCount() !== 1 ? "s" : ""} • Avg:{" "}
            {getAverageScore()}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href={submission.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </a>
        {submission.hostedSiteUrl && (
          <a
            href={submission.hostedSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
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
            Live Site
          </a>
        )}
        {submission.videoOverviewUrl && (
          <a
            href={submission.videoOverviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Video Overview
          </a>
        )}
      </div>

      {/* Video Embed */}
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

      {/* Project Description */}
      {submission.judgeNotes && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Judge Notes
          </h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {submission.judgeNotes}
          </p>
        </div>
      )}

      {/* Finalist Score Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Your Finalist Score (1-10)
          {isSubmitting && (
            <span className="ml-2 text-sm text-muted-foreground">
              (saving...)
            </span>
          )}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <button
              key={score}
              onClick={() =>
                handleScoreSelect(
                  score as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                )
              }
              disabled={isSubmitting}
              className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 font-medium ${
                selectedScore === score
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-background text-foreground border-border hover:border-primary hover:bg-primary/10"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {score}
            </button>
          ))}
        </div>
        {selectedScore && (
          <p className="text-sm text-muted-foreground mt-2">
            Your score: {selectedScore}/10
          </p>
        )}
      </div>

      {/* Finalist Scores Summary */}
      {submission.finalistScores && submission.finalistScores.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            All Judge Scores
          </h3>
          <div className="flex flex-wrap gap-2">
            {submission.finalistScores.map((score, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
              >
                Judge {index + 1}: {score.score}/10
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-muted-foreground">
        Created: {new Date(submission.createdAt).toLocaleDateString()} |
        Updated: {new Date(submission.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
