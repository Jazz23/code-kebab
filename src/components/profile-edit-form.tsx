"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  socialLinks: string[] | null;
  emailNotifications: boolean;
  createdAt: Date | null;
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function ProfileEditForm({ user }: { user: UserData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [skills, setSkills] = useState<string[]>(user.skills ?? []);
  const [timezone, setTimezone] = useState(user.timezone ?? "");
  const [timezoneSearch, setTimezoneSearch] = useState(user.timezone ?? "");
  const [showTzSuggestions, setShowTzSuggestions] = useState(false);
  const [socialLinks, setSocialLinks] = useState<string[]>(
    user.socialLinks?.length ? user.socialLinks : [""],
  );
  const [emailNotifications, setEmailNotifications] = useState(
    user.emailNotifications,
  );
  const [usernameInput, setUsernameInput] = useState(user.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameHint, setUsernameHint] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const usernameCheckTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const usernameStatusRef = useRef<UsernameStatus>("idle");
  const savedUsernameRef = useRef<string>(user.username ?? "");
  const stateRef = useRef({ name, bio, skills, timezone, socialLinks, emailNotifications, username: user.username ?? "" });

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
        const payload: Parameters<typeof updateProfile>[0] = {
          name: latest.name,
          bio: latest.bio,
          skills: latest.skills,
          timezone: latest.timezone,
          socialLinks: latest.socialLinks.filter((l) => l.trim()),
          emailNotifications: latest.emailNotifications,
        };
        if (
          usernameStatusRef.current === "available" &&
          latest.username !== user.username
        ) {
          payload.username = latest.username;
        }
        const result = await updateProfile(payload);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
        if (payload.username) {
          savedUsernameRef.current = payload.username;
        }
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
    setTimezoneSearch(v);
    stateRef.current.timezone = v;
    scheduleSave({ timezone: v });
  }

  function addSocialLink() {
    const next = [...socialLinks, ""];
    setSocialLinks(next);
    stateRef.current.socialLinks = next;
    scheduleSave({ socialLinks: next });
  }
  function updateSocialLink(index: number, value: string) {
    const next = socialLinks.map((l, i) => (i === index ? value : l));
    setSocialLinks(next);
    stateRef.current.socialLinks = next;
    scheduleSave({ socialLinks: next });
  }
  function removeSocialLink(index: number) {
    const next = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(next);
    stateRef.current.socialLinks = next;
    scheduleSave({ socialLinks: next });
  }

  function handleEmailNotificationsChange(v: boolean) {
    setEmailNotifications(v);
    stateRef.current.emailNotifications = v;
    scheduleSave({ emailNotifications: v });
  }

  function handleUsernameChange(v: string) {
    setUsernameInput(v);
    stateRef.current.username = v;
    clearTimeout(usernameCheckTimerRef.current);

    if (v === user.username) {
      usernameStatusRef.current = "idle";
      setUsernameStatus("idle");
      setUsernameHint(null);
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(v)) {
      usernameStatusRef.current = "invalid";
      setUsernameStatus("invalid");
      setUsernameHint(
        v.length > 0 && v.length < 3
          ? "Too short — minimum 3 characters"
          : v.length > 20
            ? "Too long — maximum 20 characters"
            : "Letters, numbers, underscores, and hyphens only",
      );
      return;
    }

    usernameStatusRef.current = "checking";
    setUsernameStatus("checking");
    setUsernameHint(null);

    usernameCheckTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/users/check?username=${encodeURIComponent(v)}`,
        );
        const data = await res.json();
        if (data.exists) {
          usernameStatusRef.current = "taken";
          setUsernameStatus("taken");
          setUsernameHint("Username is already taken");
        } else {
          usernameStatusRef.current = "available";
          setUsernameStatus("available");
          setUsernameHint("Available");
          scheduleSave({ username: v });
        }
      } catch {
        usernameStatusRef.current = "idle";
        setUsernameStatus("idle");
        setUsernameHint(null);
      }
    }, 500);
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {name || "(no name)"}
            </h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
            >
              Edit profile
            </button>
          </div>
          <p className="mt-1 text-sm text-zinc-500">@{usernameInput || user.username}</p>
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
          {socialLinks.filter((l) => l.trim()).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {socialLinks
                .filter((l) => l.trim())
                .map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    {new URL(link).hostname.replace(/^www\./, "")}
                  </a>
                ))}
            </div>
          )}
          {timezone && (
            <p className="mt-2 text-xs text-zinc-400">Timezone: {timezone}</p>
          )}
          {user.createdAt && (
            <p className="mt-1 text-xs text-zinc-400">
              Joined{" "}
              {user.createdAt.toLocaleDateString("en-US", { timeZone: "UTC" })}
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
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Edit profile
          </h2>
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
              onClick={() => {
                setEditing(false);
                if (savedUsernameRef.current !== user.username) {
                  router.replace(`/profile/${savedUsernameRef.current}`);
                }
              }}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
            >
              Done
            </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 max-w-xl">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-400">
                @
              </span>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="username"
                className={`${inputClass} pl-7 pr-8`}
              />
              {usernameStatus === "checking" && (
                <span className="absolute inset-y-0 right-3 flex items-center">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                </span>
              )}
              {usernameStatus === "available" && (
                <span className="absolute inset-y-0 right-3 flex items-center text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                <span className="absolute inset-y-0 right-3 flex items-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </span>
              )}
            </div>
            {usernameHint && (
              <p
                className={`mt-1 text-xs ${
                  usernameStatus === "available"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {usernameHint}
              </p>
            )}
          </div>

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

          <div className="relative">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Timezone
            </label>
            <input
              type="text"
              value={timezoneSearch}
              onChange={(e) => {
                const v = e.target.value;
                setTimezoneSearch(v);
                setShowTzSuggestions(true);
                if (v === "") handleTimezoneChange("");
              }}
              onFocus={() => setShowTzSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTzSuggestions(false), 150)}
              placeholder="Search or enter a timezone…"
              className={inputClass}
            />
            {showTzSuggestions && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {(timezoneSearch.length > 0
                  ? TIMEZONES.filter((tz) =>
                      tz.toLowerCase().includes(timezoneSearch.toLowerCase()),
                    )
                  : TIMEZONES
                ).slice(0, 10)
                  .map((tz) => (
                    <li key={tz}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          handleTimezoneChange(tz);
                          setShowTzSuggestions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        {tz}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Social links{" "}
              <span className="font-normal text-zinc-400">
                (GitHub, LinkedIn, portfolio…)
              </span>
            </label>
            <div className="flex flex-col gap-2">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateSocialLink(i, e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email notifications
              </p>
              <p className="text-xs text-zinc-400">
                Receive emails for join requests and other activity
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={emailNotifications}
              onClick={() => handleEmailNotificationsChange(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                emailNotifications
                  ? "bg-zinc-900 dark:bg-zinc-100"
                  : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ${
                  emailNotifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {timezone && (
          <p className="mt-2 text-xs text-zinc-400">Timezone: {timezone}</p>
        )}
        {user.createdAt && (
          <p className="mt-1 text-xs text-zinc-400">
            Joined{" "}
            {user.createdAt.toLocaleDateString("en-US", { timeZone: "UTC" })}
          </p>
        )}
      </div>
    </div>
  );
}
