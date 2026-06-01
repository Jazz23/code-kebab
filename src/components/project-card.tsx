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
    if (project.maxSalary != null)
      return `$${Math.round(project.maxSalary / 1000)}k/yr`;
    if (project.minHourlyRate != null) return `$${project.minHourlyRate}+/hr`;
    if (project.minSalary != null)
      return `$${Math.round(project.minSalary / 1000)}k+/yr`;
    return null;
  })();

  const timelineLabel = project.timelineDate
    ? project.timelineDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <div className="ck-panel group relative flex min-h-[280px] flex-col gap-4 overflow-hidden rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#ff8a1e]/40">
      {/* Stretched link covering the whole card */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-10 rounded-xl"
      >
        <span className="sr-only">{project.title}</span>
      </Link>

      <div className="flex items-center justify-between gap-3 border-b border-[#f1e6d2]/10 pb-3">
        <span className="ck-kicker text-[#ff8a1e]">Project</span>
        <span className="ck-kicker rounded-md border border-[#21c168]/25 bg-[#21c168]/10 px-2 py-1 text-[#9af0bd]">
          {roleCount ?? 0} open
        </span>
      </div>

      <div className="relative z-20 flex items-start justify-between gap-2">
        <h3 className="ck-display text-2xl font-black leading-6 text-white transition-colors group-hover:text-[#ffbf75]">
          <Link href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </h3>
        {editHref && (
          <Link
            href={editHref}
            className="relative z-30 shrink-0 rounded-md border border-[#21c168]/25 bg-[#21c168]/12 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#9af0bd] transition-colors hover:border-[#21c168]/60"
          >
            Edit
          </Link>
        )}
      </div>

      {hasDifficultyData ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-xs font-medium text-[#a89778]">
            Open Roles:
          </span>
          {(project.beginnerRoles ?? 0) > 0 && (
            <span className="rounded-full border border-[#21c168]/20 bg-[#21c168]/10 px-2.5 py-0.5 text-xs font-medium text-[#9af0bd]">
              {project.beginnerRoles} beginner
            </span>
          )}
          {(project.intermediateRoles ?? 0) > 0 && (
            <span className="rounded-full border border-[#ff8a1e]/20 bg-[#ff8a1e]/10 px-2.5 py-0.5 text-xs font-medium text-[#ffbf75]">
              {project.intermediateRoles} intermediate
            </span>
          )}
          {(project.advancedRoles ?? 0) > 0 && (
            <span className="rounded-full border border-[#e0312d]/25 bg-[#e0312d]/10 px-2.5 py-0.5 text-xs font-medium text-[#ff918b]">
              {project.advancedRoles} advanced
            </span>
          )}
        </div>
      ) : (roleCount ?? 0) > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-xs font-medium text-[#a89778]">
            Open Roles:
          </span>
          <span className="rounded-full border border-[#21c168]/20 bg-[#21c168]/10 px-2.5 py-0.5 text-xs font-medium text-[#9af0bd]">
            {roleLabel}
          </span>
        </div>
      ) : null}

      <p className="text-sm leading-relaxed text-[#cbb992]">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span key={tag} className="ck-chip rounded-md px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#f1e6d2]/10 pt-3 font-mono text-[11px] text-[#a89778]">
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
            <span className="text-[#9af0bd]">GitHub</span>
          </>
        )}
        {payLabel && (
          <>
            <span>&middot;</span>
            <span className="font-medium text-[#ffbf75]">{payLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}
