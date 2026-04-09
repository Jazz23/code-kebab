import Link from "next/link";

type PostCardData = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: Date;
  authorName: string | null;
  authorUsername: string | null;
};

export function PostCard({ post }: { post: PostCardData }) {
  const dateLabel = post.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const snippet =
    post.description.length > 160
      ? post.description.slice(0, 160).trimEnd() + "…"
      : post.description;

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <Link
        href={`/posts/${post.id}`}
        className="absolute inset-0 z-10 rounded-xl"
      >
        <span className="sr-only">{post.title}</span>
      </Link>

      <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
        {post.title}
      </h3>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3">
        {snippet}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-500 dark:text-zinc-500">
        <span>by {post.authorName ?? post.authorUsername ?? "Unknown"}</span>
        <span>&middot;</span>
        <span>{dateLabel}</span>
      </div>
    </div>
  );
}
