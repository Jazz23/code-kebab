"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export function NavUser({
  initials,
  name,
  profileHref,
}: {
  initials: string;
  name: string;
  profileHref: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={name}
        className={
          mounted
            ? "flex items-center gap-2 transition-opacity hover:opacity-80"
            : "flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white transition-opacity hover:opacity-80 dark:bg-zinc-100 dark:text-zinc-900"
        }
      >
        {mounted ? (
          <>
            <span className="max-w-32 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {name}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              {initials}
            </span>
          </>
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950">
          {profileHref ? (
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Profile
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
