"use client";

import { useRef, useState } from "react";
import { updateProfile } from "@/app/actions/update-profile";
import { TagInput } from "@/components/tag-input";
import { SUGGESTED_SKILLS } from "@/lib/skills";

const TIMEZONES = Intl.supportedValuesOf("timeZone");

type SaveStatus = "idle" | "saving" | "saved" | "error";

type UserData = {
  name: string | null;
  username: string | null;
  bio: string | null;
  skills: string[] | null;
  timezone: string | null;
  createdAt: Date | null;
};

export function ProfileEditForm({ user }: { user: UserData }) {
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [skills, setSkills] = useState<string[]>(user.skills ?? []);
  const [timezone, setTimezone] = useState(user.timezone ?? "");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const stateRef = useRef({ name, bio, skills, timezone });

  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function scheduleSave(overrides?: Partial<typeof stateRef.current>) {
    const latest = { ...stateRef.current, ...overrides };
    stateRef.current = latest;
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    setSaveError(null);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateProfile({
          name: latest.name,
          bio: latest.bio,
          skills: latest.skills,
          timezone: latest.timezone,
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        setSaveStatus("error");
        setSaveError(err instanceof Error ? err.message : "Failed to save");
      }
    }, 1200);
  }

  function handleNameChange(v: string) {
    setName(v);
    stateRef.current.name = v;
    scheduleSave({ name: v });
  }
  function handleBioChange(v: string) {
    setBio(v);
    stateRef.current.bio = v;
    scheduleSave({ bio: v });
  }
  function handleSkillsChange(v: string[]) {
    setSkills(v);
    stateRef.current.skills = v;
    scheduleSave({ skills: v });
  }
  function handleTimezoneChange(v: string) {
    setTimezone(v);
    stateRef.current.timezone = v;
    scheduleSave({ timezone: v });
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-400";

  if (!editing) {
    return (
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {name || "(no name)"}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">@{user.username}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
            >
              Edit profile
            </button>
          </div>
          {bio && (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {bio}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {skill}
              </span>
            ))}
          </div>
          {timezone && (
            <p className="mt-2 text-xs text-zinc-400">
              Timezone: {timezone}
            </p>
          )}
          {user.createdAt && (
            <p className="mt-1 text-xs text-zinc-400">
              Joined {user.createdAt.toLocaleDateString("en-US", { timeZone: "UTC" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Edit profile
          </h2>
          <div className="flex items-center gap-3">
            {saveStatus !== "idle" && (
              <span
                className={`text-sm ${
                  saveStatus === "saving"
                    ? "text-zinc-500 dark:text-zinc-400"
                    : saveStatus === "saved"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                }`}
              >
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                    Saving…
                  </span>
                )}
                {saveStatus === "saved" && "✓ Saved"}
                {saveStatus === "error" && (saveError ?? "Failed to save")}
              </span>
            )}
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
            >
              Done
            </button>
          </div>
        </div>

        <p className="mt-1 text-sm text-zinc-500">@{user.username}</p>

        <div className="mt-4 flex flex-col gap-4 max-w-xl">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => handleBioChange(e.target.value)}
              placeholder="Tell people a bit about yourself…"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Skills
            </label>
            <TagInput
              tags={skills}
              onChange={handleSkillsChange}
              suggestions={SUGGESTED_SKILLS}
              placeholder="Type to search or add a skill…"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {timezone && (
          <p className="mt-2 text-xs text-zinc-400">
            Timezone: {timezone}
          </p>
        )}
        {user.createdAt && (
          <p className="mt-1 text-xs text-zinc-400">
            Joined {user.createdAt.toLocaleDateString("en-US", { timeZone: "UTC" })}
          </p>
        )}
      </div>
    </div>
  );
}
