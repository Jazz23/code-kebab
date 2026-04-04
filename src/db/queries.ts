import { eq, sql } from "drizzle-orm";
import { db } from ".";
import { projectMembers, projectRoles, projects, users } from "./schema";

export async function getProjects() {
  return db
    .select({
      slug: projects.slug,
      title: projects.title,
      description: projects.description,
      tags: projects.tags,
      openRoles: projects.openRoles,
      openSlots: projects.openSlots,
      githubUrl: projects.githubUrl,
      timelineDate: projects.timelineDate,
      timelineOpenEnded: projects.timelineOpenEnded,
      ownerName: users.name,
      memberCount:
        sql<number>`(select count(*) from "projectMember" where "projectId" = ${projects.id})::int`,
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .orderBy(projects.createdAt);
}

export async function getProjectBySlug(slug: string) {
  const [project] = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      description: projects.description,
      longDescription: projects.longDescription,
      tags: projects.tags,
      openRoles: projects.openRoles,
      createdAt: projects.createdAt,
      ownerId: projects.ownerId,
      ownerName: users.name,
      ownerUsername: users.username,
      githubUrl: projects.githubUrl,
      timelineDate: projects.timelineDate,
      timelineOpenEnded: projects.timelineOpenEnded,
      openSlots: projects.openSlots,
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) return null;

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
    })
    .from(users)
    .innerJoin(projectMembers, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, project.id));

  const roles = await db
    .select({
      id: projectRoles.id,
      name: projectRoles.name,
      hourlyRate: projectRoles.hourlyRate,
      salary: projectRoles.salary,
    })
    .from(projectRoles)
    .where(eq(projectRoles.projectId, project.id));

  return { ...project, members, roles };
}

export async function getUserByUsername(username: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      skills: users.skills,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user ?? null;
}

export async function getUserProjects(username: string) {
  const user = await getUserByUsername(username);
  if (!user) return [];

  return db
    .select({
      slug: projects.slug,
      title: projects.title,
      description: projects.description,
      tags: projects.tags,
      openRoles: projects.openRoles,
      openSlots: projects.openSlots,
      githubUrl: projects.githubUrl,
      timelineDate: projects.timelineDate,
      timelineOpenEnded: projects.timelineOpenEnded,
      ownerName: users.name,
      memberCount:
        sql<number>`(select count(*) from "projectMember" where "projectId" = ${projects.id})::int`,
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, user.id))
    .orderBy(projects.createdAt);
}
