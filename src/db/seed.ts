import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { posts, projectMembers, projectRoles, projects, users } from "./schema";

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
      socialLinks: [
        "https://github.com/alexchen",
        "https://linkedin.com/in/alexchen",
      ],
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
      socialLinks: [
        "https://github.com/samiraosei",
        "https://dribbble.com/samiraosei",
      ],
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
      socialLinks: [
        "https://github.com/mrivera",
        "https://linkedin.com/in/mariafrivera",
      ],
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
      openRoles: [],
      ownerId: "seed-user-samira",
      createdAt: new Date("2026-01-25"),
      githubUrl: null,
      timelineDate: new Date("2026-06-15"),
      openSlots: 2,
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
      openRoles: [],
      ownerId: "seed-user-samira",
      createdAt: new Date("2026-02-25"),
      githubUrl: null,
      timelineDate: new Date("2026-10-01"),
      openSlots: 3,
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
      openRoles: [],
      ownerId: "seed-user-alexchen",
      createdAt: new Date("2026-03-05"),
      githubUrl: null,
      timelineDate: new Date("2026-07-15"),
      openSlots: 2,
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
      openRoles: [],
      ownerId: "seed-user-jpark",
      createdAt: new Date("2026-03-15"),
      githubUrl: "https://github.com/example/artcanvas",
      timelineDate: new Date("2026-09-01"),
      openSlots: 2,
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
  await db
    .insert(users)
    .values(seedUsers)
    .onConflictDoUpdate({
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
  await db
    .insert(projects)
    .values(seedProjects)
    .onConflictDoUpdate({
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
    sql`${projectRoles.projectId} = ANY(ARRAY[${sql.join(
      seedProjectIds.map((id) => sql`${id}`),
      sql`, `,
    )}])`,
  );
  await db.delete(projectMembers).where(
    sql`${projectMembers.projectId} = ANY(ARRAY[${sql.join(
      seedProjectIds.map((id) => sql`${id}`),
      sql`, `,
    )}])`,
  );

  console.log("Seeding project roles...");
  await db.insert(projectRoles).values(seedRoles);

  console.log("Seeding project members...");
  await db.insert(projectMembers).values(seedMembers);

  // --- Posts ---
  const seedPosts = [
    {
      id: "seed-post-1",
      title:
        "Looking for a co-founder / coding partner for a SaaS side project",
      description: `Hey everyone! I've been heads-down on a dev tools SaaS idea for the past month and I'm at the point where I really need someone to build with. Flying solo is getting lonely and I keep context-switching between frontend and backend when I should be going deep on one.

I'm building a lightweight code review tool for small teams who find GitHub's PR review UX too heavy. Think focused inline comments, async approval flows, and a clean diff view — without the GitHub overhead. Early prototype is working, a few friends are already using it.

I'm looking for a frontend-focused developer who's comfortable with React and has an eye for UX. The backend is mostly done (Next.js API routes + PostgreSQL). What's missing is polish: a great diff viewer component, keyboard shortcuts, a responsive layout that doesn't feel like an afterthought.

You'd be a good fit if you've shipped at least one side project of your own, care about interaction design (not just making things work), are comfortable working async (I'm UTC+1, open to anyone), and want real equity, not just a "contributor" credit.

I bring the initial codebase (TypeScript throughout, well-structured), a small group of beta users already giving feedback, and product and backend coverage so you can focus on UI.

If this sounds interesting, send me a message with something you've built — doesn't have to be polished, just something real.`,
      tags: ["TypeScript", "React", "Next.js", "SaaS", "Developer Tools"],
      authorId: "seed-user-alexchen",
      createdAt: new Date("2026-02-14"),
    },
    {
      id: "seed-post-2",
      title:
        "Wanting to find a backend dev to pair with on weekends — accessibility tooling project",
      description: `I'm a frontend/design-leaning developer and I've been prototyping an automated accessibility auditing tool that goes beyond what axe and Lighthouse currently offer. I have the UI and the browser extension shell built, but I'm stuck on the backend — and honestly, I don't enjoy backend work enough to do it well.

The tool crawls a site, runs a suite of WCAG checks, stores historical results, and surfaces regressions in a dashboard. The crawler and audit runner need to be robust, scalable, and fast. That's the part I need help with.

I'm looking for a backend developer who knows Node.js or Go, has dealt with job queues, workers, or crawling before, is available on weekend mornings (I'm based in London, flexible on time zones), and wants a genuine co-build, not just task-swapping.

I'm not looking for someone to just write code I spec out. I want a real collaborator who'll push back on my ideas and bring their own. If you think the crawler should be written differently than I've planned, I want to hear it.

Time commitment is probably 4–6 hours a week to start. No crunch, no deadlines. We go at a pace that keeps it fun.

Drop me a message if you're interested. Would love to jump on a quick call first to see if we click.`,
      tags: [
        "Node.js",
        "Accessibility",
        "TypeScript",
        "Developer Tools",
        "Open Source",
      ],
      authorId: "seed-user-samira",
      createdAt: new Date("2026-02-22"),
    },
    {
      id: "seed-post-3",
      title:
        "Anyone want to build a distributed tracing side project together? (Go / Rust)",
      description: `I work on data infrastructure professionally and I want to scratch an itch that my day job doesn't let me: building a lightweight, self-hosted distributed tracing system — basically a stripped-down Jaeger/Tempo that's easy to run on a single VPS without Kubernetes.

Most observability tooling assumes you have a big infrastructure budget or are comfortable with heavy operational overhead. I want something you can "docker compose up" and forget.

I have a proof-of-concept trace collector written in Go that receives OTLP spans and stores them in SQLite. Query performance is already surprisingly good for small-to-medium trace volumes. The hard parts remaining are a decent query language and filter UI, trace visualization (the waterfall view), sampling strategies, and optional multi-node support.

I want to work with another systems-minded developer who finds this genuinely interesting. Go or Rust background preferred — I don't want to introduce a language nobody knows for a side project.

You don't need to know observability deeply. I can onboard you on the domain. What matters more is that you care about correctness, enjoy reading RFCs, and won't go quiet for three weeks without warning.

Async-first. Weekly sync call optional. I use a shared Linear board to track work. If this sounds like your kind of project, send me a message.`,
      tags: ["Go", "Rust", "PostgreSQL", "Developer Tools", "Open Source"],
      authorId: "seed-user-jpark",
      createdAt: new Date("2026-03-03"),
    },
    {
      id: "seed-post-4",
      title:
        "CS student looking for a more experienced dev to build something real with",
      description: `I'm a second-year CS student and I've hit the ceiling of what I can learn from tutorials and toy projects. I want to build something real with someone who's been in the industry — not a mentor relationship exactly, more of a genuine collaboration where I'm a useful contributor, not just a passenger.

What I can bring: mobile development (I'm most comfortable with React Native and have shipped two small apps to the App Store), Firebase and Supabase backend integration, time (I'm a student, I can put in real hours), and fresh eyes on product decisions.

I'm hoping to find someone with a project idea or early-stage side project that could use a mobile frontend. I'm not looking for a job or an internship — just someone to build alongside and learn from in the process. I'm not precious about the idea. If you have something you've been wanting to build but don't want to do the mobile side, let's talk.

What I'm not looking for: vague "let's build an app" conversations that go nowhere. I want someone who has a concrete idea they're actually excited about, and who's willing to commit to showing up consistently.

My timezone is EST. Message me and let's find something worth building.`,
      tags: ["React Native", "Firebase", "Mobile", "iOS", "Android"],
      authorId: "seed-user-mrivera",
      createdAt: new Date("2026-03-12"),
    },
    {
      id: "seed-post-5",
      title: "Looking for a developer to co-build an open source design system",
      description: `I've been maintaining a small component library for my own projects for about two years. It's grown to around 40 components, has a coherent design language, and I've been told multiple times I should open source it properly. I want to do that — but doing it right means more than just pushing to GitHub.

Doing it right means a proper documentation site (I'm thinking Astro or Docusaurus), Storybook integration, an accessibility audit and fixes across all components, a11y and interaction tests, and a semantic versioning and changelog process. That's a lot for one person alongside a full-time job, so I'm looking for someone to split this work with — ideally someone who's been through the process of open-sourcing a project before.

The stack is React and TypeScript with Tailwind CSS for styling. Nothing exotic.

A great fit would be someone with experience maintaining or contributing to an open source UI library, comfortable with Storybook and writing good component docs, and interested in design systems as a craft, not just "make it look nice."

This isn't a startup. There's no monetization plan. It's about building something useful for the community and doing it properly.

If you want to see the current state of the library before deciding, just ask and I'll share the private repo link.`,
      tags: [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Open Source",
        "Accessibility",
      ],
      authorId: "seed-user-samira",
      createdAt: new Date("2026-03-19"),
    },
    {
      id: "seed-post-6",
      title:
        "Pair programming partner wanted — I'll help with your project if you help with mine",
      description: `Simple proposition: I'm looking for a developer to do regular pair programming sessions with. I'll help with your project, you help with mine. Structured knowledge exchange, not mentorship, not freelancing — just two people building together.

I'm a full-stack developer, strongest in TypeScript and the React/Next.js ecosystem. I've been writing code professionally for four years. Currently working on a local-first notes app that syncs across devices. The hard part is the sync engine — I'm implementing a simple event log approach and would love a second brain on it.

From the sessions I want roughly 2 hours per week, alternating whose project we work on. I find I write better code when someone's watching, ask better questions when I have to explain my thinking out loud, and catch more bugs in someone else's code than in my own.

What you should bring: a real project you're actively working on (not "I have an idea"), willingness to share your screen and think out loud, any stack (I can be useful across languages even if I don't know yours deeply), and some overlap in availability (I'm UTC, flexible within reason).

Not a job. Not equity. Not a commitment to ship anything. Just two developers making each other sharper.

If you're interested, message me with a one-liner about what you're building. We'll take it from there.`,
      tags: ["TypeScript", "React", "Next.js", "Offline-first", "Open Source"],
      authorId: "seed-user-alexchen",
      createdAt: new Date("2026-03-28"),
    },
  ];

  console.log("Seeding posts...");
  await db
    .insert(posts)
    .values(seedPosts)
    .onConflictDoUpdate({
      target: posts.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        tags: sql`excluded.tags`,
      },
    });

  console.log(`Done. (password for all users: "${SEED_PASSWORD}")`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
