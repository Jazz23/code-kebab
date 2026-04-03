import Link from "next/link";

export function Avatar({
  initials,
  username,
  size = "md",
}: {
  initials: string;
  username: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  return (
    <Link
      href={`/profile/${username}`}
      className={`${sizes[size]} inline-flex items-center justify-center rounded-full bg-zinc-900 font-semibold text-white transition-opacity hover:opacity-80 dark:bg-zinc-100 dark:text-zinc-900`}
    >
      {initials}
    </Link>
  );
}
