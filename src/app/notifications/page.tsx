import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getNotifications } from "@/app/actions/notifications";
import { NotificationsList } from "@/components/notifications-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications - code-kebab",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await getNotifications();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              &larr; Home
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Notifications
            </h1>
          </div>
        </div>

        <NotificationsList initialNotifications={notifications} />
      </div>
    </main>
  );
}
