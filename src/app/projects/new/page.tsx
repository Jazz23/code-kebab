import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateProjectForm } from "@/components/create-project-form";

export const metadata = {
  title: "Create Project - code-kebab",
};

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Create a project
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Share what you&apos;re building and find collaborators.
          </p>
        </div>
        <CreateProjectForm />
      </div>
    </main>
  );
}
