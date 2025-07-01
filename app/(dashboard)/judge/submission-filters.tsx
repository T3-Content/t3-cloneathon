"use client";

interface SubmissionFiltersProps {
  filters: {
    status: "in-progress" | "submitted" | undefined;
    reviewed: boolean | undefined;
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | undefined;
    hasVideo?: boolean | undefined;
    hasGithub?: boolean | undefined;
  };
  onFiltersChange: (filters: any) => void;
  showAdditionalFilters?: boolean;
}

export function SubmissionFilters({
  filters,
  onFiltersChange,
  showAdditionalFilters = false,
}: SubmissionFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: undefined,
      reviewed: undefined,
      score: undefined,
      hasVideo: undefined,
      hasGithub: undefined,
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.reviewed !== undefined ||
    filters.score !== undefined ||
    filters.hasVideo !== undefined ||
    filters.hasGithub !== undefined;

  return (
    <div className="bg-muted/50 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-sm font-medium text-foreground">Filters:</h3>

        <div className="flex items-center gap-2">
          <label
            htmlFor="status-filter"
            className="text-sm text-muted-foreground"
          >
            Status:
          </label>
          <select
            id="status-filter"
            value={filters.status || ""}
            onChange={(e) =>
              updateFilter("status", e.target.value || undefined)
            }
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="reviewed-filter"
            className="text-sm text-muted-foreground"
          >
            Reviewed:
          </label>
          <select
            id="reviewed-filter"
            value={
              filters.reviewed === undefined ? "" : filters.reviewed.toString()
            }
            onChange={(e) => {
              const value = e.target.value;
              updateFilter(
                "reviewed",
                value === "" ? undefined : value === "true"
              );
            }}
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="true">Reviewed</option>
            <option value="false">Not Reviewed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="score-filter"
            className="text-sm text-muted-foreground"
          >
            Min Score:
          </label>
          <select
            id="score-filter"
            value={filters.score || ""}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter("score", value === "" ? undefined : parseInt(value));
            }}
            className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Scores</option>
            <option value="1">1+ and above</option>
            <option value="2">2+ and above</option>
            <option value="3">3+ and above</option>
            <option value="4">4+ and above</option>
            <option value="5">5+ and above</option>
            <option value="6">6+ and above</option>
            <option value="7">7+ and above</option>
            <option value="8">8+ and above</option>
            <option value="9">9+ and above</option>
            <option value="10">10 only</option>
          </select>
        </div>

        {showAdditionalFilters && (
          <>
            <div className="flex items-center gap-2">
              <label
                htmlFor="video-filter"
                className="text-sm text-muted-foreground"
              >
                Video:
              </label>
              <select
                id="video-filter"
                value={
                  filters.hasVideo === undefined
                    ? ""
                    : filters.hasVideo.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter(
                    "hasVideo",
                    value === "" ? undefined : value === "true"
                  );
                }}
                className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All</option>
                <option value="true">Has Video</option>
                <option value="false">No Video</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="github-filter"
                className="text-sm text-muted-foreground"
              >
                GitHub:
              </label>
              <select
                id="github-filter"
                value={
                  filters.hasGithub === undefined
                    ? ""
                    : filters.hasGithub.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilter(
                    "hasGithub",
                    value === "" ? undefined : value === "true"
                  );
                }}
                className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All</option>
                <option value="true">Has GitHub</option>
                <option value="false">No GitHub</option>
              </select>
            </div>
          </>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
