export function formatReport(result) {
  const lines = [];

  lines.push(`Cooldown days: ${result.cooldownDays}`);
  lines.push('');

  if (result.packagesToUpdate.length === 0) {
    lines.push('No packages eligible for update.');
  } else {
    lines.push('Packages eligible for update:');
    for (const p of result.packagesToUpdate) {
      lines.push(
        `- ${p.name} (${p.depType}) ${p.currentVersion} -> ${p.targetVersion}` +
          ` [withinCooldown=${p.withinCooldown}, ignoreCooldown=${p.ignoreCooldown}, major=${p.major}]`
      );
    }
  }

  lines.push('');
  if (result.majorUpdates.length > 0) {
    lines.push('Packages with major updates available:');
    for (const p of result.majorUpdates) {
      lines.push(
        `- ${p.name} (${p.depType}) ${p.currentVersion} -> ${p.targetVersion}` +
          ` [majorAllowed=${p.majorAllowed}]`
      );
    }
  } else {
    lines.push('No major updates available.');
  }

  return lines.join('\n');
}

export function printReport(result) {
  const text = formatReport(result);
  console.log(text);
}
