"use client";

import { useState } from "react";

export function JoinRequestButton({ projectTitle }: { projectTitle: string }) {
  const [state, setState] = useState<"idle" | "form" | "sent">("idle");
  const [message, setMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/50">
        <p className="font-medium text-emerald-800 dark:text-emerald-300">
          Request sent!
        </p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          The project owner will review your request to join {projectTitle}.
        </p>
      </div>
    );
  }

  if (state === "form") {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Request to join {projectTitle}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setState("sent");
          }}
          className="mt-4 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Which role are you interested in?
            </label>
            <input
              id="role"
              type="text"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Why do you want to join?
            </label>
            <textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the team a bit about yourself and what you'd bring to the project..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Send Request
            </button>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setState("form")}
      className="w-full rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      Request to Join
    </button>
  );
}
