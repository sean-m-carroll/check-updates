import fs from 'fs';
import path from 'path';
import ncu from 'npm-check-updates';
import { execSync } from 'node:child_process';

function readPackageJson() {
  const pkgPath = path.resolve('package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function isMajorUpdate(current, target) {
  const [cMaj] = current.replace(/^[^\d]*/, '').split('.').map(Number);
  const [tMaj] = target.replace(/^[^\d]*/, '').split('.').map(Number);
  return tMaj > cMaj;
}

export async function runCheck(config) {
  const pkg = readPackageJson();

  const upgrades = await ncu.run({
    packageFile: 'package.json',
    jsonUpgraded: true
  });

  const packagesToUpdate = [];
  const majorUpdates = [];

  for (const [name, targetVersion] of Object.entries(upgrades)) {
    const currentVersion =
      pkg.dependencies?.[name] || pkg.devDependencies?.[name];

    const major = isMajorUpdate(currentVersion, targetVersion);
    const majorAllowed = config.majorRules.allow.includes(name);
    const majorBlocked = config.majorRules.disallow.includes(name);

    const eligible =
      !major || (major && majorAllowed && !majorBlocked);

    const entry = {
      name,
      currentVersion,
      targetVersion,
      major,
      majorAllowed,
      eligible,
      ignoreCooldown: false,
      withinCooldown: false,
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
