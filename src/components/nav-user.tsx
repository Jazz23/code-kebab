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
            : "flex h-8 w-8 items-center justify-center rounded-full bg-[#00f0ff] text-xs font-semibold text-[#050408] transition-opacity hover:opacity-80"
        }
      >
        {mounted ? (
          <>
            <span className="max-w-32 truncate text-sm font-medium normal-case tracking-normal text-[#c6c0da]">
              {name}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00f0ff] text-xs font-semibold text-[#050408] shadow-[0_0_18px_rgba(0,240,255,0.22)]">
              {initials}
            </span>
          </>
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="ck-panel absolute right-0 mt-2 w-40 rounded-lg py-1">
          {profileHref ? (
            <Link
              href={profileHref}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-[#c6c0da] hover:bg-white/[0.04] hover:text-white"
            >
              Profile
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-2 text-left text-sm text-[#c6c0da] hover:bg-white/[0.04] hover:text-white"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
