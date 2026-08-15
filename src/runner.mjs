import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';
import ncu from 'npm-check-updates';

function readPackageJson() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const raw = fs.readFileSync(pkgPath, 'utf8');
  return { pkgPath, pkg: JSON.parse(raw) };
}

function isDevDependency(pkg, name) {
  return Boolean(pkg.devDependencies && pkg.devDependencies[name]);
}

function isDependency(pkg, name) {
  return Boolean(pkg.dependencies && pkg.dependencies[name]);
}

function getReleaseDateForPackage(name, version) {
  try {
    const output = execSync(`npm view ${name}@${version} time`, {
      encoding: 'utf8'
    });
    const lines = output.split('\n').filter(Boolean);
    const last = lines[lines.length - 1];
    const match = last.match(/'(.+)'/);
    if (!match) return null;
    return new Date(match[1]);
  } catch {
    return null;
  }
}

function isWithinCooldown(releaseDate, cooldownDays) {
  if (!releaseDate) return false;
  const now = new Date();
  const diffMs = now - releaseDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < cooldownDays;
}

function shouldIgnoreCooldown(name, patterns) {
  return patterns.some((re) => re.test(name));
}

function isMajorUpdate(current, target) {
  const [cMajor] = current.replace(/^[^\d]*/, '').split('.');
  const [tMajor] = target.replace(/^[^\d]*/, '').split('.');
  const c = Number(cMajor);
  const t = Number(tMajor);
  if (!Number.isFinite(c) || !Number.isFinite(t)) return false;
  return t > c;
}

function isMajorAllowed(name, majorRules) {
  const { allow = [], disallow = [] } = majorRules;
  if (disallow.includes(name)) return false;
  if (allow.includes(name)) return true;
  return true;
}

export async function runCheck(config) {
  const { pkgPath, pkg } = readPackageJson();

  const upgrades = await ncu.run({
    packageFile: pkgPath,
    jsonUpgraded: true,
    silent: true
  });

  const cooldownDays = config.cooldownDaysOverride;
  const ignorePatterns = config.ignoreCooldownPatterns;

  const toUpdate = [];
  const majorUpdates = [];

  for (const [name, targetVersion] of Object.entries(upgrades)) {
    const currentVersion =
      pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? null;

    const releaseDate = getReleaseDateForPackage(name, targetVersion);
    const withinCooldown = isWithinCooldown(releaseDate, cooldownDays);
    const ignoreCooldown = shouldIgnoreCooldown(name, ignorePatterns);

    const depType = isDevDependency(pkg, name)
      ? 'devDependency'
      : isDependency(pkg, name)
      ? 'dependency'
      : 'unknown';

    const major = currentVersion
      ? isMajorUpdate(currentVersion, targetVersion)
      : false;

    const majorAllowed = major ? isMajorAllowed(name, config.majorRules) : true;

    const eligible =
      (!withinCooldown || ignoreCooldown) &&
      majorAllowed;

    const entry = {
      name,
      currentVersion,
      targetVersion,
      depType,
      withinCooldown,
      ignoreCooldown,
      major,
      majorAllowed,
      eligible
    };

    if (major) {
      majorUpdates.push(entry);
    }

    if (eligible) {
      toUpdate.push(entry);
    }
  }

  if (config.updatePackageJson && toUpdate.length > 0) {
    const updatedPkg = { ...pkg };
    for (const item of toUpdate) {
      if (item.depType === 'dependency') {
        updatedPkg.dependencies[item.name] = item.targetVersion;
      } else if (item.depType === 'devDependency') {
        updatedPkg.devDependencies[item.name] = item.targetVersion;
      }
    }
    fs.writeFileSync(pkgPath, JSON.stringify(updatedPkg, null, 2) + '\n', 'utf8');
  }

  if (config.installUpdates && toUpdate.length > 0) {
    execSync('npm install', { stdio: 'inherit' });
  }

  return {
    cooldownDays,
    packagesToUpdate: toUpdate,
    majorUpdates
  };
}
