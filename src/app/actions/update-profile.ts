"use server";

import { and, eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

type UpdateProfileInput = {
  name?: string;
  bio?: string;
  skills?: string[];
  timezone?: string;
  socialLinks?: string[];
  emailNotifications?: boolean;
  username?: string;
};

export async function updateProfile(input: UpdateProfileInput): Promise<{ newUsername?: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updateData.name = input.name.trim() || null;
  }

  if (input.bio !== undefined) {
    updateData.bio = input.bio.trim() || null;
  }

  if (input.skills !== undefined) {
    updateData.skills = input.skills;
  }

  if (input.timezone !== undefined) {
    updateData.timezone = input.timezone.trim() || null;
  }

  if (input.socialLinks !== undefined) {
    updateData.socialLinks = input.socialLinks;
  }

  if (input.emailNotifications !== undefined) {
    updateData.emailNotifications = input.emailNotifications;
  }

  if (input.username !== undefined) {
    const u = input.username.trim();
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(u)) {
      throw new Error(
        "Username must be 3–20 characters and contain only letters, numbers, underscores, or hyphens",
      );
    }
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, u), ne(users.id, session.user.id)))
      .limit(1);
    if (existing) throw new Error("Username is already taken");
    updateData.username = u;
  }

  if (Object.keys(updateData).length === 0) return {};

  await db.update(users).set(updateData).where(eq(users.id, session.user.id));

  if (input.username !== undefined) {
    return { newUsername: input.username.trim() };
  }
  return {};
}
