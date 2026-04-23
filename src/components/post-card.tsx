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
      ? `${post.description.slice(0, 160).trimEnd()}…`
      : post.description;

  return (
    <div className="ck-panel group relative flex flex-col gap-3 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1">
      <Link
        href={`/posts/${post.id}`}
        className="absolute inset-0 z-10 rounded-2xl"
      >
        <span className="sr-only">{post.title}</span>
      </Link>

      <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#bffbff]">
        {post.title}
      </h3>

      <p className="line-clamp-3 text-sm leading-relaxed text-[#aaa3bf]">
        {snippet}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="ck-chip rounded-md px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 font-mono text-[11px] text-[#7a7490]">
        <span>by {post.authorName ?? post.authorUsername ?? "Unknown"}</span>
        <span>&middot;</span>
        <span>{dateLabel}</span>
      </div>
    </div>
  );
}
