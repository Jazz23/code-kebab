import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          code-kebab
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/projects"
            className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Projects
          </Link>
          <Link
            href="/profile/alexchen"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            AC
          </Link>
        </nav>
      </div>
    </header>
  );
}
