"use server";

import { eq } from "drizzle-orm";
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
};

export async function updateProfile(input: UpdateProfileInput) {
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

  if (Object.keys(updateData).length === 0) return;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.user.id));
}
