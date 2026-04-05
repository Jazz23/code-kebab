import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserByUsername, getUserProjects } from "@/db/queries";
import { ProjectCard } from "@/components/project-card";
import { ProfileEditForm } from "@/components/profile-edit-form";

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
  const [user, userProjects, session] = await Promise.all([
    getUserByUsername(username),
    getUserProjects(username),
    auth(),
  ]);

  if (!user) notFound();

  // Check if the logged-in user is viewing their own profile
  let isOwnProfile = false;
  if (session?.user?.id) {
    const [row] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    isOwnProfile = row?.username === username;
  }

  const initials = (user.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {isOwnProfile ? (
          <ProfileEditForm user={user} />
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {user.name}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500">@{user.username}</p>
                </div>
              </div>
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
              {user.timezone && (
                <p className="mt-2 text-xs text-zinc-400">
                  Timezone: {user.timezone}
                </p>
              )}
              {user.createdAt && (
                <p className="mt-1 text-xs text-zinc-400">
                  Joined {user.createdAt.toLocaleDateString("en-US", { timeZone: "UTC" })}
                </p>
              )}
            </div>
          </div>
        )}

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Projects
            </h2>
          </div>
          {userProjects.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  editHref={isOwnProfile && project.ownerId === user.id ? `/projects/${project.slug}/edit` : undefined}
                />
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
