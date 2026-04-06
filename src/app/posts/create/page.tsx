import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreatePostForm } from "@/components/create-post-form";

export default async function CreatePostPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create a post
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Connect with other coders, share what you're working on, and find collaborators.
          </p>
        </div>
        <CreatePostForm />
      </div>
    </main>
  );
}
