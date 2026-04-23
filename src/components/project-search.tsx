"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  beginner: "border-[#00ff94]/25 bg-[#00ff94]/10 text-[#00ff94]",
  intermediate: "border-[#ff9e2c]/25 bg-[#ff9e2c]/10 text-[#ff9e2c]",
  advanced: "border-[#ff2d8f]/25 bg-[#ff2d8f]/10 text-[#ff2d8f]",
};

const DIFFICULTY_ACTIVE: Record<Difficulty, string> = {
  beginner: "border-[#00ff94]/80 bg-[#00ff94] text-[#050408]",
  intermediate: "border-[#ff9e2c]/80 bg-[#ff9e2c] text-[#050408]",
  advanced: "border-[#ff2d8f]/80 bg-[#ff2d8f] text-white",
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
  if (!Number.isNaN(minRolesNum) && minRolesNum > 0) {
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
  const hasPayFilter = !Number.isNaN(payMinNum) || !Number.isNaN(payMaxNum);
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
      const effectiveLo = lo ?? hi ?? 0;
      const effectiveHi = hi ?? lo ?? 0;
      if (!Number.isNaN(payMinNum) && effectiveHi < payMinNum) return false;
      if (!Number.isNaN(payMaxNum) && effectiveLo > payMaxNum) return false;
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
      default:
        return 0;
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
  placeholder = "Search projects by name…",
  inputClassName,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: ProjectSearchData[];
  placeholder?: string;
  inputClassName?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#00f0ff]"
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
            "ck-input w-full rounded-xl py-3 pl-10 pr-10 text-sm"
          }
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-[#7a7490] hover:text-[#00f0ff]"
            aria-label="Clear search"
          >
            <svg
              aria-hidden="true"
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
        <div className="ck-panel absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl p-4">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#7a7490]">
            {suggestions.length}{" "}
            {suggestions.length === 1
              ? "matching project"
              : "matching projects"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {suggestions.map((p) => (
              <div key={p.slug}>
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

  const inputClass = "ck-input rounded-lg px-3 py-2 text-sm";

  return (
    <div>
      {/* Search */}
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => setQuery("")}
        suggestions={[]}
      />

      {/* Sort + filter toggle row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="project-sort"
            className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]"
          >
            Sort:
          </label>
          <select
            id="project-sort"
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
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
            showFilters || hasActiveFilters
              ? "border-[#00f0ff]/80 bg-[#00f0ff] text-[#050408]"
              : "border-[#00f0ff]/35 bg-[#00f0ff]/10 text-[#00f0ff] hover:border-[#00f0ff]/70"
          }`}
        >
          <svg
            aria-hidden="true"
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
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#050408] text-xs font-bold text-[#00f0ff]">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-[#7a7490] underline-offset-2 hover:text-[#ff9e2c] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="ck-panel mt-4 rounded-2xl p-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tags */}
            <div className="lg:col-span-2">
              <div className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]">
                Tags
              </div>
              <TagInput
                tags={filterTags}
                onChange={setFilterTags}
                suggestions={allTags}
                placeholder="Filter by tag…"
              />
            </div>

            {/* Difficulty */}
            <div>
              <div className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]">
                Role difficulty
              </div>
              <div className="flex flex-wrap gap-2">
                {(["beginner", "intermediate", "advanced"] as Difficulty[]).map(
                  (d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDifficulty(d)}
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-colors ${
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
              <label
                htmlFor="min-open-roles"
                className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]"
              >
                Min open roles
              </label>
              <input
                id="min-open-roles"
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
                <div className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]">
                  Pay range
                </div>
                <div className="flex rounded-lg border border-[#00f0ff]/25 text-xs">
                  <button
                    type="button"
                    onClick={() => setPayMode("hourly")}
                    className={`rounded-l-lg px-2.5 py-1 font-medium transition-colors ${
                      payMode === "hourly"
                        ? "bg-[#00f0ff] text-[#050408]"
                        : "text-[#7a7490] hover:text-[#00f0ff]"
                    }`}
                  >
                    $/hr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMode("salary")}
                    className={`rounded-r-lg px-2.5 py-1 font-medium transition-colors ${
                      payMode === "salary"
                        ? "bg-[#00f0ff] text-[#050408]"
                        : "text-[#7a7490] hover:text-[#00f0ff]"
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
                <span className="text-[#7a7490]">-</span>
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
                <p className="mt-1 text-xs text-[#7a7490]">
                  Values in thousands (e.g. 90 = $90k/yr)
                </p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <div className="mb-2 block font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]">
                Timeline
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={timelineFrom}
                  onChange={(e) => setTimelineFrom(e.target.value)}
                  className={`w-full ${inputClass}`}
                  title="From"
                />
                <span className="text-[#7a7490]">-</span>
                <input
                  type="date"
                  value={timelineTo}
                  onChange={(e) => setTimelineTo(e.target.value)}
                  className={`w-full ${inputClass}`}
                  title="To"
                />
              </div>
              <p className="mt-1 text-xs text-[#7a7490]">
                Only shows projects with a set deadline
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#7a7490]">
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
          <p className="text-[#7a7490]">No projects match your filters.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-[#00f0ff] underline underline-offset-2 hover:text-[#8fffff]"
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
      placeholder="Search projects…"
      inputClassName="ck-input w-full rounded-xl py-3 pl-10 pr-10 text-sm"
    />
  );
}
