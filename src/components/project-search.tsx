"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { TagInput } from "@/components/tag-input";

export type ProjectSearchData = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  openRoles: string[];
  openSlots: number | null;
  githubUrl: string | null;
  timelineDate: Date | null;
  createdAt: Date;
  ownerName: string | null;
  memberCount: number;
  beginnerRoles: number;
  intermediateRoles: number;
  advancedRoles: number;
  minHourlyRate: number | null;
  maxHourlyRate: number | null;
  minSalary: number | null;
  maxSalary: number | null;
};

type SortKey =
  | "newest"
  | "oldest"
  | "timeline-asc"
  | "timeline-desc"
  | "pay-desc"
  | "pay-asc";
type PayMode = "hourly" | "salary";
type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  intermediate:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  advanced:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

const DIFFICULTY_ACTIVE: Record<Difficulty, string> = {
  beginner:
    "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-600",
  intermediate:
    "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-600",
  advanced:
    "bg-red-100 text-red-800 border-red-400 dark:bg-red-900 dark:text-red-200 dark:border-red-600",
};

function applySortAndFilter(
  projects: ProjectSearchData[],
  opts: {
    query: string;
    filterTags: string[];
    difficulties: Set<Difficulty>;
    minRoles: string;
    payMode: PayMode;
    payMin: string;
    payMax: string;
    timelineFrom: string;
    timelineTo: string;
    sortKey: SortKey;
  },
): ProjectSearchData[] {
  let filtered = [...projects];

  // Name search
  if (opts.query.trim()) {
    const q = opts.query.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q));
  }

  // Tag filter — show project if any of the filter tags is in the project's tags
  if (opts.filterTags.length > 0) {
    filtered = filtered.filter((p) =>
      opts.filterTags.some((tag) => p.tags.includes(tag)),
    );
  }

  // Difficulty filter — show project if it has any role of a selected difficulty
  if (opts.difficulties.size > 0) {
    filtered = filtered.filter(
      (p) =>
        (opts.difficulties.has("beginner") && p.beginnerRoles > 0) ||
        (opts.difficulties.has("intermediate") && p.intermediateRoles > 0) ||
        (opts.difficulties.has("advanced") && p.advancedRoles > 0),
    );
  }

  // Min open roles
  const minRolesNum = parseInt(opts.minRoles, 10);
  if (!isNaN(minRolesNum) && minRolesNum > 0) {
    filtered = filtered.filter((p) => {
      const count =
        p.openRoles.length > 0 ? p.openRoles.length : (p.openSlots ?? 0);
      return count >= minRolesNum;
    });
  }

  // Pay range filter
  // Salary values in the db are raw dollars; filter inputs are in thousands for salary mode
  const payMinNum = parseFloat(opts.payMin);
  const payMaxNum = parseFloat(opts.payMax);
  const hasPayFilter = !isNaN(payMinNum) || !isNaN(payMaxNum);
  if (hasPayFilter) {
    filtered = filtered.filter((p) => {
      let lo: number | null;
      let hi: number | null;
      if (opts.payMode === "hourly") {
        lo = p.minHourlyRate;
        hi = p.maxHourlyRate;
      } else {
        lo = p.minSalary !== null ? p.minSalary / 1000 : null;
        hi = p.maxSalary !== null ? p.maxSalary / 1000 : null;
      }
      if (lo === null && hi === null) return false;
      const effectiveLo = lo ?? hi!;
      const effectiveHi = hi ?? lo!;
      if (!isNaN(payMinNum) && effectiveHi < payMinNum) return false;
      if (!isNaN(payMaxNum) && effectiveLo > payMaxNum) return false;
      return true;
    });
  }

  // Timeline filter
  if (opts.timelineFrom) {
    const from = new Date(opts.timelineFrom);
    filtered = filtered.filter(
      (p) => p.timelineDate !== null && p.timelineDate >= from,
    );
  }
  if (opts.timelineTo) {
    const to = new Date(opts.timelineTo);
    filtered = filtered.filter(
      (p) => p.timelineDate !== null && p.timelineDate <= to,
    );
  }

  // Sort
  filtered.sort((a, b) => {
    switch (opts.sortKey) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "timeline-asc": {
        const aT = a.timelineDate?.getTime() ?? Infinity;
        const bT = b.timelineDate?.getTime() ?? Infinity;
        return aT - bT;
      }
      case "timeline-desc": {
        const aT = a.timelineDate?.getTime() ?? -Infinity;
        const bT = b.timelineDate?.getTime() ?? -Infinity;
        return bT - aT;
      }
      case "pay-desc": {
        const aV =
          opts.payMode === "hourly"
            ? (a.maxHourlyRate ?? 0)
            : (a.maxSalary ?? 0);
        const bV =
          opts.payMode === "hourly"
            ? (b.maxHourlyRate ?? 0)
            : (b.maxSalary ?? 0);
        return bV - aV;
      }
      case "pay-asc": {
        const aV =
          opts.payMode === "hourly"
            ? (a.minHourlyRate ?? Infinity)
            : (a.minSalary ?? Infinity);
        const bV =
          opts.payMode === "hourly"
            ? (b.minHourlyRate ?? Infinity)
            : (b.minSalary ?? Infinity);
        return aV - bV;
      }
    }
  });

  return filtered;
}

