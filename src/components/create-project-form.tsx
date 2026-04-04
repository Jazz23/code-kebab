"use client";

import { useRef, useState, useTransition } from "react";
import { createProject } from "@/app/actions/create-project";
import { SUGGESTED_TAGS } from "@/lib/tags";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleEntry = {
  id: string;
  name: string;
  hourlyRate: string;
  salary: string;
};

type MemberEntry = {
  id: string;
  name: string;
  username: string;
  checkState: "idle" | "checking" | "found" | "not-found";
  resolvedUserId?: string;
  resolvedName?: string;
};

type TimelineMode = "none" | "open-ended" | "date";
type RolesMode = "none" | "slots" | "named";

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    input.length > 0
      ? SUGGESTED_TAGS.filter(
          (t) =>
            t.toLowerCase().includes(input.toLowerCase()) &&
            !tags.includes(t),
        ).slice(0, 8)
      : [];

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="relative">
      <div className="flex min-h-10 flex-wrap gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 focus-within:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-zinc-400">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-zinc-400 hover:text-white dark:text-zinc-600 dark:hover:text-zinc-900"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.trim()) addTag(input);
            } else if (e.key === "Backspace" && !input && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          placeholder={tags.length === 0 ? "Type to search or add a tag…" : ""}
          className="min-w-32 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onMouseDown={() => addTag(tag)}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-zinc-500">
        Type to search suggestions, or press Enter to add a custom tag.
      </p>
    </div>
  );
}

