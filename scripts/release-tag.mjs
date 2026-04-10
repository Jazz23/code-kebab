import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const packageJsonPath = resolve("package.json");
const chartYamlPath = resolve("charts/code-kebab/Chart.yaml");
const chartValuesPath = resolve("charts/code-kebab/values.yaml");
const deployYamlPath = resolve(
  ".hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml",
);
const releasePaths = [
  "package.json",
  "charts/code-kebab/Chart.yaml",
  "charts/code-kebab/values.yaml",
  ".hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml",
];

function runGit(args) {
  return execFileSync("git", args, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();
}

function usage() {
  console.log("Usage: bun release:tag <version>");
  console.log("Example: bun release:tag 0.1.1");
  console.log("Also accepts: bun release:tag v0.1.1");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function replaceRequired(content, pattern, replacement, description) {
  if (!pattern.test(content)) {
    fail(`Could not update ${description}`);
  }

  return content.replace(pattern, replacement);
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

const gitTag = `v${rawVersion}`;
const gitStatus = runGit(["status", "--porcelain"]);
const dirtyEntries = gitStatus
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const hasUnmanagedChanges = dirtyEntries.some((line) => {
  const path = line.slice(3);
  return !releasePaths.includes(path);
});

if (hasUnmanagedChanges) {
  fail(
    "Worktree has changes outside the release-managed files. Commit or stash them before releasing.",
  );
}

const currentBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!currentBranch || currentBranch === "HEAD") {
  fail("Detached HEAD is not supported. Check out a branch before releasing.");
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const previousVersion = packageJson.version;

try {
  runGit(["rev-parse", "--verify", `refs/tags/${gitTag}`]);
  fail(`Git tag ${gitTag} already exists`);
} catch {
  // Tag does not exist, continue.
}

const chartYaml = readFileSync(chartYamlPath, "utf8");
const chartValues = readFileSync(chartValuesPath, "utf8");
const deployYaml = readFileSync(deployYamlPath, "utf8");

packageJson.version = rawVersion;

const nextChartYaml = replaceRequired(
  chartYaml,
  /^(appVersion:\s*)"[^"]*"$/m,
  `$1"${gitTag}"`,
  "charts/code-kebab/Chart.yaml appVersion",
);
const nextChartValues = replaceRequired(
  chartValues,
  /(image:\n\s+repository:[^\n]+\n\s+pullPolicy:[^\n]+\n\s+tag:\s*)"[^"]*"/,
  `$1"${gitTag}"`,
  "charts/code-kebab/values.yaml image.tag",
);
const nextDeployYaml = replaceRequired(
  deployYaml,
  /(image:\n\s+repository:[^\n]+\n\s+tag:\s*)"[^"]*"/,
  `$1"${gitTag}"`,
  ".hazyforge/clusters/code-kebab/namespace/code-kebab/deploy.yaml image.tag",
);

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
writeFileSync(chartYamlPath, nextChartYaml);
writeFileSync(chartValuesPath, nextChartValues);
writeFileSync(deployYamlPath, nextDeployYaml);
runGit(["add", ...releasePaths]);

const hasStagedChanges = (() => {
  try {
    runGit(["diff", "--cached", "--quiet"]);
    return false;
  } catch {
    return true;
  }
})();

if (!hasStagedChanges) {
  fail(`Release files are already set to ${rawVersion}`);
}

try {
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

if (previousVersion === rawVersion) {
  console.log(`Released ${rawVersion} (${gitTag}) with synced deployment tags.`);
} else {
  console.log(
    `Released ${rawVersion} (${gitTag}) from ${previousVersion} with synced deployment tags.`,
  );
}
