"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitJoinRequest } from "@/app/actions/join-request";

type Props = {
  projectSlug: string;
  projectTitle: string;
  namedRoles: string[];
  openRoles: string[];
  hasRoles: boolean;
};

export function JoinRequestForm({
  projectSlug,
  namedRoles,
  openRoles,
  hasRoles,
}: Props) {
  const allRoles = namedRoles.length > 0 ? namedRoles : openRoles;
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function addSocialLink() {
    setSocialLinks((prev) => [...prev, ""]);
  }

  function updateSocialLink(index: number, value: string) {
    setSocialLinks((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe why you want to join.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { redirectTo } = await submitJoinRequest({
        projectSlug,
        roleNames: selectedRoles,
        description,
        socialLinks: socialLinks.filter((l) => l.trim()),
      });
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Role selection */}
      {hasRoles && (
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Which role(s) are you applying for?
          </label>
          <div className="flex flex-col gap-2">
            {allRoles.map((role) => (
              <label
                key={role}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 accent-zinc-900 dark:accent-zinc-50"
                />
                <span className="text-sm text-zinc-800 dark:text-zinc-200">
                  {role}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Why are you a good fit?{" "}
          <span className="font-normal text-zinc-400">(required)</span>
        </label>
        <textarea
          id="description"
          rows={5}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell the team about your background, relevant experience, and what you'd bring to the project..."
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
        />
      </div>

      {/* Social links */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Social links{" "}
          <span className="font-normal text-zinc-400">(GitHub, LinkedIn, optional)</span>
        </label>

        <div className="flex flex-col gap-2">
          {socialLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => updateSocialLink(i, e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
              />
              {socialLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocialLink(i)}
                  className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Remove link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSocialLink}
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-600 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
            aria-label="Add link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Sending…" : "Send Request"}
        </button>
        <a
          href={`/projects/${projectSlug}`}
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
