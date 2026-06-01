import Link from "next/link";
import { auth } from "@/auth";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const [allPosts, session] = await Promise.all([getPosts(), auth()]);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="ck-board rounded-xl p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="ck-kicker text-[#ff8a1e]">Collab calls</div>
              <h1 className="ck-display mt-2 text-5xl font-black leading-none text-white">
                Posts
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cbb992]">
                Find developers with an idea, a half-built prototype, or the
                missing piece for your next build.
              </p>
            </div>
            {session?.user && (
              <Link
                href="/posts/create"
                className="ck-button-primary px-4 py-2"
              >
                + Create post
              </Link>
            )}
          </div>
        </div>

        {allPosts.length === 0 ? (
          <div className="ck-panel mt-10 rounded-xl p-8 text-center">
            <p className="text-[#a89778]">No posts yet.</p>
            {session?.user && (
              <Link
                href="/posts/create"
                className="mt-4 inline-block text-sm font-medium text-[#ffbf75] underline underline-offset-4"
              >
                Be the first to post
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
