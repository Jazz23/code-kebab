import Link from "next/link";
import { auth } from "@/auth";
import { PostCard } from "@/components/post-card";
import { getPosts } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const [allPosts, session] = await Promise.all([getPosts(), auth()]);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              Posts
            </h1>
            <p className="mt-2 text-sm text-[#aaa3bf]">
              Connect with other coders and find your next collaborator.
            </p>
          </div>
          {session?.user && (
            <Link href="/posts/create" className="ck-button-primary px-4 py-2">
              + Create post
            </Link>
          )}
        </div>

        {allPosts.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[#7a7490]">No posts yet.</p>
            {session?.user && (
              <Link
                href="/posts/create"
                className="mt-4 inline-block text-sm font-medium text-[#00f0ff] underline underline-offset-4"
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
