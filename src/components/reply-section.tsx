"use client";

import { useState } from "react";
import Link from "next/link";
import { sendDirectMessage } from "@/app/actions/messages";

export function ReplySection({
  applicantName,
  applicantUsername,
}: {
  applicantName: string;
  applicantUsername: string | null;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending || !applicantUsername) return;
    setSending(true);
    setError(null);
    try {
      await sendDirectMessage(applicantUsername, `Re: Join request from ${applicantName}`, message.trim());
      setSent(true);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/50">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clipRule="evenodd"
            />
          </svg>
          <p className="font-medium text-emerald-800 dark:text-emerald-300">Message sent!</p>
        </div>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          Your reply to {applicantName} has been sent.
        </p>
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => {
              setSent(false);
              setMessage("");
            }}
            className="text-xs text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Send another message
          </button>
          <Link
            href="/messages?tab=sent"
            className="text-xs text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            View sent messages →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Reply to {applicantName}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Send a message to let them know your decision or ask for more information.
      </p>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {!applicantUsername && (
        <p className="mt-2 text-xs text-zinc-400">
          This user does not have a username set and cannot receive messages.
        </p>
      )}
      <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3">
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!applicantUsername}
          placeholder={`Hi ${applicantName}, thanks for your interest…`}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
        />
        <div>
          <button
            type="submit"
            disabled={!message.trim() || sending || !applicantUsername}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
