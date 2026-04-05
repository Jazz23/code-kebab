import Link from "next/link";
import { auth } from "@/auth";
import { getPosts } from "@/db/queries";
import { PostCard } from "@/components/post-card";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const [allPosts, session] = await Promise.all([getPosts(), auth()]);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Posts
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Thoughts, questions, and ideas from the community.
            </p>
          </div>
          {session?.user && (
            <Link
              href="/posts/create"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              + Create post
            </Link>
          )}
        </div>

        {allPosts.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No posts yet.</p>
            {session?.user && (
              <Link
                href="/posts/create"
                className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
              >
                Be the first to post
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
