import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';

export function loadConfig(configPath) {
  if (!configPath) {
    return {
      cooldownDaysOverride: null,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] },
      colour: true
    };
  }

  const full = path.resolve(configPath);
  const raw = JSON.parse(fs.readFileSync(full, 'utf8'));

  return {
    cooldownDaysOverride: raw.cooldownDaysOverride ?? null,
    ignoreCooldownPatterns: (raw.ignoreCooldownPatterns ?? []).map(
      (p) => new RegExp(p)
    ),
    updatePackageJson: raw.updatePackageJson ?? false,
    installUpdates: raw.installUpdates ?? false,
    majorRules: raw.majorRules ?? { allow: [], disallow: [] },
    colour: raw.colour ?? true
  };
}

export function getNpmMinimumReleaseAge() {
  try {
    const output = execSync('npm config get minimum-release-age', {
      encoding: 'utf8'
    }).trim();
    return Number(output);
  } catch {
    return 7;
  }
}
