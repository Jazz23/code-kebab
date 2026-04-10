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
            href="/posts"
            className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-50"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
