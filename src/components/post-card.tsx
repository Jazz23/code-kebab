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
    <div className="ck-panel group relative flex min-h-[230px] flex-col gap-4 overflow-hidden rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#ff8a1e]/40">
      <Link
        href={`/posts/${post.id}`}
        className="absolute inset-0 z-10 rounded-xl"
      >
        <span className="sr-only">{post.title}</span>
      </Link>

      <div className="flex items-center justify-between border-b border-[#f1e6d2]/10 pb-3">
        <span className="ck-kicker text-[#ff8a1e]">Collab post</span>
        <span className="ck-kicker text-[#8d8b82]">{dateLabel}</span>
      </div>

      <h3 className="ck-display text-2xl font-black leading-6 text-white transition-colors group-hover:text-[#ffbf75]">
        {post.title}
      </h3>

      <p className="line-clamp-3 text-sm leading-relaxed text-[#cbb992]">
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

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[#f1e6d2]/10 pt-3 font-mono text-[11px] text-[#a89778]">
        <span>by {post.authorName ?? post.authorUsername ?? "Unknown"}</span>
      </div>
    </div>
  );
}
