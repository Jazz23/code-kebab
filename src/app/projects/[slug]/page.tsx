import { notFound } from "next/navigation";
import Link from "next/link";
import { projects, getProject } from "@/lib/mock-data";
import { Avatar } from "@/components/avatar";
import { JoinRequestButton } from "@/components/join-request-button";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Not Found" };
  return { title: `${project.title} - code-kebab` };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {project.title}
            </h1>
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
              {project.longDescription}
            </p>

            <h2 className="mt-10 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Team
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {project.members.map((member) => (
                <div key={member.username} className="flex items-center gap-3">
                  <Avatar
                    initials={member.avatar}
                    username={member.username}
                    size="sm"
                  />
                  <div>
                    <Link
                      href={`/profile/${member.username}`}
                      className="text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {member.name}
                    </Link>
                    {member.username === project.owner.username && (
                      <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        Owner
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <JoinRequestButton projectTitle={project.title} />

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Open Roles
              </h3>
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
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Details
              </h3>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Created</dt>
                  <dd className="text-zinc-900 dark:text-zinc-50">
                    {project.createdAt}
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
                      href={`/profile/${project.owner.username}`}
                      className="text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {project.owner.name}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
