import fs from 'fs';
import path from 'path';

export function loadConfig(configPath) {
  const full = path.resolve(configPath);
  const raw = JSON.parse(fs.readFileSync(full, 'utf8'));

  // -------------------------------
  // Ensure majorRules exists
  // -------------------------------
  if (!raw.majorRules || typeof raw.majorRules !== 'object') {
    raw.majorRules = {};
  }

  // -------------------------------
  // Ensure allow/disallow arrays exist
  // -------------------------------
  if (!Array.isArray(raw.majorRules.allow)) {
    raw.majorRules.allow = [];
  }

  if (!Array.isArray(raw.majorRules.disallow)) {
    raw.majorRules.disallow = [];
  }

  // -------------------------------
  // Default cooldownDaysOverride
  // -------------------------------
  if (typeof raw.cooldownDaysOverride !== 'number') {
    raw.cooldownDaysOverride = 7;
  }

  // -------------------------------
  // Default npmMinimumReleaseAge
  // -------------------------------
  if (typeof raw.npmMinimumReleaseAge !== 'number') {
    raw.npmMinimumReleaseAge = 7;
  }

  return raw;
}

export function getNpmMinimumReleaseAge(cfg) {
  return cfg.npmMinimumReleaseAge;
}
