"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Github,
  Play,
  Users,
  Trophy,
  Medal,
  Award,
} from "lucide-react";
import Link from "next/link";

type Submission = {
  _id: string;
  projectName: string;
  members: string[];
  githubUrl: string;
  hostedSiteUrl?: string;
  videoOverviewUrl?: string;
  description?: string;
  createdAt: number;
  shared?: boolean;
  status: "in-progress" | "submitted";
  totalFinalistScore?: number;
};

function SubmissionCard({
  submission,
  winnerPlace,
}: {
  submission: Submission;
  winnerPlace?: 1 | 2 | 3;
}) {
  const getWinnerIcon = (place: 1 | 2 | 3) => {
    switch (place) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getWinnerText = (place: 1 | 2 | 3) => {
    switch (place) {
      case 1:
        return "1st Place";
      case 2:
        return "2nd Place";
      case 3:
        return "3rd Place";
      default:
        return "";
    }
  };

  return (
    <Card
      className={`bg-white/5 border-white/10 relative ${winnerPlace ? "border-2" : ""} ${winnerPlace === 1 ? "border-yellow-400/50" : winnerPlace === 2 ? "border-gray-300/50" : winnerPlace === 3 ? "border-amber-600/50" : ""}`}
    >
      {winnerPlace && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-black/90 rounded-full p-2 border border-white/20">
            {getWinnerIcon(winnerPlace)}
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-white text-xl">
                {submission.projectName}
              </CardTitle>
              {winnerPlace && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                >
                  {getWinnerText(winnerPlace)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
              <Users className="w-4 h-4" />
              <span>{submission.members.join(", ")}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Button
            asChild={!!submission.videoOverviewUrl}
            variant="outline"
            size="sm"
            disabled={!submission.videoOverviewUrl}
            className="border-white/20 text-white hover:bg-white/10 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submission.videoOverviewUrl ? (
              <Link href={submission.videoOverviewUrl} target="_blank">
                <Play className="w-4 h-4 mr-2" />
                Demo
              </Link>
            ) : (
              <div className="flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Demo
              </div>
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 flex-1"
            >
              <Link href={submission.githubUrl} target="_blank">
                <Github className="w-4 h-4 mr-2" />
                Code
              </Link>
            </Button>

            <Button
              asChild={!!submission.hostedSiteUrl}
              variant="outline"
              size="sm"
              disabled={!submission.hostedSiteUrl}
              className="border-white/20 text-white hover:bg-white/10 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submission.hostedSiteUrl ? (
                <Link href={submission.hostedSiteUrl} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Site
                </Link>
              ) : (
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Live Site
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GalleryPage() {
  const submissions = useQuery(api.submission.getSharedSubmissions);
  const topWinners = useQuery(api.submission.getTopWinners);

  // Create a map of winner IDs to their place
  const winnerMap = new Map<string, 1 | 2 | 3>();
  if (topWinners) {
    topWinners.forEach((winner, index) => {
      winnerMap.set(winner._id, (index + 1) as 1 | 2 | 3);
    });
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Submissions Gallery
          </h1>
          <p className="text-white/70 text-lg">
            Explore amazing T3 Chat clones built by participants
          </p>
        </div>

        {submissions === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : submissions.length === 0 ? (
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
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No shared submissions yet
            </h3>
            <p className="text-white/60">
              Be the first to share your submission in the gallery!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission._id}
                submission={submission}
                winnerPlace={winnerMap.get(submission._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
