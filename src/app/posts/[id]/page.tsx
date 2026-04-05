import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPostById } from "@/db/queries";
import { PostReplyForm } from "@/components/post-reply-form";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, session] = await Promise.all([getPostById(id), auth()]);

  if (!post) notFound();

  const currentUserId = session?.user?.id;
  const isAuthor = currentUserId === post.authorId;

  const dateLabel = post.createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/posts"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
          </svg>
          All posts
        </Link>

        {/* Post header */}
        <article>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            {post.authorUsername ? (
              <Link
                href={`/profile/${post.authorUsername}`}
                className="font-medium text-zinc-700 hover:underline dark:text-zinc-300"
              >
                {post.authorName ?? post.authorUsername}
              </Link>
            ) : (
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {post.authorName ?? "Unknown"}
              </span>
            )}
            <span>&middot;</span>
            <span>{dateLabel}</span>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {post.description}
          </p>
        </article>

        {/* Reply section */}
        {!isAuthor && post.authorUsername && (
          <section className="mt-12 border-t border-zinc-200 pt-10 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Reply to {post.authorName ?? post.authorUsername}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your reply will be sent as a direct message.
            </p>
            <div className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              {session?.user ? (
                <PostReplyForm
                  recipientUsername={post.authorUsername}
                  postTitle={post.title}
                />
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50">
                      Sign in
                    </Link>{" "}
                    to reply to this post.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
