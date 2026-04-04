"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { projects, users } from "@/db/schema";

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const [existing] = await db
    .select({ ownerId: projects.ownerId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!existing || existing.ownerId !== session.user.id) {
    throw new Error("Not authorized");
  }

  await db.delete(projects).where(eq(projects.id, projectId));

  const [user] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  redirect(`/profile/${user?.username ?? session.user.id}`);
}
