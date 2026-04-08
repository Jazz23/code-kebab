"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { joinRequests, notifications, projects, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { sendEmail, APP_URL } from "@/lib/email";

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
    .select({ id: projects.id, ownerId: projects.ownerId, title: projects.title })
    .from(projects)
    .where(eq(projects.slug, input.projectSlug))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.ownerId === userId) throw new Error("Cannot join your own project");

  const [applicant] = await db
    .select({ name: users.name, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

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
  const [ownerNotif] = await db
    .insert(notifications)
    .values({
      userId: project.ownerId,
      type: "join_request",
      referenceId: joinRequest.id,
    })
    .returning({ id: notifications.id });

  // Send email notification to project owner if enabled
  const [owner] = await db
    .select({ email: users.email, name: users.name, emailNotifications: users.emailNotifications })
    .from(users)
    .where(eq(users.id, project.ownerId))
    .limit(1);

  if (owner?.emailNotifications && owner.email && ownerNotif) {
    const applicantDisplay = applicant?.name
      ? `${applicant.name} (@${applicant.username})`
      : `@${applicant?.username ?? "someone"}`;
    const url = `${APP_URL}/notifications/${ownerNotif.id}`;
    await sendEmail({
      to: { email: owner.email, name: owner.name ?? undefined },
      subject: `New join request for ${project.title}`,
      htmlContent: `<p>Hi${owner.name ? ` ${owner.name}` : ""},</p><p>${applicantDisplay} has requested to join your project <strong>${project.title}</strong>.</p><p><a href="${url}">Review the request</a></p>`,
      textContent: `${applicantDisplay} has requested to join your project "${project.title}".\n\nReview it here: ${url}`,
    });
  }

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
      projectTitle: projects.title,
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

  const [applicantNotif] = await db
    .insert(notifications)
    .values({
      userId: jr.applicantId,
      type: "join_request_denied",
      referenceId: joinRequestId,
    })
    .returning({ id: notifications.id });

  // Send email notification to applicant if enabled
  const [applicant] = await db
    .select({ email: users.email, name: users.name, emailNotifications: users.emailNotifications })
    .from(users)
    .where(eq(users.id, jr.applicantId))
    .limit(1);

  if (applicant?.emailNotifications && applicant.email && applicantNotif) {
    const url = `${APP_URL}/notifications/${applicantNotif.id}`;
    await sendEmail({
      to: { email: applicant.email, name: applicant.name ?? undefined },
      subject: `Your join request for ${jr.projectTitle} was declined`,
      htmlContent: `<p>Hi${applicant.name ? ` ${applicant.name}` : ""},</p><p>Your request to join <strong>${jr.projectTitle}</strong> has been declined.</p><p><a href="${url}">View notification</a></p>`,
      textContent: `Your request to join "${jr.projectTitle}" has been declined.\n\nView it here: ${url}`,
    });
  }

  revalidatePath("/messages");
}
