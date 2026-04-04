import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserByUsername, getUserProjects } from "@/db/queries";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return { title: "Not Found" };
  return { title: `${user.name} - code-kebab` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, userProjects] = await Promise.all([
    getUserByUsername(username),
    getUserProjects(username),
  ]);

  if (!user) notFound();

  const initials = (user.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {user.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">@{user.username}</p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {user.bio}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(user.skills ?? []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>
            {user.createdAt && (
              <p className="mt-4 text-xs text-zinc-400">
                Joined {user.createdAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Projects
          </h2>
          {userProjects.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              No projects yet.{" "}
              <Link
                href="/projects"
                className="text-zinc-900 hover:underline dark:text-zinc-50"
              >
                Browse projects
              </Link>{" "}
              to get started.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