// ─── Date picker ──────────────────────────────────────────────────────────────

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
    />
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  onChange,
  onRemove,
}: {
  member: MemberEntry;
  onChange: (m: MemberEntry) => void;
  onRemove: () => void;
}) {
  async function checkUsername() {
    if (!member.username.trim()) return;
    onChange({ ...member, checkState: "checking" });
    try {
      const res = await fetch(
        `/api/users/check?username=${encodeURIComponent(member.username.trim())}`,
      );
      const data = await res.json();
      if (data.exists) {
        onChange({
          ...member,
          checkState: "found",
          resolvedUserId: data.id,
          resolvedName: data.name,
        });
      } else {
        onChange({ ...member, checkState: "not-found", resolvedUserId: undefined });
      }
    } catch {
      onChange({ ...member, checkState: "not-found", resolvedUserId: undefined });
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      {member.checkState !== "found" && (
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={member.name}
              onChange={(e) =>
                onChange({ ...member, name: e.target.value, checkState: "idle" })
              }
              placeholder="Name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            aria-label="Remove member"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={member.username}
            onChange={(e) =>
              onChange({
                ...member,
                username: e.target.value,
                checkState: "idle",
                resolvedUserId: undefined,
              })
            }
            onBlur={checkUsername}
            placeholder="Code Kebab username (optional)"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
          />
          {member.checkState === "checking" && (
            <span className="absolute right-2.5 top-2.5 text-xs text-zinc-400">
              …
            </span>
          )}
          {member.checkState === "found" && (
            <span
              className="absolute right-2.5 top-2.5 text-xs text-green-500"
              title={`Linked to ${member.resolvedName}`}
            >
              ✓
            </span>
          )}
          {member.checkState === "not-found" && (
            <span className="absolute right-2.5 top-2.5 text-xs text-red-400" title="User not found">
              ✗
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={checkUsername}
          disabled={!member.username.trim() || member.checkState === "checking"}
          className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-50"
        >
          Check
        </button>
        {member.checkState === "found" && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            aria-label="Remove member"
          >
            ✕
          </button>
        )}
      </div>

      {member.checkState === "found" && member.resolvedName && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Linked to <strong>{member.resolvedName}</strong> (@{member.username})
        </p>
      )}
      {member.checkState === "not-found" && member.username.trim() && (
        <p className="text-xs text-red-500 dark:text-red-400">
          No user found with username &ldquo;{member.username}&rdquo;. They will be added as a
          guest.
        </p>
      )}
    </div>
  );
}

// ─── Role row ─────────────────────────────────────────────────────────────────

function RoleRow({
  role,
  onChange,
  onRemove,
}: {
  role: RoleEntry;
  onChange: (r: RoleEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="flex gap-2">
        <input
          type="text"
          value={role.name}
          onChange={(e) => onChange({ ...role, name: e.target.value })}
          placeholder="Role name (e.g. Frontend Engineer)"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          aria-label="Remove role"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-zinc-500">
            Hourly rate (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-zinc-400">$</span>
            <input
              type="text"
              value={role.hourlyRate}
              onChange={(e) => onChange({ ...role, hourlyRate: e.target.value })}
              placeholder="0.00/hr"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-6 pr-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-zinc-500">
            Annual salary (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm text-zinc-400">$</span>
            <input
              type="text"
              value={role.salary}
              onChange={(e) => onChange({ ...role, salary: e.target.value })}
              placeholder="0/yr"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-6 pr-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function newRole(): RoleEntry {
  return { id: crypto.randomUUID(), name: "", hourlyRate: "", salary: "" };
}

function newMember(): MemberEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    username: "",
    checkState: "idle",
  };
}

export function CreateProjectForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Core fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Roles
  const [rolesMode, setRolesMode] = useState<RolesMode>("none");
  const [openSlots, setOpenSlots] = useState("");
  const [roles, setRoles] = useState<RoleEntry[]>([newRole()]);

  // Timeline
  const [timelineMode, setTimelineMode] = useState<TimelineMode>("none");
  const [timelineDate, setTimelineDate] = useState("");

  // Members
  const [members, setMembers] = useState<MemberEntry[]>([]);

  function updateMember(id: string, updated: MemberEntry) {
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }

  function updateRole(id: string, updated: RoleEntry) {
    setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        await createProject({
          title: title.trim(),
          description: description.trim(),
          githubUrl: githubUrl.trim() || undefined,
          tags,
          rolesMode,
          openSlots: rolesMode === "slots" ? Number(openSlots) || undefined : undefined,
          roles: rolesMode === "named" ? roles.filter((r) => r.name.trim()) : [],
          timelineMode,
          timelineDate: timelineMode === "date" ? timelineDate : undefined,
          members: members
            .filter((m) => m.name.trim() || m.username.trim())
            .map((m) => ({
              name: m.name,
              username: m.username,
              resolvedUserId: m.resolvedUserId,
            })),
        });
      } catch (err) {
        // Next.js redirect() throws a NEXT_REDIRECT error — rethrow it so the navigation works
        if (
          err instanceof Error &&
          "digest" in err &&
          typeof (err as { digest?: string }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
        ) {
          throw err;
        }
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400";
  const labelClass = "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const sectionClass = "rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950";
  const sectionTitle = "mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Core info */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>Project details</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Project"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you building? Who is it for?"
              rows={4}
              className={`${inputClass} resize-y`}
              required
            />
          </div>
          <div>
            <label className={labelClass}>GitHub URL (optional)</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/you/your-project"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>Timeline (optional)</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["none", "No timeline"],
                ["open-ended", "Open ended"],
                ["date", "End date"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="radio"
                  name="timelineMode"
                  value={value}
                  checked={timelineMode === value}
                  onChange={() => setTimelineMode(value)}
                  className="accent-zinc-900 dark:accent-zinc-50"
                />
                {label}
              </label>
            ))}
          </div>
          {timelineMode === "date" && (
            <div>
              <label className={labelClass}>Target end date</label>
              <DateInput value={timelineDate} onChange={setTimelineDate} />
            </div>
          )}
        </div>
      </div>

      {/* Open roles / member slots */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>Open roles (optional)</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          If omitted, the project will accept an unlimited number of collaborators.
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["none", "Unlimited"],
                ["slots", "Set a number of slots"],
                ["named", "Named roles"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <input
                  type="radio"
                  name="rolesMode"
                  value={value}
                  checked={rolesMode === value}
                  onChange={() => setRolesMode(value)}
                  className="accent-zinc-900 dark:accent-zinc-50"
                />
                {label}
              </label>
            ))}
          </div>

          {rolesMode === "slots" && (
            <div>
              <label className={labelClass}>Number of open slots</label>
              <input
                type="number"
                min={1}
                value={openSlots}
                onChange={(e) => setOpenSlots(e.target.value)}
                placeholder="e.g. 5"
                className="w-32 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400"
              />
            </div>
          )}

          {rolesMode === "named" && (
            <div className="flex flex-col gap-3">
              {roles.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  onChange={(r) => updateRole(role.id, r)}
                  onRemove={() =>
                    setRoles((prev) => prev.filter((r) => r.id !== role.id))
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => setRoles((prev) => [...prev, newRole()])}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
              >
                + Add role
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team members */}
      <div className={sectionClass}>
        <h2 className={sectionTitle}>Existing team members (optional)</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Add people already on the team. Enter a display name and optionally a
          code-kebab username to link their account.
        </p>
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onChange={(m) => updateMember(member.id, m)}
              onRemove={() =>
                setMembers((prev) => prev.filter((m) => m.id !== member.id))
              }
            />
          ))}
          <button
            type="button"
            onClick={() => setMembers((prev) => [...prev, newMember()])}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
          >
            + Add team member
          </button>
        </div>
      </div>

      {/* Error + submit */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <a
          href="/projects"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Creating…" : "Create project"}
        </button>
      </div>
    </form>
  );
}
