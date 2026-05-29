import Image from "next/image";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allProjects = await getProjects();
  const featured = allProjects.slice(0, 3);

  return (
    <main className="flex-1">
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#140f18]/5 via-[#140f18]/20 to-[#140f18]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="ck-status-badge mb-8 inline-flex items-center gap-2 rounded-full border border-[#00a876]/30 bg-[#00a876]/10 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#7ef2cb]">
              <span className="ck-status-dot h-1.5 w-1.5 rounded-full bg-[#00a876] shadow-[0_0_12px_rgba(0,168,118,0.8)]" />
              Network Online
              <span className="ck-status-divider text-[#00a876]/40">/</span>
              {allProjects.length.toLocaleString()} Projects
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Find Projects.
              <span className="block text-[#ff9e2c]">Find People.</span>
              <span className="mt-2 block text-[#c6c0da] drop-shadow-[0_10px_28px_rgba(198,192,218,0.16)]">
                Build Together.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d6d0e5]">
              Browse open projects looking for contributors, or connect with
              developers ready to build something new.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/projects" className="ck-button-primary px-6 py-3">
                Browse Projects
              </Link>
              <Link href="/posts" className="ck-button-secondary px-6 py-3">
                Browse Posts
              </Link>
            </div>
          </div>

          <div className="ck-panel hidden min-h-[460px] rounded-[2rem] p-6 lg:block">
            <div className="absolute left-5 top-5 h-10 w-10 border-l-2 border-t-2 border-[#00a876]/55" />
            <div className="absolute right-5 top-5 h-10 w-10 border-r-2 border-t-2 border-[#ff9e2c]/55" />
            <div className="absolute bottom-5 left-5 h-10 w-10 border-b-2 border-l-2 border-[#c6c0da]/45" />
            <div className="absolute bottom-5 right-5 h-10 w-10 border-b-2 border-r-2 border-[#00a876]/45" />
            <div className="flex h-full flex-col items-center justify-center gap-8">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-8 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.18)]">
                <Image
                  src="/code-kebab-logo.svg"
                  alt="code-kebab"
                  width={200}
                  height={63}
                  className="h-16 w-auto"
                />
              </div>
              <div className="text-center">
                <div className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#a59cb8]">
                  Collaboration Status
                </div>
                <div className="mt-2 font-mono text-sm font-bold uppercase tracking-[0.08em] text-[#7ef2cb]">
                  Operational
                </div>
              </div>
              <div className="grid w-full grid-cols-3 gap-3">
                {["Build", "Ship", "Learn"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#ddd7ef]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ck-section border-y border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white">
              Featured Projects
            </h2>
            <Link
              href="/projects"
              className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#ffb04a] transition-colors hover:text-[#ffd08c]"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1a1420]/90">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-black text-white">How it works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-5xl font-black text-transparent [-webkit-text-stroke:2px_#00a876]">
                01
              </div>
              <h3 className="mt-4 font-semibold text-white">Browse projects</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a59cb8]">
                Explore projects that match your skills and interests. Filter by
                technology, role, or topic.
              </p>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent [-webkit-text-stroke:2px_#ff9e2c]">
                02
              </div>
              <h3 className="mt-4 font-semibold text-white">
                Discover developers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a59cb8]">
                Browse posts from developers who don&apos;t have a project yet
                but are looking for collaborators to build something new.
              </p>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent [-webkit-text-stroke:2px_#c6c0da]">
                03
              </div>
              <h3 className="mt-4 font-semibold text-white">Request to join</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a59cb8]">
                Found something you like? Send a join request with a short
                message about what you&apos;d bring to the team.
              </p>
            </div>
            <div>
              <div className="text-5xl font-black text-transparent [-webkit-text-stroke:2px_#00a876]">
                04
              </div>
              <h3 className="mt-4 font-semibold text-white">Build together</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a59cb8]">
                Once accepted, collaborate with your team. Ship features, squash
                bugs, and learn from each other.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
