import semver from "semver";

const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

function pad(str, width) {
  return str.padEnd(width, " ");
}

function getUpdateType(pkg) {
  // 1. Fallback always wins
  if (pkg.fallbackUsed) return "fallback";

  // 2. Major flag from runner
  if (pkg.major) return "major";

  // 3. Compute minor/patch using semver
  const current = semver.coerce(pkg.currentVersion);
  const target = semver.coerce(pkg.targetVersion);

  if (!current || !target) return "patch"; // safest fallback

  if (semver.minor(target) > semver.minor(current))  return "minor";

  return "patch";
}

function colourVersion(type, version, enableColour) {
  if (!enableColour) return version;
  if (type === "major") return `${RED}${version}${RESET}`;
  if (type === "minor") return `${CYAN}${version}${RESET}`;
  if (type === "patch") return `${GREEN}${version}${RESET}`;
  if (type === "fallback") return `${GREEN}${version}${RESET}`;
  return version;
}

function buildNotes(pkg, type) {
  const notes = [];

  if (pkg.fallbackUsed) {
    notes.push("Fallback update");
  } else if (['major', 'minor', 'patch'].includes(type)) {
    const str = type[0].toUpperCase() + type.slice(1);
    notes.push(`${str} update`);
  }

  if (pkg.major && !pkg.majorAllowed) {
    notes.push("Blocked by rule");
  }

  if (!pkg.eligible) {
    notes.push("Not eligible");
  }

  return notes.join("; ");
}

export function formatReport(result) {
  const lines = [];

  lines.push(`Cooldown days: ${result.cooldownDays}`);
  lines.push("");

  lines.push(
    pad("Package", 25) +
    pad("Installed", 15) +
    pad("Updated", 15) +
    pad("Cooldown", 12) +
    "Notes"
  );
  lines.push("-".repeat(80));

  if (result.packagesToUpdate.length === 0) {
    lines.push("No packages eligible for update.");
  } else {
    for (const p of result.packagesToUpdate) {
      const type = getUpdateType(p);
      const coloured = colourVersion(type, p.targetVersion, result.colour);
      const cooldown = `${p.cooldownDays}d`;
      const notes = buildNotes(p, type);

      const row =
        pad(p.name, 25) +
        pad(p.currentVersion, 15) +
        pad(coloured, 24) +
        pad(cooldown, 12) +
        notes;

      lines.push(row);
    }
  }

  lines.push("");
  lines.push("Major updates:");
  lines.push("-".repeat(80));

  if (result.majorUpdates.length === 0) {
    lines.push("None");
  } else {
    for (const p of result.majorUpdates) {
      const type = getUpdateType(p);
      const coloured = colourVersion(type, p.targetVersion, result.colour);
      const cooldown = `${p.cooldownDays}d`;
      const notes = buildNotes(p);

      const row =
        pad(p.name, 25) +
        pad(p.currentVersion, 15) +
        pad(coloured, 15) +
        pad(cooldown, 12) +
        notes;

      lines.push(row);
    }
  }

  return lines.join("\n");
}

export function printReport(result) {
  console.log(formatReport(result));
}
