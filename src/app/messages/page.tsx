import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getNotifications } from "@/app/actions/notifications";
import { getInboxMessages, getSentMessages } from "@/app/actions/messages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages - code-kebab",
};

function formatDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  const isThisYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  });
}

type Notif = Awaited<ReturnType<typeof getNotifications>>[number];

function notifPreviewText(notif: Notif): { from: string; subject: string; preview: string } {
  if (notif.type === "join_request" && notif.joinRequest) {
    const { applicantName, projectTitle, roleNames } = notif.joinRequest;
    const name = applicantName ?? "Someone";
    const subject =
      roleNames && roleNames.length > 0
        ? `Join request: ${roleNames.join(", ")} · ${projectTitle}`
        : `Join request · ${projectTitle}`;
    return { from: name, subject, preview: `${name} wants to join ${projectTitle}` };
  }
  if (notif.type === "join_request_denied" && notif.joinRequest) {
    return {
      from: "System",
      subject: `Request denied · ${notif.joinRequest.projectTitle}`,
      preview: `Your request to join ${notif.joinRequest.projectTitle} was denied`,
    };
  }
  return { from: "System", subject: "Notification", preview: "View details" };
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab } = await searchParams;
  const isSent = tab === "sent";

  const [notifications, inboxMessages, sentMessages] = await Promise.all([
    isSent ? Promise.resolve([]) : getNotifications(),
    isSent ? Promise.resolve([]) : getInboxMessages(),
    isSent ? getSentMessages() : Promise.resolve([]),
  ]);

  const unreadInboxCount =
    notifications.filter((n) => !n.read).length +
    inboxMessages.filter((m) => !m.read).length;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              &larr; Home
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Messages</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/messages"
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              !isSent
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            Inbox
            {unreadInboxCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold leading-none text-white">
                {unreadInboxCount}
              </span>
            )}
          </Link>
          <Link
            href="/messages?tab=sent"
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              isSent
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            Sent
          </Link>
        </div>

        {/* Inbox */}
        {!isSent && (
          <>
            {notifications.length === 0 && inboxMessages.length === 0 ? (
              <EmptyState label="Your inbox is empty" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                {/* System notifications */}
                {notifications.map((notif, i) => {
                  const { from, subject, preview } = notifPreviewText(notif);
                  const isUnread = !notif.read;
                  const isDenied = notif.type === "join_request_denied";
                  return (
                    <Link
                      key={notif.id}
                      href={`/messages/system/${notif.id}`}
                      className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                        i !== 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""
                      } ${isUnread ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                            )}
                            <span
                              className={`truncate text-sm ${isUnread ? "font-semibold text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}
                            >
                              {from}
                            </span>
                            <span
                              className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                isDenied
                                  ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                                  : "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                              }`}
                            >
                              System
                            </span>
                          </div>
                          <span className="shrink-0 text-xs text-zinc-400">
                            {formatDate(new Date(notif.createdAt))}
                          </span>
                        </div>
                        <p
                          className={`mt-0.5 truncate text-sm ${isUnread ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}
                        >
                          {subject}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">{preview}</p>
                      </div>
                    </Link>
                  );
                })}

                {/* Direct messages */}
                {inboxMessages.map((msg, i) => {
                  const idx = notifications.length + i;
                  const isUnread = !msg.read;
                  const initials = (msg.senderName ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <Link
                      key={msg.id}
                      href={`/messages/${msg.id}`}
                      className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                        idx !== 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""
                      } ${isUnread ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                            )}
                            <span
                              className={`truncate text-sm ${isUnread ? "font-semibold text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}
                            >
                              {msg.senderName}
                              {msg.senderUsername && (
                                <span className="ml-1 font-normal text-zinc-400">
                                  @{msg.senderUsername}
                                </span>
                              )}
                            </span>
                          </div>
                          <span className="shrink-0 text-xs text-zinc-400">
                            {formatDate(new Date(msg.createdAt))}
                          </span>
                        </div>
                        <p
                          className={`mt-0.5 truncate text-sm ${isUnread ? "font-medium text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}
                        >
                          {msg.subject}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {msg.content.slice(0, 100)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Sent */}
        {isSent && (
          <>
            {sentMessages.length === 0 ? (
              <EmptyState label="No sent messages" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                {sentMessages.map((msg, i) => {
                  const initials = (msg.recipientName ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <Link
                      key={msg.id}
                      href={`/messages/${msg.id}`}
                      className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                        i !== 0 ? "border-t border-zinc-100 dark:border-zinc-800" : ""
                      }`}
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                            To: {msg.recipientName}
                            {msg.recipientUsername && (
                              <span className="ml-1 text-zinc-400">@{msg.recipientUsername}</span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs text-zinc-400">
                            {formatDate(new Date(msg.createdAt))}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
                          {msg.subject}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {msg.content.slice(0, 100)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
        />
      </svg>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}
