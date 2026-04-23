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
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Projects
            </h1>
            <p className="mt-2 text-[#aaa3bf]">
              Browse projects looking for collaborators.
            </p>
          </div>
          {session?.user && (
            <Link href="/projects/new" className="ck-button-primary px-4 py-2">
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
