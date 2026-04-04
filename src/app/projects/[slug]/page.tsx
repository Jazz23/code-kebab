import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/db/queries";
import { Avatar } from "@/components/avatar";
import { JoinRequestButton } from "@/components/join-request-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return { title: `${project.title} - code-kebab` };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const hasNamedRoles = project.roles.length > 0;
  const hasOpenRoles = project.openRoles.length > 0;
  const hasSlots = project.openSlots != null;

  let timelineLabel: string | null = null;
  if (project.timelineOpenEnded) {
    timelineLabel = "Open ended";
  } else if (project.timelineDate) {
    timelineLabel = project.timelineDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/projects"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          &larr; Back to projects
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {project.title}
              </h1>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {project.longDescription ?? project.description}
            </p>

            <h2 className="mt-10 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Team
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {project.members.map((member) => {
                const initials = (member.name ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar
                      initials={initials}
                      username={member.username ?? member.id}
                      size="sm"
                    />
                    <div>
                      <Link
                        href={`/profile/${member.username ?? member.id}`}
                        className="text-sm font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                      >
                        {member.name}
                      </Link>
                      {member.userId === project.ownerId && (
                        <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <JoinRequestButton projectTitle={project.title} />

            {/* Open Roles */}
            {(hasNamedRoles || hasOpenRoles || hasSlots) && (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Open Roles
                </h3>
                {hasNamedRoles ? (
                  <ul className="mt-3 flex flex-col gap-3">
                    {project.roles.map((role) => (
                      <li key={role.id} className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          <span className="font-medium">{role.name}</span>
                        </div>
                        {(role.hourlyRate || role.salary) && (
                          <p className="pl-3.5 text-xs text-zinc-500 dark:text-zinc-400">
                            {role.hourlyRate
                              ? `$${role.hourlyRate}/hr`
                              : `$${Number(role.salary).toLocaleString()}/yr`}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : hasOpenRoles ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {project.openRoles.map((role) => (
                      <li
                        key={role}
                        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {project.openSlots}{" "}
                    {project.openSlots === 1 ? "slot" : "slots"} available
                  </p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Details
              </h3>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Created</dt>
                  <dd className="text-zinc-900 dark:text-zinc-50">
                    {project.createdAt.toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Members</dt>
                  <dd className="text-zinc-900 dark:text-zinc-50">
                    {project.members.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Owner</dt>
                  <dd>
                    <Link
                      href={`/profile/${project.ownerUsername ?? project.ownerId}`}
                      className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      {project.ownerName}
                    </Link>
                  </dd>
                </div>
                {timelineLabel && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Timeline</dt>
                    <dd className="text-zinc-900 dark:text-zinc-50">
                      {timelineLabel}
                    </dd>
                  </div>
                )}
                {project.githubUrl && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">GitHub</dt>
                    <dd>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-40 truncate text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                      >
                        {project.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
