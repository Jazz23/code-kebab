import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const packageJsonPath = resolve("package.json");

function runGit(args) {
  return execFileSync("git", args, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();
}

function usage() {
  console.log("Usage: npm run release:tag -- <version>");
  console.log("Example: npm run release:tag -- 0.1.1");
  console.log("Also accepts: npm run release:tag -- v0.1.1");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const inputVersion = process.argv[2]?.trim();

if (!inputVersion || inputVersion === "--help" || inputVersion === "-h") {
  usage();
  process.exit(inputVersion ? 0 : 1);
}

const rawVersion = inputVersion.startsWith("v")
  ? inputVersion.slice(1)
  : inputVersion;

if (
  !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(rawVersion)
) {
  fail(`Invalid version: ${inputVersion}`);
}

const gitStatus = runGit(["status", "--porcelain"]);
if (gitStatus) {
  fail(
    "Worktree is not clean. Commit or stash existing changes before releasing.",
  );
}

const currentBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!currentBranch || currentBranch === "HEAD") {
  fail("Detached HEAD is not supported. Check out a branch before releasing.");
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const previousVersion = packageJson.version;
const gitTag = `v${rawVersion}`;

if (previousVersion === rawVersion) {
  fail(`package.json is already at version ${rawVersion}`);
}

try {
  runGit(["rev-parse", "--verify", `refs/tags/${gitTag}`]);
  fail(`Git tag ${gitTag} already exists`);
} catch {
  // Tag does not exist, continue.
}

packageJson.version = rawVersion;
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

try {
  runGit(["add", "package.json"]);
  runGit(["commit", "-m", `chore: release ${rawVersion}`]);
  runGit(["tag", "-a", gitTag, "-m", gitTag]);
  runGit(["push", "origin", currentBranch]);
  runGit(["push", "origin", gitTag]);
} catch (error) {
  const message =
    error instanceof Error &&
    "stderr" in error &&
    typeof error.stderr === "string"
      ? error.stderr.trim()
      : error instanceof Error
        ? error.message
        : String(error);
  fail(message);
}

console.log(`Released ${rawVersion}`);
