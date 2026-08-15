import fs from 'fs';
import path from 'path';
import ncu from 'npm-check-updates';
import { execSync } from 'node:child_process';

function readPackageJson() {
  const pkgPath = path.resolve('package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function isMajorUpdate(current, target) {
  if (!current || !target) return false;
  const [cMaj] = current.replace(/^[^\d]*/, '').split('.').map(Number);
  const [tMaj] = target.replace(/^[^\d]*/, '').split('.').map(Number);
  return tMaj > cMaj;
}

export async function runCheck(config) {
  const pkg = readPackageJson();

  // 1️⃣ Cooldown-safe latest versions
  const latestSafe = await ncu.run({
    packageFile: 'package.json',
    minReleaseAge: config.cooldownDaysOverride
  });

  // 2️⃣ Cooldown-safe minor versions
  const minorSafe = await ncu.run({
    packageFile: 'package.json',
    minReleaseAge: config.cooldownDaysOverride,
    target: 'minor'
  });

  // 3️⃣ Cooldown-safe patch versions
  const patchSafe = await ncu.run({
    packageFile: 'package.json',
    minReleaseAge: config.cooldownDaysOverride,
    target: 'patch'
  });

  const packagesToUpdate = [];
  const majorUpdates = [];

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  for (const name of Object.keys(allDeps)) {
    const currentVersion = allDeps[name];

    // Pattern-based major rules
    const allowPatterns = config.majorRules.allow.map(p => new RegExp(p));
    const disallowPatterns = config.majorRules.disallow.map(p => new RegExp(p));

    const matchesAllow = allowPatterns.some(r => r.test(name));
    const matchesDisallow = disallowPatterns.some(r => r.test(name));

    let majorAllowed;
    if (matchesAllow && matchesDisallow) majorAllowed = false;
    else if (matchesAllow) majorAllowed = true;
    else if (matchesDisallow) majorAllowed = false;
    else majorAllowed = false;

    // Start with cooldown-safe latest
    let targetVersion = latestSafe[name];
    if (!targetVersion) continue;

    const isMajorLatest = isMajorUpdate(currentVersion, targetVersion);

    let fallbackUsed = false;

    // If latest is major and not allowed → fallback
    if (isMajorLatest && !majorAllowed) {
      targetVersion = minorSafe[name] || patchSafe[name];
      if (!targetVersion) continue;
      fallbackUsed = true;
    }

    // Compute major flag (Option B: fallback → major = false)
    let major = isMajorUpdate(currentVersion, targetVersion);
    if (major && fallbackUsed) {
      major = false;
    }

    const entry = {
      name,
      currentVersion,
      targetVersion,
      major,
      majorAllowed,
      fallbackUsed,
      eligible: !major || majorAllowed,
      withinCooldown: false, // already enforced by minReleaseAge
      cooldownDays: config.cooldownDaysOverride,
      depType: pkg.dependencies?.[name] ? 'dependency' : 'devDependency'
    };

    packagesToUpdate.push(entry);
    if (major) majorUpdates.push(entry);
  }

  if (config.updatePackageJson) {
    const pkgPath = path.resolve('package.json');
    const updated = { ...pkg };

    for (const p of packagesToUpdate) {
      if (!p.eligible) continue;
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
