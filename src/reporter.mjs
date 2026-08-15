const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

function pad(str, width) {
  return str.padEnd(width, " ");
}

function getUpdateType(current, target) {
  if (!current || !target) return "patch";

  const [cMaj, cMin] = current.replace(/^[^\d]*/, "").split(".").map(Number);
  const [tMaj, tMin] = target.replace(/^[^\d]*/, "").split(".").map(Number);

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
      const type = getUpdateType(p.currentVersion, p.targetVersion);
      const coloured = colourVersion(type, p.targetVersion, result.colour);

      const notes = [
        p.major ? "Major update" : "",
        p.majorAllowed ? "Allowed" : "Blocked"
      ].filter(Boolean).join(", ");

      lines.push(
        pad(p.name, 25) +
        pad(p.currentVersion ?? "-", 15) +
        pad(coloured ?? "-", 15) +
        pad(`${p.cooldownDays ?? '-'}d`, 12) +
        notes
      );
    }
  }

  lines.push("");
  lines.push("Major updates:");
  lines.push("-".repeat(80));

  if (result.majorUpdates.length === 0) {
    lines.push("None");
  } else {
    for (const p of result.majorUpdates) {
      const coloured = colourVersion("major", p.targetVersion, result.colour);
      const notes = p.majorAllowed ? "Allowed" : "Blocked";

      lines.push(
        pad(p.name, 25) +
        pad(p.currentVersion ?? "-", 15) +
        pad(coloured ?? "-", 15) +
        pad(`${p.cooldownDays ?? '-'}d`, 12) +
        notes
      );
    }
  }

  return lines.join("\n");
}

export function printReport(result) {
  console.log(formatReport(result));
}
