import fs from 'fs';
import path from 'path';
import ncu from 'npm-check-updates';
import { execSync } from 'node:child_process';

function readPackageJson() {
  const pkgPath = path.resolve('package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function isMajorUpdate(current, target) {
  if (!current || !target) return false; // prevent crash

  const [cMaj] = current.replace(/^[^\d]*/, '').split('.').map(Number);
  const [tMaj] = target.replace(/^[^\d]*/, '').split('.').map(Number);
  return tMaj > cMaj;
}

export async function runCheck(config) {
  const pkg = readPackageJson();

  const upgrades = await ncu.run({
    packageFile: 'package.json',
    jsonUpgraded: true,
    jsonAll: true
  });

  const packagesToUpdate = [];
  const majorUpdates = [];

  for (const [name, meta] of Object.entries(upgrades)) {
    // Support both shapes:
    // Shape A: meta.latest
    // Shape B: meta is the version string
    const targetVersion =
      typeof meta === 'string'
        ? meta
        : meta.latest;

    const currentVersion =
      pkg.dependencies?.[name] || pkg.devDependencies?.[name];

    const major = isMajorUpdate(currentVersion, targetVersion);
    const majorAllowed = config.majorRules.allow.includes(name);
    const majorBlocked = config.majorRules.disallow.includes(name);

    const eligible =
      !major || (major && majorAllowed && !majorBlocked);

    // Cooldown calculation (safe)
    let cooldownDays = null;
    if (meta && typeof meta === 'object' && meta.time) {
      const publishedDate = meta.time.modified || meta.time.created;
      if (publishedDate) {
        const publishedMs = new Date(publishedDate).getTime();
        cooldownDays = Math.floor((Date.now() - publishedMs) / 86400000);
      }
    }

    const entry = {
      name,
      currentVersion,
      targetVersion,
      major,
      majorAllowed,
      eligible,
      ignoreCooldown: false,
      withinCooldown: false,
      cooldownDays,
      depType: pkg.dependencies?.[name] ? 'dependency' : 'devDependency'
    };

    packagesToUpdate.push(entry);
    if (major) majorUpdates.push(entry);
  }

  if (config.updatePackageJson) {
    const pkgPath = path.resolve('package.json');
    const updated = { ...pkg };

    for (const p of packagesToUpdate) {
      if (p.depType === 'dependency') {
        updated.dependencies[p.name] = p.targetVersion;
      } else {
        updated.devDependencies[p.name] = p.targetVersion;
      }
    }

    fs.writeFileSync(pkgPath, JSON.stringify(updated, null, 2));
  }

  if (config.installUpdates) {
    execSync('npm install', { stdio: 'inherit' });
  }

  return {
    cooldownDays: config.cooldownDaysOverride,
    colour: config.colour,
    packagesToUpdate,
    majorUpdates
  };
}
