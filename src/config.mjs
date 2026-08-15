import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';

const DEFAULT_COOLDOWN_DAYS = 7;

export function getNpmMinimumReleaseAge() {
  try {
    const value = execSync('npm config get minimum-release-age', {
      encoding: 'utf8'
    }).trim();

    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : DEFAULT_COOLDOWN_DAYS;
  } catch {
    return DEFAULT_COOLDOWN_DAYS;
  }
}

export function loadConfig(configPath) {
  if (!configPath) {
    return {
      cooldownDaysOverride: null,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: {}
    };
  }

  const resolved = path.resolve(process.cwd(), configPath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const json = JSON.parse(raw);

  return {
    cooldownDaysOverride: json.cooldownDaysOverride ?? null,
    ignoreCooldownPatterns: json.ignoreCooldownPatterns?.map((p) => new RegExp(p)) ?? [],
    updatePackageJson: json.updatePackageJson ?? false,
    installUpdates: json.installUpdates ?? false,
    majorRules: json.majorRules ?? {}
  };
}
