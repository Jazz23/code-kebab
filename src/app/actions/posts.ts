"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";

export async function createPost(
  title: string,
  description: string,
  tags: string[],
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const [post] = await db
    .insert(posts)
    .values({
      title: title.trim(),
      description: description.trim(),
      tags,
      authorId: session.user.id,
    })
    .returning({ id: posts.id });

  redirect(`/posts/${post.id}`);
}
