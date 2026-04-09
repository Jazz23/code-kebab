import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { MessageCompose } from "@/components/message-compose";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Compose - Messages - code-kebab",
};

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{
    to?: string;
    subject?: string;
    parentMessageId?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { to, subject, parentMessageId } = await searchParams;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/messages"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          &larr; Inbox
        </Link>

        <h1 className="mt-4 mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          New Message
        </h1>

        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <MessageCompose
            initialTo={to ?? ""}
            initialSubject={subject ?? ""}
            parentMessageId={parentMessageId}
          />
        </div>
      </div>
    </main>
  );
}
