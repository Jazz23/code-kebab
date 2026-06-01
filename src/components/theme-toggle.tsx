"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const isLight = theme === "light";

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initialTheme = saved === "light" ? "light" : "dark";

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";

      localStorage.setItem("theme", next);
      applyTheme(next);

      return next;
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Toggle light mode"
      onClick={toggleTheme}
      className="group flex items-center gap-2 rounded-full border border-[#f1e6d2]/12 bg-[#f1e6d2]/[0.04] px-1.5 py-1 text-[10px] text-[#cbb992] transition-colors hover:border-[#ff8a1e]/40 hover:text-white"
    >
      <span className="hidden sm:inline">{isLight ? "Light" : "Dark"}</span>
      <span className="relative h-5 w-9 rounded-full bg-[#1c2024] shadow-inner transition-colors group-hover:bg-[#252a2f]">
        <span
          className={`absolute top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff8a1e] text-[9px] text-[#11100d] shadow-[0_0_12px_rgba(255,138,30,0.35)] transition-transform ${
            isLight ? "translate-x-4" : "translate-x-0.5"
          }`}
          aria-hidden="true"
        >
          {isLight ? "L" : "D"}
        </span>
      </span>
    </button>
  );
}
