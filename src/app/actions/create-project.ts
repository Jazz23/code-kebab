"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { projectMembers, projectRoles, projects, users } from "@/db/schema";

type MemberInput = {
  name: string;
  username?: string;
  resolvedUserId?: string;
  role?: string;
};

type RoleInput = {
  name: string;
  hourlyRate?: string;
  salary?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
};

type CreateProjectInput = {
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const [existing] = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.slug, base))
    .limit(1);

  if (!existing) return base;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createProject(input: CreateProjectInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const ownerId = session.user.id;

  // Build openRoles array for backward compat display
  let openRolesNames: string[] = [];
  if (input.rolesMode === "named") {
    openRolesNames = input.roles.map((r) => r.name).filter(Boolean);
  } else if (input.rolesMode === "slots" && input.openSlots) {
    openRolesNames = Array.from({ length: input.openSlots }, () => "Open Slot");
  }

  const slug = await uniqueSlug(slugify(input.title) || "project");

  const [project] = await db
    .insert(projects)
    .values({
      slug,
      title: input.title,
      description: input.description,
      longDescription: input.description,
      tags: input.tags,
      openRoles: openRolesNames,
      ownerId,
      githubUrl: input.githubUrl || null,
      timelineDate:
        input.timelineMode === "date" && input.timelineDate
          ? new Date(input.timelineDate)
          : null,
      openSlots: input.rolesMode === "slots" ? (input.openSlots ?? null) : null,
    })
    .returning({ id: projects.id, slug: projects.slug });

  if (!project) throw new Error("Failed to create project");

  // Insert named roles
  if (input.rolesMode === "named" && input.roles.length > 0) {
    await db.insert(projectRoles).values(
      input.roles
        .filter((r) => r.name)
        .map((r) => ({
          projectId: project.id,
          name: r.name,
          hourlyRate: r.hourlyRate || null,
          salary: r.salary || null,
          difficulty: r.difficulty || null,
        })),
    );
  }

  // Add owner as first member
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId: ownerId,
    role: "Owner",
  });

  // Add additional members
  if (input.members.length > 0) {
    const memberInserts = [];

    for (const m of input.members) {
      if (!m.name && !m.username) continue;

      if (m.resolvedUserId) {
        // Linked registered user — don't duplicate if it's the owner
        if (m.resolvedUserId === ownerId) continue;
        memberInserts.push({
          projectId: project.id,
          userId: m.resolvedUserId,
          name: null,
          role: m.role || null,
        });
      } else {
        // Unregistered / text-only member
        memberInserts.push({
          projectId: project.id,
          userId: null,
          name: m.name || m.username || null,
          role: m.role || null,
        });
      }
    }

    if (memberInserts.length > 0) {
      await db.insert(projectMembers).values(memberInserts);
    }
  }

  redirect(`/projects/${project.slug}`);
}
