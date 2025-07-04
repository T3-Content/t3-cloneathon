"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function JudgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  const submissionCounts = useQuery(
    api.submission.getQualifiedSubmissionCounts
  );
  const finalistSubmissions = useQuery(api.submission.getFinalistSubmissions);
  const topWinners = useQuery(api.submission.getTopWinners);
  const allSubmissions = useQuery(api.submission.getAllSubmissionsWithSort, {
    filter: {
      status: undefined,
      reviewed: undefined,
      score: undefined,
      hasVideo: undefined,
      hasGithub: undefined,
    },
    sortBy: "createdAt",
    sortOrder: "desc",
  });

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

  const navigationItems = [
    {
      href: "/judge",
      label: "Regular Judging",
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
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      badge: submissionCounts && (
        <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
          {submissionCounts.reviewed}/{submissionCounts.submitted}
        </span>
      ),
      isActive: pathname === "/judge",
    },
    {
      href: "/judge/finalists",
      label: "Finalist Judging",
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
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      badge: finalistSubmissions && (
        <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">
          {finalistSubmissions.length}
        </span>
      ),
      isActive: pathname === "/judge/finalists",
    },
    {
      href: "/judge/winners",
      label: "Winners",
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
      badge: topWinners && topWinners.length > 0 && (
        <span className="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded-full">
          {topWinners.length}
        </span>
      ),
      isActive: pathname === "/judge/winners",
    },
    {
      href: "/judge/all-submissions",
      label: "All Submissions",
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
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      ),
      badge: allSubmissions && (
        <span className="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
          {allSubmissions.length}
        </span>
      ),
      isActive: pathname === "/judge/all-submissions",
    },
  ];

  return (
    <div className="w-[80rem] max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-8">
        <nav className="bg-card border border-border rounded-lg p-1">
          <div className="grid grid-cols-4 gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${
                    item.isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(" ")[0]}</span>
                {item.badge}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
