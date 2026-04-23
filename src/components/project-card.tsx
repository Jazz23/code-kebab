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
    <div className="ck-panel group relative flex flex-col gap-3 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1">
      {/* Stretched link covering the whole card */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-10 rounded-2xl"
      >
        <span className="sr-only">{project.title}</span>
      </Link>

      <div className="relative z-20 flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#bffbff]">
          <Link href={`/projects/${project.slug}`} className="hover:underline">
            {project.title}
          </Link>
        </h3>
        {editHref && (
          <Link
            href={editHref}
            className="relative z-30 shrink-0 rounded-md border border-[#00f0ff]/25 bg-[#00f0ff]/10 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#00f0ff] transition-colors hover:border-[#00f0ff]/60"
          >
            Edit
          </Link>
        )}
      </div>

      {hasDifficultyData ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-xs font-medium text-[#7a7490]">
            Open Roles:
          </span>
          {(project.beginnerRoles ?? 0) > 0 && (
            <span className="rounded-full border border-[#00ff94]/20 bg-[#00ff94]/10 px-2.5 py-0.5 text-xs font-medium text-[#00ff94]">
              {project.beginnerRoles} beginner
            </span>
          )}
          {(project.intermediateRoles ?? 0) > 0 && (
            <span className="rounded-full border border-[#ff9e2c]/20 bg-[#ff9e2c]/10 px-2.5 py-0.5 text-xs font-medium text-[#ff9e2c]">
              {project.intermediateRoles} intermediate
            </span>
          )}
          {(project.advancedRoles ?? 0) > 0 && (
            <span className="rounded-full border border-[#ff2d8f]/20 bg-[#ff2d8f]/10 px-2.5 py-0.5 text-xs font-medium text-[#ff2d8f]">
              {project.advancedRoles} advanced
            </span>
          )}
        </div>
      ) : (roleCount ?? 0) > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-mono text-xs font-medium text-[#7a7490]">
            Open Roles:
          </span>
          <span className="rounded-full border border-[#00ff94]/20 bg-[#00ff94]/10 px-2.5 py-0.5 text-xs font-medium text-[#00ff94]">
            {roleLabel}
          </span>
        </div>
      ) : null}

      <p className="text-sm leading-relaxed text-[#aaa3bf]">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span key={tag} className="ck-chip rounded-md px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 font-mono text-[11px] text-[#7a7490]">
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
            <span className="text-[#00f0ff]">GitHub</span>
          </>
        )}
        {payLabel && (
          <>
            <span>&middot;</span>
            <span className="font-medium text-[#00ff94]">{payLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}
