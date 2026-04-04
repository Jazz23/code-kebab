import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ exists: false });
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, username: users.username })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user) {
    return NextResponse.json({ exists: true, id: user.id, name: user.name, username: user.username });
  }
  return NextResponse.json({ exists: false });
}
