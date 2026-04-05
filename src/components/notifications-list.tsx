"use client";

import { useState } from "react";
import Link from "next/link";
import {
  deleteNotification,
  markNotificationRead,
  markNotificationUnread,
} from "@/app/actions/notifications";
import type { getNotifications } from "@/app/actions/notifications";

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

export function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function handleMarkUnread(id: string) {
    await markNotificationUnread(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
    );
  }

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  async function handleDelete(id: string) {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        <p className="text-sm text-zinc-400">No notifications yet</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      {unreadCount > 0 && (
        <p className="mb-4 text-sm text-zinc-500">
          {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`group flex items-start justify-between gap-4 rounded-xl border p-4 ${
              notif.read
                ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                : "border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/20"
            }`}
          >
            <div className="flex min-w-0 items-start gap-3">
              {!notif.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
              <div className={notif.read ? "pl-5" : ""}>
                <Link
                  href={`/notifications/${notif.id}`}
                  className="text-sm font-medium text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
                >
                  {notificationLabel(notif)}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {timeAgo(new Date(notif.createdAt))}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {notif.read ? (
                <button
                  onClick={() => handleMarkUnread(notif.id)}
                  className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  title="Mark as unread"
                >
                  Mark unread
                </button>
              ) : (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="rounded px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  title="Mark as read"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => handleDelete(notif.id)}
                className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                title="Delete notification"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 3.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
