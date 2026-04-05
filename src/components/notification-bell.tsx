"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getNotifications, getUnreadCount, markNotificationRead } from "@/app/actions/notifications";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationLabel(notif: Notification): string {
  if (notif.type === "join_request" && notif.joinRequest) {
    const { applicantName, projectTitle, roleNames } = notif.joinRequest;
    const name = applicantName ?? "Someone";
    if (roleNames && roleNames.length > 0) {
      return `${name} wants to join ${projectTitle} as ${roleNames.join(", ")}`;
    }
    return `${name} wants to join ${projectTitle}`;
  }
  if (notif.type === "join_request_denied") {
    const project = notif.joinRequest?.projectTitle;
    return project ? `Your request to join ${project} was denied` : "Your join request was denied";
  }
  if (notif.type === "join_request") {
    const project = notif.joinRequest?.projectTitle;
    return project ? `New join request for ${project}` : "New join request";
  }
  return "New notification";
}

export function NotificationBell({
  initialUnreadCount,
}: {
  initialUnreadCount: number;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
      if (isOpenRef.current) {
        const data = await getNotifications(5);
        setNotifications(data);
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  async function handleOpen() {
    const next = !isOpen;
    setIsOpen(next);
    if (next && notifications === null) {
      setLoading(true);
      const data = await getNotifications(5);
      setNotifications(data);
      setLoading(false);
    }
  }

  async function handleNotificationClick(notif: Notification) {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev ? prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)) : prev,
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setIsOpen(false);
  }

  const notifHref = (notif: Notification) => `/notifications/${notif.id}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-zinc-400">Loading…</span>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-zinc-400">No notifications yet</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group flex items-start gap-3 border-b px-4 py-3 last:border-0 ${
                    notif.read
                      ? "border-zinc-100 dark:border-zinc-800"
                      : "border-zinc-100 bg-blue-50/40 dark:border-zinc-800 dark:bg-blue-950/20"
                  }`}
                >
                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                  <Link
                    href={notifHref(notif)}
                    onClick={() => handleNotificationClick(notif)}
                    className={`min-w-0 flex-1 hover:opacity-80 ${notif.read ? "pl-5" : ""}`}
                  >
                    <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300">
                      {notificationLabel(notif)}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {timeAgo(new Date(notif.createdAt))}
                    </p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifications((prev) => prev ? prev.filter((n) => n.id !== notif.id) : prev);
                      if (!notif.read) setUnreadCount((c) => Math.max(0, c - 1));
                    }}
                    className="mt-0.5 shrink-0 rounded p-0.5 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    aria-label="Dismiss notification"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
