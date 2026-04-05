"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { joinRequests, notifications, projects } from "@/db/schema";
import { revalidatePath } from "next/cache";

type SubmitJoinRequestInput = {
  projectSlug: string;
  roleNames: string[];
  description: string;
  socialLinks: string[];
};

export async function submitJoinRequest(
  input: SubmitJoinRequestInput,
): Promise<{ redirectTo: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { redirectTo: "/login" };
  }

  const userId = session.user.id;

  const [project] = await db
    .select({ id: projects.id, ownerId: projects.ownerId })
    .from(projects)
    .where(eq(projects.slug, input.projectSlug))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.ownerId === userId) throw new Error("Cannot join your own project");

  const [joinRequest] = await db
    .insert(joinRequests)
    .values({
      projectId: project.id,
      userId,
      roleNames: input.roleNames.filter(Boolean),
      description: input.description.trim(),
      socialLinks: input.socialLinks.filter(Boolean),
    })
    .returning({ id: joinRequests.id });

  if (!joinRequest) throw new Error("Failed to create join request");

  // Create notification for project owner
  await db.insert(notifications).values({
    userId: project.ownerId,
    type: "join_request",
    referenceId: joinRequest.id,
  });

  return { redirectTo: `/projects/${input.projectSlug}` };
}

export async function denyJoinRequest(joinRequestId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const userId = session.user.id;

  const [jr] = await db
    .select({
      id: joinRequests.id,
      applicantId: joinRequests.userId,
      status: joinRequests.status,
      projectOwnerId: projects.ownerId,
      projectSlug: projects.slug,
    })
    .from(joinRequests)
    .innerJoin(projects, eq(joinRequests.projectId, projects.id))
    .where(eq(joinRequests.id, joinRequestId))
    .limit(1);

  if (!jr) throw new Error("Join request not found");
  if (jr.projectOwnerId !== userId) throw new Error("Not authorized");
  if (jr.status !== "pending") throw new Error("Join request is no longer pending");

  await db
    .update(joinRequests)
    .set({ status: "rejected" })
    .where(eq(joinRequests.id, joinRequestId));

  await db.insert(notifications).values({
    userId: jr.applicantId,
    type: "join_request_denied",
    referenceId: joinRequestId,
  });

  revalidatePath(`/notifications`);
}
