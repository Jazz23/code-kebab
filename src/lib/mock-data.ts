export type User = {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  skills: string[];
  joinedDate: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  owner: User;
  members: User[];
  openRoles: string[];
  createdAt: string;
};

export const users: User[] = [
  {
    username: "alexchen",
    name: "Alex Chen",
    avatar: "AC",
    bio: "Full-stack developer passionate about open source and developer tools.",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    joinedDate: "2025-08-12",
  },
  {
    username: "samira",
    name: "Samira Osei",
    avatar: "SO",
    bio: "UI/UX designer and frontend engineer. Love building delightful experiences.",
    skills: ["Figma", "React", "CSS", "Accessibility"],
    joinedDate: "2025-09-03",
  },
  {
    username: "jpark",
    name: "Jordan Park",
    avatar: "JP",
    bio: "Backend engineer with a focus on distributed systems and data pipelines.",
    skills: ["Go", "Rust", "Kafka", "Kubernetes"],
    joinedDate: "2025-10-21",
  },
  {
    username: "mrivera",
    name: "Maria Rivera",
    avatar: "MR",
    bio: "Mobile developer and CS student. Always learning something new.",
    skills: ["Swift", "Kotlin", "React Native", "Firebase"],
    joinedDate: "2026-01-15",
  },
];

export const projects: Project[] = [
  {
    slug: "devboard",
    title: "DevBoard",
    description:
      "A collaborative dashboard for developer teams to track tasks, share updates, and stay aligned.",
    longDescription:
      "DevBoard is a real-time collaborative dashboard designed for small developer teams. It combines task tracking, team updates, and async standups into a single clean interface. We're building it with Next.js, PostgreSQL, and WebSockets. Looking for contributors who want to ship something useful and learn along the way.",
    tags: ["Next.js", "PostgreSQL", "WebSockets", "TypeScript"],
    owner: users[0],
    members: [users[0], users[1]],
    openRoles: ["Backend Engineer", "DevOps"],
    createdAt: "2026-01-20",
  },
  {
    slug: "lingua",
    title: "Lingua",
    description:
      "An open-source language learning app with spaced repetition and community-created courses.",
    longDescription:
      "Lingua is a free, open-source language learning platform. Users can create and share their own courses, and the app uses spaced repetition algorithms to optimize retention. The frontend is React Native, the backend is Go, and we store everything in SQLite for offline-first support. We need help with mobile UI, backend API design, and course content tooling.",
    tags: ["React Native", "Go", "SQLite", "Education"],
    owner: users[2],
    members: [users[2], users[3]],
    openRoles: ["Mobile Developer", "Content Designer", "API Engineer"],
    createdAt: "2026-02-05",
  },
  {
    slug: "greenlens",
    title: "GreenLens",
    description:
      "A sustainability tracker that helps users measure and reduce their carbon footprint.",
    longDescription:
      "GreenLens helps individuals and small businesses track their environmental impact. Users log activities like travel, energy usage, and purchases, and the app calculates carbon equivalents and suggests alternatives. Built with Next.js and Chart.js for visualization. We're looking for frontend engineers and anyone with domain knowledge in sustainability metrics.",
    tags: ["Next.js", "Chart.js", "Sustainability", "Data Viz"],
    owner: users[1],
    members: [users[1]],
    openRoles: ["Frontend Engineer", "Data Analyst", "Designer"],
    createdAt: "2026-03-01",
  },
  {
    slug: "patchwork",
    title: "Patchwork",
    description:
      "A CLI tool that helps maintainers triage, review, and merge pull requests faster.",
    longDescription:
      "Patchwork is a command-line tool for open-source maintainers who are drowning in PRs. It uses heuristics and optional AI assistance to prioritize reviews, detect conflicts early, and batch-merge safe changes. Written in Rust with a focus on speed and reliability. If you love CLIs and developer tooling, come build with us.",
    tags: ["Rust", "CLI", "Developer Tools", "Open Source"],
    owner: users[0],
    members: [users[0], users[2]],
    openRoles: ["Rust Developer", "Technical Writer"],
    createdAt: "2026-03-10",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getUser(username: string): User | undefined {
  return users.find((u) => u.username === username);
}

export function getUserProjects(username: string): Project[] {
  return projects.filter(
    (p) =>
      p.owner.username === username ||
      p.members.some((m) => m.username === username),
  );
}
