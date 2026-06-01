import Image from "next/image";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allProjects = await getProjects();
  const featured = allProjects.slice(0, 3);
  const openRoleCount = allProjects.reduce(
    (total, project) =>
      total + (project.openRoles.length || project.openSlots || 0),
    0,
  );
  const memberCount = allProjects.reduce(
    (total, project) => total + project.memberCount,
    0,
  );

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(520px,1.12fr)] lg:py-14">
          <div className="max-w-2xl">
            <div className="ck-kicker mb-5 inline-flex items-center gap-3 rounded-full border border-[#ff8a1e]/30 bg-[#ff8a1e]/10 px-4 py-2 text-[#ffbf75]">
              <span className="h-2 w-2 rounded-full bg-[#21c168] shadow-[0_0_18px_rgba(33,193,104,0.75)]" />
              Build Board Live
              <span className="text-[#a89778]">/</span>
              {allProjects.length.toLocaleString()} projects
            </div>
            <h1 className="ck-display max-w-3xl text-6xl font-black leading-[0.86] text-white sm:text-7xl lg:text-8xl">
              Find projects.
              <span className="block text-[#f1e6d2]">Post collabs.</span>
              <span className="block text-[#e0312d]">Build together.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-7 text-[#cbb992]">
              Code Kebab is a build board for developers who want the next thing
              to ship with other people. Browse active projects, post a
              collaborator request, and turn loose ideas into real teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/projects" className="ck-button-primary px-5 py-3">
                Browse Projects
                <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link href="/posts" className="ck-button-secondary px-5 py-3">
                Post Collab Request
              </Link>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-3 border-y border-[#f1e6d2]/12 py-4">
              <div>
                <div className="ck-display text-3xl font-black text-[#ff8a1e]">
                  {openRoleCount.toLocaleString()}
                </div>
                <div className="ck-kicker mt-1 text-[#8d8b82]">Open roles</div>
              </div>
              <div className="border-x border-[#f1e6d2]/12 px-5">
                <div className="ck-display text-3xl font-black text-[#21c168]">
                  {memberCount.toLocaleString()}
                </div>
                <div className="ck-kicker mt-1 text-[#8d8b82]">Builders</div>
              </div>
              <div className="pl-5">
                <div className="ck-display text-3xl font-black text-[#f1e6d2]">
                  24/7
                </div>
                <div className="ck-kicker mt-1 text-[#8d8b82]">Open shop</div>
              </div>
            </div>
          </div>

          <div className="ck-board relative min-h-[560px] overflow-hidden rounded-[1.25rem] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[#f1e6d2]/12 pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/code-kebab-mark.svg"
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11"
                />
                <div>
                  <div className="ck-display text-2xl font-black text-[#f1e6d2]">
                    Code Kebab
                  </div>
                  <div className="ck-kicker text-[#8d8b82]">
                    Project grill / live queue
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                {["Projects", "People", "Activity"].map((label, index) => (
                  <span
                    key={label}
                    className={`ck-kicker rounded-md px-3 py-2 ${
                      index === 0
                        ? "bg-[#ff8a1e] text-[#11100d]"
                        : "text-[#a89778]"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[76px_1fr_170px]">
              <div className="hidden flex-col gap-3 rounded-xl border border-[#f1e6d2]/10 bg-[#f1e6d2]/[0.03] p-3 lg:flex">
                {["&gt;_", "{}", "&lt;/&gt;", "++", "-&gt;"].map(
                  (icon, index) => (
                    <div
                      key={icon}
                      className={`grid h-10 place-items-center rounded-lg font-mono text-sm font-black ${
                        index === 0
                          ? "bg-[#21c168]/16 text-[#9af0bd]"
                          : "text-[#a89778]"
                      }`}
                    >
                      {icon}
                    </div>
                  ),
                )}
              </div>
              <div className="rounded-xl border border-[#f1e6d2]/10 bg-[#0b0d0f]/70 p-4">
                <div className="ck-kicker text-[#21c168]">
                  {"// featured builds"}
                </div>
                <div className="mt-4 space-y-3">
                  {featured.length > 0
                    ? featured.map((project, index) => (
                        <Link
                          key={project.slug}
                          href={`/projects/${project.slug}`}
                          className="group block rounded-lg border border-[#f1e6d2]/10 bg-[#f1e6d2]/[0.035] p-4 transition-colors hover:border-[#ff8a1e]/45"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="ck-display text-xl font-black text-[#f1e6d2] group-hover:text-[#ffbf75]">
                                {project.title}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#cbb992]">
                                {project.description}
                              </p>
                            </div>
                            <span className="ck-kicker shrink-0 rounded-md border border-[#21c168]/25 bg-[#21c168]/10 px-2 py-1 text-[#9af0bd]">
                              {project.openRoles.length ||
                                project.openSlots ||
                                index + 1}{" "}
                              open
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="ck-chip rounded-md px-2 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Link>
                      ))
                    : [
                        "Next auth starter",
                        "Realtime collab editor",
                        "Open API hub",
                      ].map((label) => (
                        <div
                          key={label}
                          className="rounded-lg border border-[#f1e6d2]/10 bg-[#f1e6d2]/[0.035] p-4"
                        >
                          <div className="ck-display text-xl font-black text-[#f1e6d2]">
                            {label}
                          </div>
                          <div className="mt-3 h-2 w-4/5 rounded bg-[#8d8b82]/25" />
                          <div className="mt-2 h-2 w-2/3 rounded bg-[#8d8b82]/18" />
                        </div>
                      ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#f1e6d2]/10 bg-[#f1e6d2]/[0.03] p-4">
                <div className="ck-kicker text-[#21c168]">Active now</div>
                <div className="mt-3 space-y-3">
                  {["Frontend", "Infra", "Design", "API", "Data"].map(
                    (label, index) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full border border-[#ff8a1e]/30 bg-[#ff8a1e]/10 font-mono text-[10px] font-black text-[#ffbf75]">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="h-1.5 w-full rounded bg-[#8d8b82]/25" />
                          <div className="mt-1.5 h-1.5 w-2/3 rounded bg-[#8d8b82]/16" />
                        </div>
                        <span className="h-2 w-2 rounded-full bg-[#21c168]" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ck-section border-y border-[#f1e6d2]/12">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="ck-kicker text-[#ff8a1e]">Featured projects</div>
              <h2 className="ck-display mt-2 text-4xl font-black text-white">
                Fresh from the board
              </h2>
            </div>
            <Link
              href="/projects"
              className="ck-kicker hidden text-[#ffbf75] transition-colors hover:text-[#f1e6d2] sm:block"
            >
              View all -&gt;
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-4">
          {[
            [
              "01",
              "Browse the board",
              "Filter open projects by stack, role, pay, and timeline.",
            ],
            [
              "02",
              "Post a collab",
              "Share the thing you want to build before you have the team.",
            ],
            [
              "03",
              "Request a seat",
              "Send a focused join request that tells a maintainer what you bring.",
            ],
            [
              "04",
              "Ship together",
              "Move from discovery into a working project space with your team.",
            ],
          ].map(([step, title, body]) => (
            <div key={step} className="border-t border-[#f1e6d2]/12 pt-5">
              <div className="ck-display text-5xl font-black text-transparent [-webkit-text-stroke:1.5px_var(--ember)]">
                {step}
              </div>
              <h3 className="ck-display mt-3 text-2xl font-black text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#cbb992]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
