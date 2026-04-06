import Link from "next/link";
import { auth } from "@/auth";
import { getProjects } from "@/db/queries";
import { ProjectSearch } from "@/components/project-search";

export const metadata = {
  title: "Projects - code-kebab",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [projects, session, params] = await Promise.all([
    getProjects(),
    auth(),
    searchParams,
  ]);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Projects
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Browse projects looking for collaborators.
            </p>
          </div>
          {session?.user && (
            <Link
              href="/projects/new"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Create project
            </Link>
          )}
        </div>
        <div className="mt-8">
          <ProjectSearch projects={projects} initialQuery={params.q ?? ""} />
        </div>
      </div>
    </main>
  );
}
