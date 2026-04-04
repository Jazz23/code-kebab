import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { projectMembers, projects, users } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const SEED_PASSWORD = "password";

async function main() {
  const hashedPassword = await hash(SEED_PASSWORD);

  // --- Users ---
  const seedUsers = [
    {
      id: "seed-user-alexchen",
      name: "Alex Chen",
      email: "alex@example.com",
      username: "alexchen",
      bio: "Full-stack developer passionate about open source and developer tools.",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
      createdAt: new Date("2025-08-12"),
      image: null,
      password: hashedPassword,
      emailVerified: null,
    },
    {
      id: "seed-user-samira",
      name: "Samira Osei",
      email: "samira@example.com",
      username: "samira",
      bio: "UI/UX designer and frontend engineer. Love building delightful experiences.",
      skills: ["Figma", "React", "CSS", "Accessibility"],
      createdAt: new Date("2025-09-03"),
      image: null,
      password: hashedPassword,
      emailVerified: null,
    },
    {
      id: "seed-user-jpark",
      name: "Jordan Park",
      email: "jordan@example.com",
      username: "jpark",
      bio: "Backend engineer with a focus on distributed systems and data pipelines.",
      skills: ["Go", "Rust", "Kafka", "Kubernetes"],
      createdAt: new Date("2025-10-21"),
      image: null,
      password: hashedPassword,
      emailVerified: null,
    },
    {
      id: "seed-user-mrivera",
      name: "Maria Rivera",
      email: "maria@example.com",
      username: "mrivera",
      bio: "Mobile developer and CS student. Always learning something new.",
      skills: ["Swift", "Kotlin", "React Native", "Firebase"],
      createdAt: new Date("2026-01-15"),
      image: null,
      password: hashedPassword,
      emailVerified: null,
    },
  ];

  // --- Projects ---
  const seedProjects = [
    {
      id: "seed-project-devboard",
      slug: "devboard",
      title: "DevBoard",
      description:
        "A collaborative dashboard for developer teams to track tasks, share updates, and stay aligned.",
      longDescription:
        "DevBoard is a real-time collaborative dashboard designed for small developer teams. It combines task tracking, team updates, and async standups into a single clean interface. We're building it with Next.js, PostgreSQL, and WebSockets. Looking for contributors who want to ship something useful and learn along the way.",
      tags: ["Next.js", "PostgreSQL", "WebSockets", "TypeScript"],
      openRoles: ["Backend Engineer", "DevOps"],
      ownerId: "seed-user-alexchen",
      createdAt: new Date("2026-01-20"),
    },
    {
      id: "seed-project-lingua",
      slug: "lingua",
      title: "Lingua",
      description:
        "An open-source language learning app with spaced repetition and community-created courses.",
      longDescription:
        "Lingua is a free, open-source language learning platform. Users can create and share their own courses, and the app uses spaced repetition algorithms to optimize retention. The frontend is React Native, the backend is Go, and we store everything in SQLite for offline-first support. We need help with mobile UI, backend API design, and course content tooling.",
      tags: ["React Native", "Go", "SQLite", "Education"],
      openRoles: ["Mobile Developer", "Content Designer", "API Engineer"],
      ownerId: "seed-user-jpark",
      createdAt: new Date("2026-02-05"),
    },
    {
      id: "seed-project-greenlens",
      slug: "greenlens",
      title: "GreenLens",
      description:
        "A sustainability tracker that helps users measure and reduce their carbon footprint.",
      longDescription:
        "GreenLens helps individuals and small businesses track their environmental impact. Users log activities like travel, energy usage, and purchases, and the app calculates carbon equivalents and suggests alternatives. Built with Next.js and Chart.js for visualization. We're looking for frontend engineers and anyone with domain knowledge in sustainability metrics.",
      tags: ["Next.js", "Chart.js", "Sustainability", "Data Viz"],
      openRoles: ["Frontend Engineer", "Data Analyst", "Designer"],
      ownerId: "seed-user-samira",
      createdAt: new Date("2026-03-01"),
    },
    {
      id: "seed-project-patchwork",
      slug: "patchwork",
      title: "Patchwork",
      description:
        "A CLI tool that helps maintainers triage, review, and merge pull requests faster.",
      longDescription:
        "Patchwork is a command-line tool for open-source maintainers who are drowning in PRs. It uses heuristics and optional AI assistance to prioritize reviews, detect conflicts early, and batch-merge safe changes. Written in Rust with a focus on speed and reliability. If you love CLIs and developer tooling, come build with us.",
      tags: ["Rust", "CLI", "Developer Tools", "Open Source"],
      openRoles: ["Rust Developer", "Technical Writer"],
      ownerId: "seed-user-alexchen",
      createdAt: new Date("2026-03-10"),
    },
  ];

  // --- Project members ---
  const seedMembers = [
    { projectId: "seed-project-devboard", userId: "seed-user-alexchen" },
    { projectId: "seed-project-devboard", userId: "seed-user-samira" },
    { projectId: "seed-project-lingua", userId: "seed-user-jpark" },
    { projectId: "seed-project-lingua", userId: "seed-user-mrivera" },
    { projectId: "seed-project-greenlens", userId: "seed-user-samira" },
    { projectId: "seed-project-patchwork", userId: "seed-user-alexchen" },
    { projectId: "seed-project-patchwork", userId: "seed-user-jpark" },
  ];

  console.log("Seeding users...");
  await db.insert(users).values(seedUsers).onConflictDoUpdate({
    target: users.id,
    set: {
      username: sql`excluded.username`,
      bio: sql`excluded.bio`,
      skills: sql`excluded.skills`,
      createdAt: sql`excluded."createdAt"`,
    },
  });

  console.log("Seeding projects...");
  await db.insert(projects).values(seedProjects).onConflictDoUpdate({
    target: projects.id,
    set: {
      slug: sql`excluded.slug`,
      title: sql`excluded.title`,
      description: sql`excluded.description`,
      longDescription: sql`excluded."longDescription"`,
      tags: sql`excluded.tags`,
      openRoles: sql`excluded."openRoles"`,
    },
  });

  console.log("Seeding project members...");
  await db.insert(projectMembers).values(seedMembers).onConflictDoNothing();

  console.log(`Done. (password for all users: "${SEED_PASSWORD}")`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
