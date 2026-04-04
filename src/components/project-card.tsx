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
  timelineOpenEnded: boolean | null;
  ownerName: string | null;
  memberCount: number;
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const roleCount = project.openRoles.length || project.openSlots;
  const roleLabel =
    project.openSlots && !project.openRoles.length
      ? `${project.openSlots} open ${project.openSlots === 1 ? "slot" : "slots"}`
      : `${project.openRoles.length} open ${project.openRoles.length === 1 ? "role" : "roles"}`;

  let timelineLabel: string | null = null;
  if (project.timelineOpenEnded) {
    timelineLabel = "Open ended";
  } else if (project.timelineDate) {
    timelineLabel = project.timelineDate.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
          {project.title}
        </h3>
        {(roleCount ?? 0) > 0 && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            {roleLabel}
          </span>
        )}
      </div>

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
      </div>
    </Link>
  );
}
