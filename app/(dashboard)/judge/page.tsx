"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { SubmissionCard } from "./submission-card";
import { FinalistSubmissionCard } from "./finalist-submission-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubmissionFilters } from "./submission-filters";

export default function JudgePage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("judging");

  // All submissions state
  const [filters, setFilters] = useState({
    status: undefined as "in-progress" | "submitted" | undefined,
    reviewed: undefined as boolean | undefined,
    score: undefined as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | undefined,
    hasVideo: undefined as boolean | undefined,
    hasGithub: undefined as boolean | undefined,
  });
  const [sortBy, setSortBy] = useState<
    "createdAt" | "score" | "projectName" | "status"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const submissionCounts = useQuery(
    api.submission.getQualifiedSubmissionCounts
  );

  const finalistSubmissions = useQuery(api.submission.getFinalistSubmissions);
  const topWinners = useQuery(api.submission.getTopWinners);

  // All submissions query
  const allSubmissions = useQuery(api.submission.getAllSubmissionsWithSort, {
    filter: filters,
    sortBy,
    sortOrder,
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Submission Judging
        </h1>
        <p className="text-muted-foreground">
          Review and evaluate competition submissions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="judging" className="flex items-center gap-2">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Regular Judging
            {submissionCounts && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {submissionCounts.reviewed}/{submissionCounts.submitted}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="finalists" className="flex items-center gap-2">
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            Finalist Judging
            {finalistSubmissions && (
              <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">
                {finalistSubmissions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="winners" className="flex items-center gap-2">
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
            Winners
            {topWinners && topWinners.length > 0 && (
              <span className="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                {topWinners.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="all-submissions"
            className="flex items-center gap-2"
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            All Submissions
            {allSubmissions && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                {allSubmissions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Regular Judging Tab */}
        <TabsContent value="judging" className="mt-6">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Review and evaluate qualified competition submissions. Only
              showing submissions that have video, GitHub link, and are
              submitted.
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
                  currentJudgeId={user.id}
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
        </TabsContent>

        {/* Finalist Judging Tab */}
        <TabsContent value="finalists" className="mt-6">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Score submissions that received a score of 9 or higher. The top 3
              with the highest total scores will be the winners.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Each judge can submit one score per finalist. Scores are
              automatically summed to determine winners.
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
                Use the regular judging interface to review submissions.
                Submissions with scores of 9 or higher automatically become
                finalists.
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
        </TabsContent>

        {/* Winners Tab */}
        <TabsContent value="winners" className="mt-6">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Top 3 winners based on finalist judging scores.
            </p>
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
                Judges need to submit scores for finalist submissions to
                determine winners.
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
                                {memberIndex < winner.members.length - 1 &&
                                  ", "}
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
                  {winner.finalistScores &&
                    winner.finalistScores.length > 0 && (
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
        </TabsContent>

        {/* All Submissions Tab */}
        <TabsContent value="all-submissions" className="mt-6">
          <div className="mb-6">
            <p className="text-muted-foreground">
              View and manage all competition submissions.
            </p>
          </div>

          <SubmissionFilters
            filters={filters}
            onFiltersChange={setFilters}
            showAdditionalFilters
          />

          {/* Sorting Controls */}
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="createdAt">Created Date</option>
              <option value="score">Score</option>
              <option value="projectName">Project Name</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {sortOrder === "asc" ? (
                <>
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
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Ascending
                </>
              ) : (
                <>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Descending
                </>
              )}
            </button>
          </div>

          {!allSubmissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Links
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Judge
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allSubmissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {submission.projectName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {submission.members.join(", ")}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === "submitted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {submission.status}
                        </span>
                        {submission.reviewed && (
                          <span className="ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            Reviewed
                          </span>
                        )}
                        {submission.score && submission.score >= 9 && (
                          <span className="ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Finalist
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {submission.githubUrl ? (
                            <a
                              href={submission.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
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
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40">
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
                            </span>
                          )}
                          {submission.hostedSiteUrl ? (
                            <a
                              href={submission.hostedSiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
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
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40">
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
                            </span>
                          )}
                          {submission.videoOverviewUrl ? (
                            <a
                              href={submission.videoOverviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
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
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40">
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
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {submission.score ? (
                          <span className="font-medium text-foreground">
                            {submission.score}/10
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {submission.judgeId ? (
                          <span className="text-sm text-muted-foreground">
                            Claimed
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={`/judge/${submission._id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {allSubmissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No submissions found.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
