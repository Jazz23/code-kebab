"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getInboxMessages,
  getUnreadDirectMessageCount,
} from "@/app/actions/messages";
import { getNotifications, getUnreadCount } from "@/app/actions/notifications";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];
type InboxMessage = Awaited<ReturnType<typeof getInboxMessages>>[number];

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
    return project
      ? `Your request to join ${project} was denied`
      : "Your join request was denied";
  }
  return "New notification";
}

type DropdownItem =
  | { kind: "notification"; notif: Notification; date: Date }
  | { kind: "dm"; msg: InboxMessage; date: Date };

export function NotificationBell({
  initialUnreadCount,
}: {
  initialUnreadCount: number;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<DropdownItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const refreshItems = useCallback(async () => {
    const [notifs, msgs] = await Promise.all([
      getNotifications(5),
      getInboxMessages(),
    ]);
    const combined: DropdownItem[] = [
      ...notifs.map((n) => ({
        kind: "notification" as const,
        notif: n,
        date: new Date(n.createdAt),
      })),
      ...msgs.slice(0, 5).map((m) => ({
        kind: "dm" as const,
        msg: m,
        date: new Date(m.createdAt),
      })),
    ];
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    setItems(combined.slice(0, 7));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const [notifCount, dmCount] = await Promise.all([
        getUnreadCount(),
        getUnreadDirectMessageCount(),
      ]);
      setUnreadCount(notifCount + dmCount);
      if (isOpenRef.current) {
        await refreshItems();
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [refreshItems]);

  async function handleOpen() {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setLoading(true);
      await refreshItems();
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7490] transition-colors hover:bg-[#00f0ff]/10 hover:text-[#00f0ff]"
        aria-label="Messages"
      >
        <svg
          aria-hidden="true"
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
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff2d8f] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="ck-panel absolute right-0 top-10 z-50 w-80 rounded-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">Messages</span>
            {unreadCount > 0 && (
              <span className="rounded-full border border-[#ff2d8f]/25 bg-[#ff2d8f]/10 px-2 py-0.5 text-xs font-medium text-[#ff2d8f]">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-[#7a7490]">Loading…</span>
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-sm text-[#7a7490]">No messages yet</span>
              </div>
            ) : (
              items.map((item) => {
                if (item.kind === "notification") {
                  const { notif } = item;
                  const isUnread = !notif.read;
                  return (
                    <div
                      key={notif.id}
                      className={`group flex items-start gap-3 border-b px-4 py-3 last:border-0 ${
                        isUnread
                          ? "border-white/10 bg-[#00f0ff]/10"
                          : "border-white/10"
                      }`}
                    >
                      {isUnread && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00f0ff]" />
                      )}
                      <Link
                        href={`/messages/system/${notif.id}`}
                        onClick={() => setIsOpen(false)}
                        className={`min-w-0 flex-1 hover:opacity-80 ${!isUnread ? "pl-5" : ""}`}
                      >
                        <p className="text-sm leading-snug text-[#c6c0da]">
                          {notificationLabel(notif)}
                        </p>
                        <p className="mt-0.5 text-xs text-[#7a7490]">
                          {timeAgo(item.date)}
                        </p>
                      </Link>
                    </div>
                  );
                }

                // DM
                const { msg } = item;
                const isUnread = !msg.read;
                const initials = (msg.senderName ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start gap-3 border-b px-4 py-3 last:border-0 ${
                      isUnread
                        ? "border-white/10 bg-[#00f0ff]/10"
                        : "border-white/10"
                    }`}
                  >
                    {isUnread && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00f0ff]" />
                    )}
                    <Link
                      href={`/messages/${msg.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`min-w-0 flex-1 hover:opacity-80 ${!isUnread ? "pl-5" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00f0ff] text-[9px] font-bold text-[#050408]">
                          {initials}
                        </div>
                        <p className="truncate text-sm font-medium leading-snug text-[#c6c0da]">
                          {msg.senderName}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#7a7490]">
                        {msg.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-[#7a7490]">
                        {timeAgo(item.date)}
                      </p>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-medium text-[#00f0ff] transition-colors hover:text-[#8fffff]"
            >
              View all messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
