"use server";

import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { joinRequests, notifications, projects, users } from "@/db/schema";

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(eq(notifications.userId, session.user.id));

  return rows.filter((r) => {
    // We need the read field — re-query with it
    return true;
  }).length;
}

export async function getNotifications(limit?: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const query = db
    .select({
      id: notifications.id,
      type: notifications.type,
      referenceId: notifications.referenceId,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt));

  const rows = limit ? await query.limit(limit) : await query;

  // Enrich with join request details
  const enriched = await Promise.all(
    rows.map(async (notif) => {
      if (notif.type === "join_request" || notif.type === "join_request_denied") {
        const [jr] = await db
          .select({
            id: joinRequests.id,
            description: joinRequests.description,
            roleNames: joinRequests.roleNames,
            createdAt: joinRequests.createdAt,
            applicantName: users.name,
            applicantUsername: users.username,
            projectTitle: projects.title,
            projectSlug: projects.slug,
          })
          .from(joinRequests)
          .innerJoin(users, eq(joinRequests.userId, users.id))
          .innerJoin(projects, eq(joinRequests.projectId, projects.id))
          .where(eq(joinRequests.id, notif.referenceId))
          .limit(1);

        return { ...notif, joinRequest: jr ?? null };
      }
      return { ...notif, joinRequest: null };
    }),
  );

  return enriched;
}

export async function getNotificationById(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [notif] = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      referenceId: notifications.referenceId,
      read: notifications.read,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.id, notificationId))
    .limit(1);

  if (!notif || notif === undefined) return null;

  // Security: only the recipient can view
  const [fullRow] = await db
    .select({ userId: notifications.userId })
    .from(notifications)
    .where(eq(notifications.id, notificationId))
    .limit(1);

  if (fullRow?.userId !== session.user.id) return null;

  if (notif.type === "join_request" || notif.type === "join_request_denied") {
    const [jr] = await db
      .select({
        id: joinRequests.id,
        description: joinRequests.description,
        roleNames: joinRequests.roleNames,
        socialLinks: joinRequests.socialLinks,
        status: joinRequests.status,
        createdAt: joinRequests.createdAt,
        applicantId: joinRequests.userId,
        applicantName: users.name,
        applicantUsername: users.username,
        projectTitle: projects.title,
        projectSlug: projects.slug,
      })
      .from(joinRequests)
      .innerJoin(users, eq(joinRequests.userId, users.id))
      .innerJoin(projects, eq(joinRequests.projectId, projects.id))
      .where(eq(joinRequests.id, notif.referenceId))
      .limit(1);

    return { ...notif, joinRequest: jr ?? null };
  }

  return { ...notif, joinRequest: null };
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}

export async function markNotificationUnread(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .update(notifications)
    .set({ read: false })
    .where(eq(notifications.id, notificationId));
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const rows = await db
    .select({ id: notifications.id, read: notifications.read })
    .from(notifications)
    .where(eq(notifications.userId, session.user.id));

  return rows.filter((r) => !r.read).length;
}
