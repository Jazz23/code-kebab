import { desc, eq, sql } from "drizzle-orm";
import { db } from ".";
import { posts, projectMembers, projectRoles, projects, users } from "./schema";

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
      createdAt: projects.createdAt,
      ownerName: users.name,
      memberCount:
        sql<number>`(select count(*) from "projectMember" where "projectId" = ${projects.id})::int`,
      beginnerRoles:
        sql<number>`(select count(*) from "projectRole" where "projectId" = ${projects.id} and difficulty = 'beginner')::int`,
      intermediateRoles:
        sql<number>`(select count(*) from "projectRole" where "projectId" = ${projects.id} and difficulty = 'intermediate')::int`,
      advancedRoles:
        sql<number>`(select count(*) from "projectRole" where "projectId" = ${projects.id} and difficulty = 'advanced')::int`,
      minHourlyRate:
        sql<number | null>`(select min("hourlyRate"::float8) from "projectRole" where "projectId" = ${projects.id} and "hourlyRate" is not null)`,
      maxHourlyRate:
        sql<number | null>`(select max("hourlyRate"::float8) from "projectRole" where "projectId" = ${projects.id} and "hourlyRate" is not null)`,
      minSalary:
        sql<number | null>`(select min("salary"::float8) from "projectRole" where "projectId" = ${projects.id} and "salary" is not null)`,
      maxSalary:
        sql<number | null>`(select max("salary"::float8) from "projectRole" where "projectId" = ${projects.id} and "salary" is not null)`,
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
      openSlots: projects.openSlots,
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) return null;

  const members = await db
    .select({
      id: projectMembers.id,
      userId: projectMembers.userId,
      name: sql<string | null>`coalesce(${users.name}, ${projectMembers.name})`,
      username: users.username,
    })
    .from(projectMembers)
    .leftJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, project.id));

  const roles = await db
    .select({
      id: projectRoles.id,
      name: projectRoles.name,
      hourlyRate: projectRoles.hourlyRate,
      salary: projectRoles.salary,
      difficulty: projectRoles.difficulty,
    })
    .from(projectRoles)
    .where(eq(projectRoles.projectId, project.id));

  return { ...project, members, roles };
}

export async function getPosts() {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      tags: posts.tags,
      createdAt: posts.createdAt,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));
}

export async function getPostById(id: string) {
  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      tags: posts.tags,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1);

  return post ?? null;
}

export async function getUserByUsername(username: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      skills: users.skills,
      timezone: users.timezone,
      socialLinks: users.socialLinks,
      emailNotifications: users.emailNotifications,
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
      ownerName: users.name,
      ownerId: projects.ownerId,
      memberCount:
        sql<number>`(select count(*) from "projectMember" where "projectId" = ${projects.id})::int`,
      beginnerRoles:
        sql<number>`(select count(*) from "projectRole" where "projectId" = ${projects.id} and difficulty = 'beginner')::int`,
      intermediateRoles:
        sql<number>`(select count(*) from "projectRole" where "projectId" = ${projects.id} and difficulty = 'intermediate')::int`,
      advancedRoles:
        sql<number>`(select count(*) from "projectRole" where "projectId" = ${projects.id} and difficulty = 'advanced')::int`,
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, user.id))
    .orderBy(projects.createdAt);
}
