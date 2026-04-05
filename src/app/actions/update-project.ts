"use server";

import { and, eq, isNull, ne, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectMembers, projectRoles, projects } from "@/db/schema";

type RoleInput = {
  name: string;
  hourlyRate?: string;
  salary?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
};

type MemberInput = {
  name: string;
  username?: string;
  resolvedUserId?: string;
};

type UpdateProjectInput = {
  title: string;
  description: string;
  githubUrl?: string;
  tags: string[];
  rolesMode: "none" | "slots" | "named";
  openSlots?: number;
  roles: RoleInput[];
  timelineMode: "none" | "date";
  timelineDate?: string;
  members: MemberInput[];
};

export async function updateProject(projectId: string, input: UpdateProjectInput) {
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

  let openRolesNames: string[] = [];
  if (input.rolesMode === "named") {
    openRolesNames = input.roles.map((r) => r.name).filter(Boolean);
  } else if (input.rolesMode === "slots" && input.openSlots) {
    openRolesNames = Array.from({ length: input.openSlots }, () => "Open Slot");
  }

  await db
    .update(projects)
    .set({
      title: input.title,
      description: input.description,
      longDescription: input.description,
      tags: input.tags,
      openRoles: openRolesNames,
      githubUrl: input.githubUrl || null,
      timelineDate:
        input.timelineMode === "date" && input.timelineDate
          ? new Date(input.timelineDate)
          : null,
      openSlots: input.rolesMode === "slots" ? (input.openSlots ?? null) : null,
    })
    .where(eq(projects.id, projectId));

  // Replace roles
  await db.delete(projectRoles).where(eq(projectRoles.projectId, projectId));
  if (input.rolesMode === "named") {
    const validRoles = input.roles.filter((r) => r.name);
    if (validRoles.length > 0) {
      await db.insert(projectRoles).values(
        validRoles.map((r) => ({
          projectId,
          name: r.name,
          hourlyRate: r.hourlyRate || null,
          salary: r.salary || null,
          difficulty: r.difficulty || null,
        })),
      );
    }
  }

  // Delete non-owner members, then re-insert
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        or(ne(projectMembers.userId, session.user.id), isNull(projectMembers.userId)),
      ),
    );

  if (input.members.length > 0) {
    const memberInserts = [];
    for (const m of input.members) {
      if (!m.name && !m.username) continue;
      if (m.resolvedUserId) {
        if (m.resolvedUserId === session.user.id) continue;
        memberInserts.push({ projectId, userId: m.resolvedUserId, name: null, role: null });
      } else {
        memberInserts.push({
          projectId,
          userId: null,
          name: m.name || m.username || null,
          role: null,
        });
      }
    }
    if (memberInserts.length > 0) {
      await db.insert(projectMembers).values(memberInserts);
    }
  }
}
