import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { projectMembers, projectRoles, projects, users } from "./schema";

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
      socialLinks: ["https://github.com/alexchen", "https://linkedin.com/in/alexchen"],
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
      socialLinks: ["https://github.com/samiraosei", "https://dribbble.com/samiraosei"],
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
      socialLinks: ["https://github.com/jordanpark"],
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
      socialLinks: ["https://github.com/mrivera", "https://linkedin.com/in/mariafrivera"],
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
      githubUrl: "https://github.com/example/devboard",
      timelineDate: null,
      openSlots: null,
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
      githubUrl: null,
      timelineDate: new Date("2026-12-01"),
      openSlots: null,
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
      githubUrl: null,
      timelineDate: null,
      openSlots: 3,
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
      githubUrl: "https://github.com/example/patchwork",
      timelineDate: new Date("2026-09-01"),
      openSlots: null,
    },
    // --- 10 new projects ---
    {
      id: "seed-project-nightowl",
      slug: "nightowl",
      title: "NightOwl",
      description:
        "A focus and productivity app for night-shift workers and late-night coders with smart session tracking.",
      longDescription:
        "NightOwl is designed for the growing number of people who do their best work after midnight. It tracks deep-work sessions, manages energy levels, and syncs with health APIs to provide personalized productivity insights. Built with TypeScript and React, we're looking for contributors who love clean UX and care about maker culture.",
      tags: ["TypeScript", "React", "Node.js", "Productivity"],
      openRoles: ["UI Designer", "Frontend Engineer"],
      ownerId: "seed-user-samira",
      createdAt: new Date("2026-01-25"),
      githubUrl: null,
      timelineDate: new Date("2026-06-15"),
      openSlots: null,
    },
    {
      id: "seed-project-mapmind",
      slug: "mapmind",
      title: "MapMind",
      description:
        "An interactive knowledge graph tool that lets you visualize and explore connections between ideas.",
      longDescription:
        "MapMind is a visual knowledge management tool powered by a graph database. Users can link notes, resources, and concepts into explorable webs of ideas. We use D3.js for the graph canvas, React for the UI, and GraphQL for the API layer. Whether you're a researcher, writer, or lifelong learner, MapMind helps you think in connections.",
      tags: ["D3.js", "React", "GraphQL", "Data Viz"],
      openRoles: ["Data Engineer", "Frontend Developer"],
      ownerId: "seed-user-jpark",
      createdAt: new Date("2026-01-30"),
      githubUrl: "https://github.com/example/mapmind",
      timelineDate: new Date("2027-01-15"),
      openSlots: null,
    },
    {
      id: "seed-project-codebuddy",
      slug: "codebuddy",
      title: "CodeBuddy",
      description:
        "An AI-powered pair programming assistant that explains code, suggests refactors, and catches bugs in real time.",
      longDescription:
        "CodeBuddy is an IDE-agnostic AI coding assistant built on top of open LLM APIs. Unlike black-box tools, it explains its reasoning and lets you control the model. We're building a FastAPI backend, a language-server plugin, and a React-based web interface. We need ML engineers, backend devs, and someone who can write great docs.",
      tags: ["Python", "AI/ML", "FastAPI", "LLMs"],
      openRoles: ["ML Engineer", "Backend Developer", "Technical Writer"],
      ownerId: "seed-user-alexchen",
      createdAt: new Date("2026-02-10"),
      githubUrl: "https://github.com/example/codebuddy",
      timelineDate: new Date("2026-08-01"),
      openSlots: null,
    },
    {
      id: "seed-project-vaultsafe",
      slug: "vaultsafe",
      title: "VaultSafe",
      description:
        "An open-source, end-to-end encrypted password manager built in Rust with a zero-knowledge architecture.",
      longDescription:
        "VaultSafe is a fully open-source password manager where your data is encrypted client-side before it ever leaves your device. We use Rust for the core cryptographic engine and compile it to WebAssembly for the browser extension and web app. Zero-knowledge means even we can't read your passwords. Looking for security engineers and frontend devs who take privacy seriously.",
      tags: ["Rust", "Security", "Cryptography", "Open Source"],
      openRoles: ["Security Engineer", "UI Developer"],
      ownerId: "seed-user-mrivera",
      createdAt: new Date("2026-02-20"),
      githubUrl: "https://github.com/example/vaultsafe",
      timelineDate: null,
      openSlots: null,
    },
    {
      id: "seed-project-foodgrid",
      slug: "foodgrid",
      title: "FoodGrid",
      description:
        "A community recipe platform where home cooks share, remix, and discover recipes with ingredient-level search.",
      longDescription:
        "FoodGrid is built around the idea that cooking is collaborative. Every recipe can be remixed, annotated, and scaled. We index recipes at the ingredient level so you can search by what's in your fridge. The stack is Next.js for the frontend, PostgreSQL for search and storage, and we're adding image recognition soon. Great project for beginners who want to ship something real.",
      tags: ["Next.js", "PostgreSQL", "React", "Community"],
      openRoles: ["Frontend Developer", "Backend Developer", "Content Manager"],
      ownerId: "seed-user-samira",
      createdAt: new Date("2026-02-25"),
      githubUrl: null,
      timelineDate: new Date("2026-10-01"),
      openSlots: null,
    },
    {
      id: "seed-project-sprintsync",
      slug: "sprintsync",
      title: "SprintSync",
      description:
        "A lightweight agile sprint planner that integrates with GitHub Issues and keeps distributed teams in sync.",
      longDescription:
        "SprintSync is a minimalist alternative to Jira for teams that live in GitHub. It reads your issues and PRs, lets you drag-drop them into sprint columns, and sends async updates so your distributed team never needs another status meeting. Built with Vue.js for the frontend and Python/FastAPI for the backend, with real-time updates via WebSockets.",
      tags: ["Vue.js", "WebSockets", "Python", "Productivity"],
      openRoles: ["Frontend Engineer", "Product Designer"],
      ownerId: "seed-user-alexchen",
      createdAt: new Date("2026-03-05"),
      githubUrl: null,
      timelineDate: new Date("2026-07-15"),
      openSlots: null,
    },
    {
      id: "seed-project-artcanvas",
      slug: "artcanvas",
      title: "ArtCanvas",
      description:
        "A multiplayer pixel art editor in the browser with live collaboration, palettes, and animation support.",
      longDescription:
        "ArtCanvas lets you create and animate pixel art with friends in real time. Think Google Docs meets MS Paint. We use the HTML5 Canvas API for rendering, TypeScript throughout, and Redis for pub/sub to sync state between sessions. No installation needed — just share a link and start drawing together. Great for beginners who want to learn WebSockets and canvas graphics.",
      tags: ["Canvas API", "TypeScript", "Redis", "Creative Tools"],
      openRoles: ["Frontend Developer", "Game Developer"],
      ownerId: "seed-user-jpark",
      createdAt: new Date("2026-03-15"),
      githubUrl: "https://github.com/example/artcanvas",
      timelineDate: new Date("2026-09-01"),
      openSlots: null,
    },
    {
      id: "seed-project-podcastpal",
      slug: "podcastpal",
      title: "PodcastPal",
      description:
        "An iOS app that combines podcast discovery, smart timestamped notes, and AI-powered episode summaries.",
      longDescription:
        "PodcastPal fills the gap between passive listening and active learning. As you listen, you can tap to bookmark moments, and the app generates summaries and highlights using on-device ML. Discovery is powered by a recommendation engine that learns your listening style over time. We're building natively in Swift and need iOS engineers and an ML engineer to improve the recommendation model.",
      tags: ["Swift", "iOS", "Machine Learning", "Mobile"],
      openRoles: ["iOS Developer", "ML Engineer"],
      ownerId: "seed-user-mrivera",
      createdAt: new Date("2026-03-20"),
      githubUrl: null,
      timelineDate: null,
      openSlots: null,
    },
    {
      id: "seed-project-datastream",
      slug: "datastream",
      title: "DataStream",
      description:
        "A real-time analytics platform for high-throughput event data with a React-based live dashboard.",
      longDescription:
        "DataStream is an open-source analytics pipeline built for teams that generate millions of events per day. We use Kafka for ingestion, Apache Flink for stream processing, and ClickHouse for fast analytical queries. The frontend is a React dashboard with live-updating charts. This is a complex, distributed system — we're looking for experienced engineers who want to work on hard infrastructure problems.",
      tags: ["Kafka", "Apache Flink", "React", "Big Data"],
      openRoles: ["Data Engineer", "Frontend Engineer", "DevOps Engineer"],
      ownerId: "seed-user-alexchen",
      createdAt: new Date("2026-03-25"),
      githubUrl: "https://github.com/example/datastream",
      timelineDate: new Date("2027-03-01"),
      openSlots: null,
    },
    {
      id: "seed-project-eduflow",
      slug: "eduflow",
      title: "EduFlow",
      description:
        "An online tutoring platform connecting students with peer tutors via video, with session recording and replay.",
      longDescription:
        "EduFlow makes peer tutoring accessible and structured. Students book sessions, tutors run live video calls with shared whiteboards, and sessions are recorded for later review. We handle scheduling, payments, and async feedback. Built on Next.js, PostgreSQL, and the Livekit video API. We're looking for full-stack contributors, a UI designer, and a video integration engineer.",
      tags: ["Next.js", "PostgreSQL", "Education", "Video"],
      openRoles: ["Full Stack Developer", "UI Designer", "Video Engineer"],
      ownerId: "seed-user-samira",
      createdAt: new Date("2026-04-01"),
      githubUrl: null,
      timelineDate: new Date("2026-12-01"),
      openSlots: null,
    },
  ];

  // --- Project roles ---
  const seedRoles = [
    // Existing projects — now with difficulty
    {
      id: "seed-role-devboard-1",
      projectId: "seed-project-devboard",
      name: "Backend Engineer",
      hourlyRate: "75",
      salary: null,
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-devboard-2",
      projectId: "seed-project-devboard",
      name: "DevOps",
      hourlyRate: null,
      salary: "90000",
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-lingua-1",
      projectId: "seed-project-lingua",
      name: "Mobile Developer",
      hourlyRate: "65",
      salary: null,
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-lingua-2",
      projectId: "seed-project-lingua",
      name: "Content Designer",
      hourlyRate: null,
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-lingua-3",
      projectId: "seed-project-lingua",
      name: "API Engineer",
      hourlyRate: "70",
      salary: null,
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-greenlens-1",
      projectId: "seed-project-greenlens",
      name: "Frontend Engineer",
      hourlyRate: "60",
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-patchwork-1",
      projectId: "seed-project-patchwork",
      name: "Rust Developer",
      hourlyRate: "80",
      salary: null,
      difficulty: "advanced" as const,
    },
    {
      id: "seed-role-patchwork-2",
      projectId: "seed-project-patchwork",
      name: "Technical Writer",
      hourlyRate: "45",
      salary: null,
      difficulty: "beginner" as const,
    },
    // NightOwl
    {
      id: "seed-role-nightowl-1",
      projectId: "seed-project-nightowl",
      name: "UI Designer",
      hourlyRate: "35",
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-nightowl-2",
      projectId: "seed-project-nightowl",
      name: "Frontend Engineer",
      hourlyRate: "60",
      salary: null,
      difficulty: "intermediate" as const,
    },
    // MapMind
    {
      id: "seed-role-mapmind-1",
      projectId: "seed-project-mapmind",
      name: "Data Engineer",
      hourlyRate: null,
      salary: "115000",
      difficulty: "advanced" as const,
    },
    {
      id: "seed-role-mapmind-2",
      projectId: "seed-project-mapmind",
      name: "Frontend Developer",
      hourlyRate: "72",
      salary: null,
      difficulty: "intermediate" as const,
    },
    // CodeBuddy
    {
      id: "seed-role-codebuddy-1",
      projectId: "seed-project-codebuddy",
      name: "ML Engineer",
      hourlyRate: "110",
      salary: null,
      difficulty: "advanced" as const,
    },
    {
      id: "seed-role-codebuddy-2",
      projectId: "seed-project-codebuddy",
      name: "Backend Developer",
      hourlyRate: "78",
      salary: null,
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-codebuddy-3",
      projectId: "seed-project-codebuddy",
      name: "Technical Writer",
      hourlyRate: "42",
      salary: null,
      difficulty: "beginner" as const,
    },
    // VaultSafe
    {
      id: "seed-role-vaultsafe-1",
      projectId: "seed-project-vaultsafe",
      name: "Security Engineer",
      hourlyRate: null,
      salary: "135000",
      difficulty: "advanced" as const,
    },
    {
      id: "seed-role-vaultsafe-2",
      projectId: "seed-project-vaultsafe",
      name: "UI Developer",
      hourlyRate: "68",
      salary: null,
      difficulty: "intermediate" as const,
    },
    // FoodGrid
    {
      id: "seed-role-foodgrid-1",
      projectId: "seed-project-foodgrid",
      name: "Frontend Developer",
      hourlyRate: "44",
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-foodgrid-2",
      projectId: "seed-project-foodgrid",
      name: "Backend Developer",
      hourlyRate: "50",
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-foodgrid-3",
      projectId: "seed-project-foodgrid",
      name: "Content Manager",
      hourlyRate: "32",
      salary: null,
      difficulty: "beginner" as const,
    },
    // SprintSync
    {
      id: "seed-role-sprintsync-1",
      projectId: "seed-project-sprintsync",
      name: "Frontend Engineer",
      hourlyRate: null,
      salary: "92000",
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-sprintsync-2",
      projectId: "seed-project-sprintsync",
      name: "Product Designer",
      hourlyRate: "72",
      salary: null,
      difficulty: "intermediate" as const,
    },
    // ArtCanvas
    {
      id: "seed-role-artcanvas-1",
      projectId: "seed-project-artcanvas",
      name: "Frontend Developer",
      hourlyRate: "38",
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-artcanvas-2",
      projectId: "seed-project-artcanvas",
      name: "Game Developer",
      hourlyRate: "40",
      salary: null,
      difficulty: "beginner" as const,
    },
    // PodcastPal
    {
      id: "seed-role-podcastpal-1",
      projectId: "seed-project-podcastpal",
      name: "iOS Developer",
      hourlyRate: null,
      salary: "105000",
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-podcastpal-2",
      projectId: "seed-project-podcastpal",
      name: "ML Engineer",
      hourlyRate: null,
      salary: "125000",
      difficulty: "advanced" as const,
    },
    // DataStream
    {
      id: "seed-role-datastream-1",
      projectId: "seed-project-datastream",
      name: "Data Engineer",
      hourlyRate: null,
      salary: "138000",
      difficulty: "advanced" as const,
    },
    {
      id: "seed-role-datastream-2",
      projectId: "seed-project-datastream",
      name: "Frontend Engineer",
      hourlyRate: "82",
      salary: null,
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-datastream-3",
      projectId: "seed-project-datastream",
      name: "DevOps Engineer",
      hourlyRate: null,
      salary: "122000",
      difficulty: "advanced" as const,
    },
    // EduFlow
    {
      id: "seed-role-eduflow-1",
      projectId: "seed-project-eduflow",
      name: "Full Stack Developer",
      hourlyRate: "76",
      salary: null,
      difficulty: "intermediate" as const,
    },
    {
      id: "seed-role-eduflow-2",
      projectId: "seed-project-eduflow",
      name: "UI Designer",
      hourlyRate: "46",
      salary: null,
      difficulty: "beginner" as const,
    },
    {
      id: "seed-role-eduflow-3",
      projectId: "seed-project-eduflow",
      name: "Video Engineer",
      hourlyRate: "92",
      salary: null,
      difficulty: "advanced" as const,
    },
  ];

  // --- Project members ---
  const seedMembers = [
    // Original projects
    {
      id: "seed-member-devboard-alex",
      projectId: "seed-project-devboard",
      userId: "seed-user-alexchen",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-devboard-samira",
      projectId: "seed-project-devboard",
      userId: "seed-user-samira",
      name: null,
      role: "Frontend Engineer",
    },
    {
      id: "seed-member-lingua-jpark",
      projectId: "seed-project-lingua",
      userId: "seed-user-jpark",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-lingua-mrivera",
      projectId: "seed-project-lingua",
      userId: "seed-user-mrivera",
      name: null,
      role: "Mobile Developer",
    },
    {
      id: "seed-member-greenlens-samira",
      projectId: "seed-project-greenlens",
      userId: "seed-user-samira",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-patchwork-alex",
      projectId: "seed-project-patchwork",
      userId: "seed-user-alexchen",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-patchwork-jpark",
      projectId: "seed-project-patchwork",
      userId: "seed-user-jpark",
      name: null,
      role: "Rust Developer",
    },
    // New projects — owner members
    {
      id: "seed-member-nightowl-samira",
      projectId: "seed-project-nightowl",
      userId: "seed-user-samira",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-mapmind-jpark",
      projectId: "seed-project-mapmind",
      userId: "seed-user-jpark",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-codebuddy-alex",
      projectId: "seed-project-codebuddy",
      userId: "seed-user-alexchen",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-vaultsafe-mrivera",
      projectId: "seed-project-vaultsafe",
      userId: "seed-user-mrivera",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-foodgrid-samira",
      projectId: "seed-project-foodgrid",
      userId: "seed-user-samira",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-sprintsync-alex",
      projectId: "seed-project-sprintsync",
      userId: "seed-user-alexchen",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-artcanvas-jpark",
      projectId: "seed-project-artcanvas",
      userId: "seed-user-jpark",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-podcastpal-mrivera",
      projectId: "seed-project-podcastpal",
      userId: "seed-user-mrivera",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-datastream-alex",
      projectId: "seed-project-datastream",
      userId: "seed-user-alexchen",
      name: null,
      role: "Owner",
    },
    {
      id: "seed-member-eduflow-samira",
      projectId: "seed-project-eduflow",
      userId: "seed-user-samira",
      name: null,
      role: "Owner",
    },
  ];

  console.log("Seeding users...");
  await db.insert(users).values(seedUsers).onConflictDoUpdate({
    target: users.id,
    set: {
      username: sql`excluded.username`,
      bio: sql`excluded.bio`,
      skills: sql`excluded.skills`,
      socialLinks: sql`excluded."socialLinks"`,
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
      githubUrl: sql`excluded."githubUrl"`,
      timelineDate: sql`excluded."timelineDate"`,
      openSlots: sql`excluded."openSlots"`,
    },
  });

  // Delete and re-insert roles and members for seed projects to avoid stale rows
  const seedProjectIds = seedProjects.map((p) => p.id);
  console.log("Clearing seed project roles and members...");
  await db.delete(projectRoles).where(
    sql`${projectRoles.projectId} = ANY(ARRAY[${sql.join(seedProjectIds.map((id) => sql`${id}`), sql`, `)}])`,
  );
  await db.delete(projectMembers).where(
    sql`${projectMembers.projectId} = ANY(ARRAY[${sql.join(seedProjectIds.map((id) => sql`${id}`), sql`, `)}])`,
  );

  console.log("Seeding project roles...");
  await db.insert(projectRoles).values(seedRoles);

  console.log("Seeding project members...");
  await db.insert(projectMembers).values(seedMembers);

  console.log(`Done. (password for all users: "${SEED_PASSWORD}")`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
