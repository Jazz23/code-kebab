import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getMessage, markMessageRead } from "@/app/actions/messages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const msg = await getMessage(id);
  if (!msg) return { title: "Messages - code-kebab" };
  return { title: `${msg.subject} - Messages - code-kebab` };
}

export default async function EmailViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const msg = await getMessage(id);
  if (!msg) notFound();

  if (!msg.isFromMe && !msg.read) {
    await markMessageRead(id);
  }

  const backHref = msg.isFromMe ? "/messages?tab=sent" : "/messages";
  const replySubject = msg.subject.startsWith("Re: ") ? msg.subject : `Re: ${msg.subject}`;
  const replyHref = msg.senderUsername
    ? `/messages/compose?to=${encodeURIComponent(msg.senderUsername)}&subject=${encodeURIComponent(replySubject)}`
    : null;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href={backHref}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          &larr; {msg.isFromMe ? "Sent" : "Inbox"}
        </Link>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {/* Email header */}
          <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{msg.subject}</h1>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="w-12 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  From
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {msg.senderName}
                  {msg.senderUsername && (
                    <span className="ml-1.5 text-zinc-400">
                      &lt;@{msg.senderUsername}&gt;
                    </span>
                  )}
                </span>
                {msg.senderUsername && !msg.isFromMe && (
                  <Link
                    href={`/profile/${msg.senderUsername}`}
                    className="ml-auto shrink-0 text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                  >
                    View profile →
                  </Link>
                )}
              </div>

              <div className="flex items-baseline gap-2 text-sm">
                <span className="w-12 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  To
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {msg.recipientName}
                  {msg.recipientUsername && (
                    <span className="ml-1.5 text-zinc-400">
                      &lt;@{msg.recipientUsername}&gt;
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-baseline gap-2 text-sm">
                <span className="w-12 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Date
                </span>
                <span className="text-zinc-500">
                  {new Date(msg.createdAt).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="px-6 py-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {msg.content}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          {!msg.isFromMe && replyHref && (
            <Link
              href={replyHref}
              className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z"
                  clipRule="evenodd"
                />
              </svg>
              Reply
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
