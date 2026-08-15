// ANSI colours
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

function getUpdateType(current, target) {
  const [cMaj, cMin, cPatch] = current.replace(/^[^\d]*/, "").split(".").map(Number);
  const [tMaj, tMin, tPatch] = target.replace(/^[^\d]*/, "").split(".").map(Number);

  if (tMaj > cMaj) return "major";
  if (tMin > cMin) return "minor";
  return "patch";
}

function colourVersion(type, version, enableColour) {
  if (!enableColour) return version;

  if (type === "major") return `${RED}${version}${RESET}`;
  if (type === "minor") return `${CYAN}${version}${RESET}`;
  return `${GREEN}${version}${RESET}`;
}

function pad(str, width) {
  return str.padEnd(width, " ");
}

export function formatReport(result) {
  const lines = [];

  lines.push(`Cooldown days: ${result.cooldownDays}`);
  lines.push("");

  // Table header
  lines.push(
    pad("Package", 25) +
    pad("Installed", 15) +
    pad("Updated", 15) +
    "Notes"
  );
  lines.push("-".repeat(70));

  if (result.packagesToUpdate.length === 0) {
    lines.push("No packages eligible for update.");
  } else {
    for (const p of result.packagesToUpdate) {
      const type = getUpdateType(p.currentVersion, p.targetVersion);
      const coloured = colourVersion(type, p.targetVersion, result.colour);

      const notes = [
        p.major ? "Major update" : "",
        p.ignoreCooldown ? "Ignored cooldown" : "",
        p.withinCooldown ? "Within cooldown" : ""
      ].filter(Boolean).join(", ");

      lines.push(
        pad(p.name, 25) +
        pad(p.currentVersion, 15) +
        pad(coloured, 15) +
        notes
      );
    }
  }

  lines.push("");
  lines.push("Major updates available:");
  lines.push("-".repeat(70));

  if (result.majorUpdates.length === 0) {
    lines.push("None");
  } else {
    for (const p of result.majorUpdates) {
      const coloured = colourVersion("major", p.targetVersion);
      const notes = p.majorAllowed ? "Allowed" : "Blocked";

      lines.push(
        pad(p.name, 25) +
        pad(p.currentVersion, 15) +
        pad(coloured, 15) +
        notes
      );
    }
  }

  return lines.join("\n");
}

export function printReport(result) {
  console.log(formatReport(result));
}