// Shared search input + autocomplete dropdown (used by both ProjectSearch and HeroSearch)
function SearchInput({
  value,
  onChange,
  onClear,
  onKeyDown,
  suggestions,
  onSuggestionClick,
  placeholder = "Search projects by name…",
  inputClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: ProjectSearchData[];
  onSuggestionClick: (slug: string) => void;
  placeholder?: string;
  inputClassName?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <svg
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (value.trim()) setShowSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={
            inputClassName ??
            "w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-10 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
          }
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
          <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {suggestions.length}{" "}
            {suggestions.length === 1
              ? "matching project"
              : "matching projects"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {suggestions.map((p) => (
              <div
                key={p.slug}
                className="cursor-pointer"
                onMouseDown={() => onSuggestionClick(p.slug)}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Full search + filter UI for the projects page
export function ProjectSearch({
  projects,
  initialQuery = "",
}: {
  projects: ProjectSearchData[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set());
  const [minRoles, setMinRoles] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [payMode, setPayMode] = useState<PayMode>("hourly");
  const [payMin, setPayMin] = useState("");
  const [payMax, setPayMax] = useState("");
  const [timelineFrom, setTimelineFrom] = useState("");
  const [timelineTo, setTimelineTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // All unique tags across all projects (for TagInput suggestions)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const p of projects) {
      for (const t of p.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }, [projects]);

  const hasActiveFilters =
    filterTags.length > 0 ||
    difficulties.size > 0 ||
    minRoles !== "" ||
    payMin !== "" ||
    payMax !== "" ||
    timelineFrom !== "" ||
    timelineTo !== "";

  const activeFilterCount =
    (filterTags.length > 0 ? 1 : 0) +
    difficulties.size +
    (minRoles !== "" ? 1 : 0) +
    (payMin !== "" || payMax !== "" ? 1 : 0) +
    (timelineFrom !== "" || timelineTo !== "" ? 1 : 0);

  function clearFilters() {
    setFilterTags([]);
    setDifficulties(new Set());
    setMinRoles("");
    setPayMin("");
    setPayMax("");
    setTimelineFrom("");
    setTimelineTo("");
  }

  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  // Auto-suggest by title
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, query]);

  // Full filtered + sorted results (separate from suggestions — suggestions are for the dropdown, results for the grid)
  const results = useMemo(
    () =>
      applySortAndFilter(projects, {
        query,
        filterTags,
        difficulties,
        minRoles,
        payMode,
        payMin,
        payMax,
        timelineFrom,
        timelineTo,
        sortKey,
      }),
    [
      projects,
      query,
      filterTags,
      difficulties,
      minRoles,
      payMode,
      payMin,
      payMax,
      timelineFrom,
      timelineTo,
      sortKey,
    ],
  );

  const inputClass =
    "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400";

  return (
    <div>
      {/* Search */}
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery("")}
        suggestions={[]}
        onSuggestionClick={(slug) => router.push(`/projects/${slug}`)}
      />

      {/* Sort + filter toggle row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            Sort:
          </label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className={inputClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="timeline-asc">Timeline: Earliest</option>
            <option value="timeline-desc">Timeline: Latest</option>
            <option value="pay-desc">
              Pay: Highest ({payMode === "hourly" ? "$/hr" : "$/yr"})
            </option>
            <option value="pay-asc">
              Pay: Lowest ({payMode === "hourly" ? "$/hr" : "$/yr"})
            </option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-300 text-zinc-700 hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M7 8h10M11 12h2"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tags
              </label>
              <TagInput
                tags={filterTags}
                onChange={setFilterTags}
                suggestions={allTags}
                placeholder="Filter by tag…"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Role difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {(["beginner", "intermediate", "advanced"] as Difficulty[]).map(
                  (d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDifficulty(d)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        difficulties.has(d)
                          ? DIFFICULTY_ACTIVE[d]
                          : DIFFICULTY_COLORS[d]
                      }`}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Min open roles */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Min open roles
              </label>
              <input
                type="number"
                min="1"
                value={minRoles}
                onChange={(e) => setMinRoles(e.target.value)}
                placeholder="e.g. 2"
                className={`w-full ${inputClass}`}
              />
            </div>

            {/* Pay range */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Pay range
                </label>
                <div className="flex rounded-lg border border-zinc-300 text-xs dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setPayMode("hourly")}
                    className={`rounded-l-lg px-2.5 py-1 font-medium transition-colors ${
                      payMode === "hourly"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    $/hr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMode("salary")}
                    className={`rounded-r-lg px-2.5 py-1 font-medium transition-colors ${
                      payMode === "salary"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    $/yr
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={payMin}
                  onChange={(e) => setPayMin(e.target.value)}
                  placeholder={payMode === "salary" ? "Min (k)" : "Min"}
                  className={`w-full ${inputClass}`}
                />
                <span className="text-zinc-400">–</span>
                <input
                  type="number"
                  min="0"
                  value={payMax}
                  onChange={(e) => setPayMax(e.target.value)}
                  placeholder={payMode === "salary" ? "Max (k)" : "Max"}
                  className={`w-full ${inputClass}`}
                />
              </div>
              {payMode === "salary" && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Values in thousands (e.g. 90 = $90k/yr)
                </p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Timeline
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={timelineFrom}
                  onChange={(e) => setTimelineFrom(e.target.value)}
                  className={`w-full ${inputClass}`}
                  title="From"
                />
                <span className="text-zinc-400">–</span>
                <input
                  type="date"
                  value={timelineTo}
                  onChange={(e) => setTimelineTo(e.target.value)}
                  className={`w-full ${inputClass}`}
                  title="To"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Only shows projects with a set deadline
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        {results.length === projects.length
          ? `${results.length} ${results.length === 1 ? "project" : "projects"}`
          : `${results.length} of ${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
      </p>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            No projects match your filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact search for the home page hero — navigates to the projects page
export function HeroSearch({ projects }: { projects: ProjectSearchData[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return projects.filter((p) => p.title.toLowerCase().includes(q));
  }, [projects, query]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/projects?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      onClear={() => setQuery("")}
      onKeyDown={handleKeyDown}
      suggestions={suggestions}
      onSuggestionClick={(slug) => router.push(`/projects/${slug}`)}
      placeholder="Search projects…"
      inputClassName="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-10 pr-10 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-500"
    />
  );
}
