import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getProjectBySlug } from "@/db/queries";
import { CreateProjectForm } from "@/components/create-project-form";
import type { ProjectFormInitialData } from "@/components/create-project-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return { title: `Edit ${project.title} - code-kebab` };
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, session] = await Promise.all([
    getProjectBySlug(slug),
    auth(),
  ]);

  if (!project) notFound();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify ownership
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row || project.ownerId !== session.user.id) {
    redirect(`/projects/${slug}`);
  }

  // Derive form state from project data
  let rolesMode: "none" | "slots" | "named" = "none";
  if (project.roles.length > 0) rolesMode = "named";
  else if (project.openSlots != null) rolesMode = "slots";

  const timelineMode: "none" | "date" = project.timelineDate ? "date" : "none";

  const timelineDate = project.timelineDate
    ? project.timelineDate.toISOString().split("T")[0]
    : "";

  // Map non-owner members to form entries
  const memberEntries = project.members
    .filter((m) => m.userId !== project.ownerId)
    .map((m) => ({
      id: crypto.randomUUID(),
      name: m.username ? "" : (m.name ?? ""),
      username: m.username ?? "",
      checkState: m.username ? ("found" as const) : ("idle" as const),
      resolvedUserId: m.userId ?? undefined,
      resolvedName: m.username ? (m.name ?? undefined) : undefined,
    }));

  const roleEntries = project.roles.map((r) => ({
    id: r.id,
    name: r.name,
    hourlyRate: r.hourlyRate ?? "",
    salary: r.salary ?? "",
    difficulty: (r.difficulty ?? "") as
      | ""
      | "beginner"
      | "intermediate"
      | "advanced",
  }));

  const initialData: ProjectFormInitialData = {
    projectId: project.id,
    title: project.title,
    description: project.longDescription ?? project.description,
    githubUrl: project.githubUrl ?? "",
    tags: project.tags,
    rolesMode,
    openSlots: project.openSlots?.toString() ?? "",
    roles:
      roleEntries.length > 0
        ? roleEntries
        : [
            {
              id: crypto.randomUUID(),
              name: "",
              hourlyRate: "",
              salary: "",
              difficulty: "" as const,
            },
          ],
    timelineMode,
    timelineDate,
    members: memberEntries,
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href={`/projects/${slug}`}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          &larr; Back to project
        </Link>
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Edit project
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Changes are saved automatically.
          </p>
        </div>
        <CreateProjectForm mode="edit" initialData={initialData} />
      </div>
    </main>
  );
}
