import Link from "next/link";
import { auth } from "@/auth";
import { ProjectSearch } from "@/components/project-search";
import { getProjects } from "@/db/queries";

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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="ck-board rounded-xl p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="ck-kicker text-[#ff8a1e]">Project grill</div>
              <h1 className="ck-display mt-2 text-5xl font-black leading-none text-white">
                Projects
              </h1>
              <p className="mt-2 max-w-2xl text-[#cbb992]">
                Browse active builds looking for collaborators by stack, role,
                timeline, and pay.
              </p>
            </div>
            {session?.user && (
              <Link
                href="/projects/new"
                className="ck-button-primary px-4 py-2"
              >
                + Create project
              </Link>
            )}
          </div>
        </div>
        <div className="mt-8">
          <ProjectSearch projects={projects} initialQuery={params.q ?? ""} />
        </div>
      </div>
    </main>
  );
}
