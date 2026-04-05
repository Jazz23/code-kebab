"use server";

import { and, desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { directMessages, notifications, users } from "@/db/schema";

export async function sendDirectMessage(
  recipientUsername: string,
  subject: string,
  content: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const [recipient] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, recipientUsername))
    .limit(1);

  if (!recipient) throw new Error("User not found");
  if (recipient.id === session.user.id) throw new Error("Cannot message yourself");

  await db.insert(directMessages).values({
    senderId: session.user.id,
    recipientId: recipient.id,
    subject: subject.trim() || "(no subject)",
    content: content.trim(),
  });

  revalidatePath("/messages");
}

export async function getInboxMessages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const msgs = await db
    .select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      subject: directMessages.subject,
      content: directMessages.content,
      read: directMessages.read,
      createdAt: directMessages.createdAt,
    })
    .from(directMessages)
    .where(eq(directMessages.recipientId, session.user.id))
    .orderBy(desc(directMessages.createdAt));

  const enriched = await Promise.all(
    msgs.map(async (msg) => {
      const [sender] = await db
        .select({ name: users.name, username: users.username })
        .from(users)
        .where(eq(users.id, msg.senderId))
        .limit(1);
      return {
        ...msg,
        senderName: sender?.name ?? "Unknown",
        senderUsername: sender?.username ?? null,
      };
    }),
  );

  return enriched;
}

export async function getSentMessages() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const msgs = await db
    .select({
      id: directMessages.id,
      recipientId: directMessages.recipientId,
      subject: directMessages.subject,
      content: directMessages.content,
      read: directMessages.read,
      createdAt: directMessages.createdAt,
    })
    .from(directMessages)
    .where(eq(directMessages.senderId, session.user.id))
    .orderBy(desc(directMessages.createdAt));

  const enriched = await Promise.all(
    msgs.map(async (msg) => {
      const [recipient] = await db
        .select({ name: users.name, username: users.username })
        .from(users)
        .where(eq(users.id, msg.recipientId))
        .limit(1);
      return {
        ...msg,
        recipientName: recipient?.name ?? "Unknown",
        recipientUsername: recipient?.username ?? null,
      };
    }),
  );

  return enriched;
}

export async function getMessage(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [msg] = await db
    .select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      recipientId: directMessages.recipientId,
      subject: directMessages.subject,
      content: directMessages.content,
      read: directMessages.read,
      createdAt: directMessages.createdAt,
    })
    .from(directMessages)
    .where(
      and(
        eq(directMessages.id, id),
        or(
          eq(directMessages.senderId, session.user.id),
          eq(directMessages.recipientId, session.user.id),
        ),
      ),
    )
    .limit(1);

  if (!msg) return null;

  const [[sender], [recipient]] = await Promise.all([
    db
      .select({ name: users.name, username: users.username })
      .from(users)
      .where(eq(users.id, msg.senderId))
      .limit(1),
    db
      .select({ name: users.name, username: users.username })
      .from(users)
      .where(eq(users.id, msg.recipientId))
      .limit(1),
  ]);

  return {
    ...msg,
    senderName: sender?.name ?? "Unknown",
    senderUsername: sender?.username ?? null,
    recipientName: recipient?.name ?? "Unknown",
    recipientUsername: recipient?.username ?? null,
    isFromMe: msg.senderId === session.user.id,
  };
}

export async function markMessageRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await db
    .update(directMessages)
    .set({ read: true })
    .where(
      and(eq(directMessages.id, id), eq(directMessages.recipientId, session.user.id)),
    );
}

export async function getUnreadDirectMessageCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const msgs = await db
    .select({ id: directMessages.id })
    .from(directMessages)
    .where(and(eq(directMessages.recipientId, session.user.id), eq(directMessages.read, false)));

  return msgs.length;
}

export async function getTotalUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const [notifRows, dmRows] = await Promise.all([
    db
      .select({ id: notifications.id, read: notifications.read })
      .from(notifications)
      .where(eq(notifications.userId, session.user.id)),
    db
      .select({ id: directMessages.id })
      .from(directMessages)
      .where(
        and(eq(directMessages.recipientId, session.user.id), eq(directMessages.read, false)),
      ),
  ]);

  return notifRows.filter((r) => !r.read).length + dmRows.length;
}
