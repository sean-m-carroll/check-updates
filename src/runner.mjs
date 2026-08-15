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

  // 🔑 Use the simple upgrades map: { pkgName: newVersion }
  const upgrades = await ncu.run({
    packageFile: 'package.json'
  });

  const packagesToUpdate = [];
  const majorUpdates = [];

  // Only process actual dependencies/devDependencies
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  for (const name of Object.keys(allDeps)) {
    const targetVersion = upgrades[name];
    if (!targetVersion) continue; // no update for this package

    const currentVersion = allDeps[name];

    const major = isMajorUpdate(currentVersion, targetVersion);
    const majorAllowed = config.majorRules.allow.includes(name);
    const majorBlocked = config.majorRules.disallow.includes(name);

    const eligible =
      !major || (major && majorAllowed && !majorBlocked);

    // For now, use the global cooldown override per package
    const entry = {
      name,
      currentVersion,
      targetVersion,
      major,
      majorAllowed,
      eligible,
      ignoreCooldown: false,
      withinCooldown: false,
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
