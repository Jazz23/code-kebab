import { getProjects } from "@/db/queries";
import { ProjectCard } from "@/components/project-card";

export const metadata = {
  title: "Projects - code-kebab",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Projects
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Browse open projects looking for collaborators.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
