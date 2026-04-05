import Link from "next/link";

type ProjectCardData = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  openRoles: string[];
  openSlots: number | null;
  githubUrl: string | null;
  timelineDate: Date | null;
  ownerName: string | null;
  memberCount: number;
  beginnerRoles?: number;
  intermediateRoles?: number;
  advancedRoles?: number;
  minHourlyRate?: number | null;
  maxHourlyRate?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;
};

export function ProjectCard({
  project,
  editHref,
}: {
  project: ProjectCardData;
  editHref?: string;
}) {
  const hasDifficultyData =
    (project.beginnerRoles ?? 0) > 0 ||
    (project.intermediateRoles ?? 0) > 0 ||
    (project.advancedRoles ?? 0) > 0;

  const roleCount = project.openRoles.length || project.openSlots;
  const roleLabel =
    project.openSlots && !project.openRoles.length
      ? `${project.openSlots} open ${project.openSlots === 1 ? "slot" : "slots"}`
      : `${project.openRoles.length} open ${project.openRoles.length === 1 ? "role" : "roles"}`;

  const payLabel = (() => {
    if (project.maxHourlyRate != null) return `$${project.maxHourlyRate}/hr`;
    if (project.maxSalary != null) return `$${Math.round(project.maxSalary / 1000)}k/yr`;
    if (project.minHourlyRate != null) return `$${project.minHourlyRate}+/hr`;
    if (project.minSalary != null) return `$${Math.round(project.minSalary / 1000)}k+/yr`;
    return null;
  })();

  const timelineLabel = project.timelineDate
    ? project.timelineDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      {/* Stretched link covering the whole card */}
      <Link href={`/projects/${project.slug}`} className="absolute inset-0 z-10 rounded-xl">
        <span className="sr-only">{project.title}</span>
      </Link>

      <div className="relative z-20 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
          <Link href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </h3>
        {editHref && (
          <Link
            href={editHref}
            className="relative z-30 shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
          >
            Edit
          </Link>
        )}
      </div>

      {hasDifficultyData ? (
        <div className="flex flex-wrap gap-1">
          {(project.beginnerRoles ?? 0) > 0 && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              {project.beginnerRoles} beginner
            </span>
          )}
          {(project.intermediateRoles ?? 0) > 0 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {project.intermediateRoles} intermediate
            </span>
          )}
          {(project.advancedRoles ?? 0) > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
              {project.advancedRoles} advanced
            </span>
          )}
        </div>
      ) : (roleCount ?? 0) > 0 ? (
        <div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {roleLabel}
          </span>
        </div>
      ) : null}

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-500 dark:text-zinc-500">
        <span>by {project.ownerName}</span>
        <span>&middot;</span>
        <span>
          {project.memberCount}{" "}
          {project.memberCount === 1 ? "member" : "members"}
        </span>
        {timelineLabel && (
          <>
            <span>&middot;</span>
            <span>{timelineLabel}</span>
          </>
        )}
        {project.githubUrl && (
          <>
            <span>&middot;</span>
            <span className="text-zinc-400 dark:text-zinc-600">GitHub</span>
          </>
        )}
        {payLabel && (
          <>
            <span>&middot;</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{payLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}
