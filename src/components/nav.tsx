import { eq } from "drizzle-orm";
import Link from "next/link";
import { getTotalUnreadCount } from "@/app/actions/messages";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { NavUser } from "./nav-user";
import { NotificationBell } from "./notification-bell";

export async function Nav() {
  const session = await auth();
  const userId = session?.user?.id;
  const sessionName = session?.user?.name?.trim() || null;
  const sessionEmail = session?.user?.email?.trim() || null;

  let username: string | null = null;
  let displayName: string | null = null;
  let initials: string | null = null;
  let unreadCount = 0;

  if (userId) {
    const [row] = await db
      .select({ name: users.name, username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    username = row?.username ?? null;
    displayName = row?.name ?? sessionName ?? row?.username ?? sessionEmail;
    initials = displayName
      ? displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : null;

    unreadCount = await getTotalUnreadCount();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050408]/72 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="whitespace-nowrap text-lg font-black tracking-tight text-white sm:text-xl"
          >
            code<span className="text-[#ff9e2c]">-</span>kebab
          </Link>
          <a
            href="https://github.com/Jazz23/code-kebab"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source on GitHub"
            className="hidden text-[#7a7490] transition-colors hover:text-[#00f0ff] sm:block"
          >
            <span className="sr-only">Source on GitHub</span>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.745 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
        <nav className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] sm:gap-6 sm:text-xs">
          <Link
            href="/projects"
            className="text-[#7a7490] transition-colors hover:text-[#00f0ff]"
          >
            Projects
          </Link>
          <Link
            href="/posts"
            className="text-[#7a7490] transition-colors hover:text-[#00f0ff]"
          >
            Posts
          </Link>
          {userId && displayName && initials ? (
            <>
              <NotificationBell initialUnreadCount={unreadCount} />
              <NavUser
                initials={initials}
                name={displayName}
                profileHref={username ? `/profile/${username}` : null}
              />
            </>
          ) : (
            <Link
              href="/login"
              className="ck-button-secondary px-2.5 py-1.5 sm:px-3"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
