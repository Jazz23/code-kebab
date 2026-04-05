import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProjectBySlug } from "@/db/queries";
import { JoinRequestForm } from "@/components/join-request-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return { title: `Join ${project.title} - code-kebab` };
}

export default async function JoinProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, session] = await Promise.all([getProjectBySlug(slug), auth()]);

  if (!project) notFound();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/projects/${slug}/join`);
  }

  if (session.user.id === project.ownerId) {
    redirect(`/projects/${slug}`);
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <a
            href={`/projects/${slug}`}
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            &larr; Back to {project.title}
          </a>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Request to join {project.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tell the team about yourself and why you&apos;d be a great fit.
          </p>
        </div>

        <JoinRequestForm
          projectSlug={slug}
          projectTitle={project.title}
          namedRoles={project.roles.map((r) => r.name)}
          openRoles={project.openRoles}
          hasRoles={project.roles.length > 0 || project.openRoles.length > 0}
        />
      </div>
    </main>
  );
}
