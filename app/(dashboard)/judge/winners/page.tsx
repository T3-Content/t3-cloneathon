"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";

export default function WinnersPage() {
  const { user } = useUser();

  const topWinners = useQuery(api.submission.getTopWinners);

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

  const getPositionLabel = (index: number) => {
    switch (index) {
      case 0:
        return "🥇 1st Place";
      case 1:
        return "🥈 2nd Place";
      case 2:
        return "🥉 3rd Place";
      default:
        return `${index + 1}th Place`;
    }
  };

  const getPositionColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case 1:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case 2:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="w-[80rem] max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Competition Winners
          </h1>
          <p className="text-muted-foreground">
            Top 3 winners based on finalist judging scores.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <a
            href="/judge/finalists"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            Back to Finalist Judging
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

      {topWinners === undefined ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : topWinners.length === 0 ? (
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
            No Winners Yet
          </h2>
          <p className="text-muted-foreground mb-4">
            No finalists have been scored yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Judges need to submit scores for finalist submissions to determine
            winners.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {topWinners.map((winner, index) => (
            <div
              key={winner._id}
              className="bg-card border border-border rounded-lg p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {winner.projectName}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {winner.members.map((member, memberIndex) => (
                          <span key={member}>
                            <a
                              href={`https://github.com/${member}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors underline"
                            >
                              {member}
                            </a>
                            {memberIndex < winner.members.length - 1 && ", "}
                          </span>
                        ))}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(index)}`}
                      >
                        {getPositionLabel(index)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-bold text-foreground">
                    {winner.totalFinalistScore || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Score
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {winner.finalistScores?.length || 0} judge
                    {(winner.finalistScores?.length || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Project Links */}
              <div className="flex flex-wrap gap-4 mb-6">
                <a
                  href={winner.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </a>
                {winner.hostedSiteUrl && (
                  <a
                    href={winner.hostedSiteUrl}
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
                {winner.videoOverviewUrl && (
                  <a
                    href={winner.videoOverviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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

              {/* Project Description */}
              {winner.description && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {winner.description}
                  </p>
                </div>
              )}

              {/* Individual Judge Scores */}
              {winner.finalistScores && winner.finalistScores.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Judge Scores
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {winner.finalistScores.map((score, scoreIndex) => (
                      <div
                        key={scoreIndex}
                        className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                      >
                        Judge {scoreIndex + 1}: {score.score}/10
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
