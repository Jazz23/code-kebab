"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendDirectMessage } from "@/app/actions/messages";

export function PostReplyForm({
  recipientUsername,
  postTitle,
}: {
  recipientUsername: string;
  postTitle: string;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendDirectMessage(
        recipientUsername,
        `Re: ${postTitle}`,
        body.trim(),
      );
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Reply sent!
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your message has been sent to {recipientUsername}.
        </p>
        <button
          type="button"
          onClick={() => router.push("/messages?tab=sent")}
          className="mt-4 text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
        >
          View sent messages
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      <div className="flex items-center gap-3 px-5 py-3.5">
        <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          To
        </span>
        <span className="text-sm text-zinc-900 dark:text-zinc-50">{recipientUsername}</span>
      </div>

      <div className="px-5 py-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your reply…"
          rows={6}
          required
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={!body.trim() || sending}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
          {sending ? "Sending…" : "Send reply"}
        </button>
      </div>
    </form>
  );
}
