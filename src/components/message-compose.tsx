"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendDirectMessage } from "@/app/actions/messages";

export function MessageCompose({
  initialTo = "",
  initialSubject = "",
  parentMessageId,
}: {
  initialTo?: string;
  initialSubject?: string;
  parentMessageId?: string;
}) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendDirectMessage(
        to.trim(),
        subject.trim(),
        body.trim(),
        parentMessageId,
      );
      router.push("/messages?tab=sent");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800"
    >
      {/* To */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <label className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          To
        </label>
        <input
          type="text"
          value={to}
          readOnly
          required
          className="flex-1 bg-transparent text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
        />
      </div>

      {/* Subject */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <label className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="(no subject)"
          className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          rows={12}
          required
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
        <button
          type="submit"
          disabled={!to.trim() || !body.trim() || sending}
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
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
