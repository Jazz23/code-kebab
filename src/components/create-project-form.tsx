"use client";

import { useRef, useState, useTransition } from "react";
import { createProject } from "@/app/actions/create-project";
import { updateProject } from "@/app/actions/update-project";
import { deleteProject } from "@/app/actions/delete-project";
import { SUGGESTED_TAGS } from "@/lib/tags";
import { TagInput } from "@/components/tag-input";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleEntry = {
  id: string;
  name: string;
  hourlyRate: string;
  salary: string;
  difficulty: "" | "beginner" | "intermediate" | "advanced";
};

type MemberEntry = {
  id: string;
  name: string;
  username: string;
  checkState: "idle" | "checking" | "found" | "not-found";
  resolvedUserId?: string;
  resolvedName?: string;
};

type TimelineMode = "none" | "date";
type RolesMode = "none" | "slots" | "named";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export type ProjectFormInitialData = {
  projectId: string;
  title: string;
  description: string;
  githubUrl: string;
  tags: string[];
  rolesMode: RolesMode;
  openSlots: string;
  roles: RoleEntry[];
  timelineMode: TimelineMode;
  timelineDate: string;
  members: MemberEntry[];
};

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
      <div>
        <label className="mb-1 block text-xs text-zinc-500">
          Difficulty (optional)
        </label>
        <div className="flex gap-3">
          {(["", "beginner", "intermediate", "advanced"] as const).map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"
            >
              <input
                type="radio"
                name={`difficulty-${role.id}`}
                value={level}
                checked={role.difficulty === level}
                onChange={() => onChange({ ...role, difficulty: level })}
                className="accent-zinc-900 dark:accent-zinc-50"
              />
              {level === "" ? "None" : level.charAt(0).toUpperCase() + level.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

function newRole(): RoleEntry {
  return { id: crypto.randomUUID(), name: "", hourlyRate: "", salary: "", difficulty: "" };
}

function newMember(): MemberEntry {
  return {
    id: crypto.randomUUID(),
    name: "",
    username: "",
    checkState: "idle",
  };
}

export function CreateProjectForm({
  mode = "create",
  initialData,
}: {
  mode?: "create" | "edit";
  initialData?: ProjectFormInitialData;
} = {}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Core fields
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl ?? "");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);

  // Roles
  const [rolesMode, setRolesMode] = useState<RolesMode>(initialData?.rolesMode ?? "none");
  const [openSlots, setOpenSlots] = useState(initialData?.openSlots ?? "");
  const [roles, setRoles] = useState<RoleEntry[]>(initialData?.roles ?? [newRole()]);

  // Timeline
  const [timelineMode, setTimelineMode] = useState<TimelineMode>(initialData?.timelineMode ?? "none");
  const [timelineDate, setTimelineDate] = useState(initialData?.timelineDate ?? "");

  // Members
  const [members, setMembers] = useState<MemberEntry[]>(initialData?.members ?? []);

  // Auto-save refs
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stateRef = useRef({
    title, description, githubUrl, tags, rolesMode, openSlots, roles, timelineMode, timelineDate, members,
  });

  function updateStateRef() {
    stateRef.current = {
      title, description, githubUrl, tags, rolesMode, openSlots, roles, timelineMode, timelineDate, members,
    };
  }

  function scheduleSave(overrides?: Partial<typeof stateRef.current>) {
    if (mode !== "edit" || !initialData?.projectId) return;
    const latest = { ...stateRef.current, ...overrides };
    stateRef.current = latest;
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateProject(initialData.projectId, {
          title: latest.title.trim(),
          description: latest.description.trim(),
          githubUrl: latest.githubUrl.trim() || undefined,
          tags: latest.tags,
          rolesMode: latest.rolesMode,
          openSlots: latest.rolesMode === "slots" ? Number(latest.openSlots) || undefined : undefined,
          roles: latest.rolesMode === "named" ? latest.roles.filter((r) => r.name.trim()).map((r) => ({ ...r, difficulty: r.difficulty || undefined })) : [],
          timelineMode: latest.timelineMode,
          timelineDate: latest.timelineMode === "date" ? latest.timelineDate : undefined,
          members: latest.members
            .filter((m) => m.name.trim() || m.username.trim())
            .map((m) => ({
              name: m.name,
              username: m.username,
              resolvedUserId: m.resolvedUserId,
            })),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 1200);
  }

  // Wrappers that update stateRef then schedule save
  function handleTitleChange(v: string) {
    setTitle(v);
    updateStateRef();
    scheduleSave({ title: v });
  }
  function handleDescriptionChange(v: string) {
    setDescription(v);
    updateStateRef();
    scheduleSave({ description: v });
  }
  function handleGithubUrlChange(v: string) {
    setGithubUrl(v);
    updateStateRef();
    scheduleSave({ githubUrl: v });
  }
  function handleTagsChange(v: string[]) {
    setTags(v);
    updateStateRef();
    scheduleSave({ tags: v });
  }
  function handleTimelineModeChange(v: TimelineMode) {
    setTimelineMode(v);
    updateStateRef();
    scheduleSave({ timelineMode: v });
  }
  function handleTimelineDateChange(v: string) {
    setTimelineDate(v);
    updateStateRef();
    scheduleSave({ timelineDate: v });
  }
  function handleRolesModeChange(v: RolesMode) {
    setRolesMode(v);
    updateStateRef();
    scheduleSave({ rolesMode: v });
  }
  function handleOpenSlotsChange(v: string) {
    setOpenSlots(v);
    updateStateRef();
    scheduleSave({ openSlots: v });
  }
  function handleRolesChange(v: RoleEntry[]) {
    setRoles(v);
    updateStateRef();
    scheduleSave({ roles: v });
  }
  function handleMembersChange(v: MemberEntry[]) {
    setMembers(v);
    updateStateRef();
    scheduleSave({ members: v });
  }

  function updateMember(id: string, updated: MemberEntry) {
    const next = members.map((m) => (m.id === id ? updated : m));
    handleMembersChange(next);
  }

  function updateRole(id: string, updated: RoleEntry) {
    const next = roles.map((r) => (r.id === id ? updated : r));
    handleRolesChange(next);
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
          roles: rolesMode === "named" ? roles.filter((r) => r.name.trim()).map((r) => ({ ...r, difficulty: r.difficulty || undefined })) : [],
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

  async function handleDelete() {
    if (!initialData?.projectId) return;
    setIsDeleting(true);
    try {
      await deleteProject(initialData.projectId);
    } catch (err) {
      if (
        err instanceof Error &&
        "digest" in err &&
        typeof (err as { digest?: string }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400";
  const labelClass = "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const sectionClass = "rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950";
  const sectionTitle = "mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50";

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Save status indicator (edit mode) */}
        {mode === "edit" && saveStatus !== "idle" && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
              saveStatus === "saving"
                ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                : saveStatus === "saved"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {saveStatus === "saving" && (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                Saving…
              </>
            )}
            {saveStatus === "saved" && <>&#10003; Saved</>}
            {saveStatus === "error" && <>&#x26A0; Failed to save</>}
          </div>
        )}

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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Awesome Project"
                className={inputClass}
                required={mode === "create"}
              />
            </div>
            <div>
              <label className={labelClass}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="What are you building? Who is it for?"
                rows={4}
                className={`${inputClass} resize-y`}
                required={mode === "create"}
              />
            </div>
            <div>
              <label className={labelClass}>GitHub URL (optional)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => handleGithubUrlChange(e.target.value)}
                placeholder="https://github.com/you/your-project"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tags</label>
              <TagInput tags={tags} onChange={handleTagsChange} suggestions={SUGGESTED_TAGS} />
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
                    onChange={() => handleTimelineModeChange(value)}
                    className="accent-zinc-900 dark:accent-zinc-50"
                  />
                  {label}
                </label>
              ))}
            </div>
            {timelineMode === "date" && (
              <div>
                <label className={labelClass}>Target end date</label>
                <DateInput value={timelineDate} onChange={handleTimelineDateChange} />
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
                    onChange={() => handleRolesModeChange(value)}
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
                  onChange={(e) => handleOpenSlotsChange(e.target.value)}
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
                    onRemove={() => handleRolesChange(roles.filter((r) => r.id !== role.id))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleRolesChange([...roles, newRole()])}
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
                onRemove={() => handleMembersChange(members.filter((m) => m.id !== member.id))}
              />
            ))}
            <button
              type="button"
              onClick={() => handleMembersChange([...members, newMember()])}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
            >
              + Add team member
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Create mode: submit buttons */}
        {mode === "create" && (
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
        )}

        {/* Edit mode: delete button */}
        {mode === "edit" && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-400 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Delete project
            </button>
          </div>
        )}
      </form>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Delete project?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This will permanently delete the project and all its data. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
