import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getNotificationById, markNotificationRead } from "@/app/actions/notifications";
import { ReplySection } from "@/components/reply-section";
import { JoinRequestActions } from "@/components/join-request-actions";

export const dynamic = "force-dynamic";

export default async function SystemMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notif = await getNotificationById(id);
  if (!notif) notFound();

  if (!notif.read) {
    await markNotificationRead(id);
  }

  if (notif.type === "join_request") {
    const jr = notif.joinRequest;
    if (!jr) notFound();

    const profileHref = jr.applicantUsername ? `/profile/${jr.applicantUsername}` : null;

    return (
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href="/messages"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            &larr; Back to messages
          </Link>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  Join Request
                </span>
                <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {jr.applicantName ?? "Someone"} wants to join{" "}
                  <Link
                    href={`/projects/${jr.projectSlug}`}
                    className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                  >
                    {jr.projectTitle}
                  </Link>
                </h1>
              </div>
              <p className="shrink-0 text-xs text-zinc-400">
                {new Date(jr.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Applicant */}
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {(jr.applicantName ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {jr.applicantName ?? "Unknown user"}
                </p>
                {profileHref && (
                  <Link
                    href={profileHref}
                    className="text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View profile →
                  </Link>
                )}
              </div>
            </div>

            {/* Roles */}
            {jr.roleNames && jr.roleNames.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Applying for
                </h2>
                <div className="flex flex-wrap gap-2">
                  {jr.roleNames.map((role, i) => (
                    <span
                      key={`${role}-${i}`}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                About them
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {jr.description}
              </p>
            </div>

            {/* Social links */}
            {jr.socialLinks && jr.socialLinks.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Links
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {jr.socialLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4 shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
                            clipRule="evenodd"
                          />
                          <path
                            fillRule="evenodd"
                            d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6">
            <JoinRequestActions
              joinRequestId={jr.id}
              initialStatus={jr.status as "pending" | "accepted" | "rejected"}
            />
          </div>

          {/* Reply section */}
          {jr.status === "pending" && (
            <div className="mt-4">
              <ReplySection
                applicantName={jr.applicantName ?? "the applicant"}
                applicantUsername={jr.applicantUsername ?? null}
              />
            </div>
          )}
        </div>
      </main>
    );
  }

  if (notif.type === "join_request_denied") {
    const jr = notif.joinRequest;
    if (!jr) notFound();

    return (
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Link
            href="/messages"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            &larr; Back to messages
          </Link>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                  Request Denied
                </span>
                <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Your request to join{" "}
                  <Link
                    href={`/projects/${jr.projectSlug}`}
                    className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                  >
                    {jr.projectTitle}
                  </Link>{" "}
                  was denied
                </h1>
              </div>
              <p className="shrink-0 text-xs text-zinc-400">
                {new Date(jr.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              The project owner reviewed your application and decided not to move forward at this
              time.
            </p>

            {jr.roleNames && jr.roleNames.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  You applied for
                </h2>
                <div className="flex flex-wrap gap-2">
                  {jr.roleNames.map((role, i) => (
                    <span
                      key={`${role}-${i}`}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/messages"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          &larr; Back to messages
        </Link>
        <p className="mt-8 text-zinc-500">Unknown notification type.</p>
      </div>
    </main>
  );
}
