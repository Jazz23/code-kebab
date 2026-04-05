import Link from "next/link";

export function JoinRequestButton({ projectSlug }: { projectSlug: string }) {
  return (
    <Link
      href={`/projects/${projectSlug}/join`}
      className="block w-full rounded-xl bg-zinc-900 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      Request to Join
    </Link>
  );
}
