import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import * as runner from '../src/runner.mjs';
import fs from 'fs';
import path from 'path';

vi.mock('npm-check-updates', () => ({
  default: {
    run: vi.fn(async () => ({
      lodash: '^5.0.0',
      vitest: '^5.0.0'
    }))
  }
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => " '2024-01-01T00:00:00.000Z' ")
}));

describe('runner.mjs', () => {
  const pkgPath = path.resolve('package.json');
  const original = fs.existsSync(pkgPath)
    ? fs.readFileSync(pkgPath, 'utf8')
    : null;

  beforeEach(() => {
    fs.writeFileSync(pkgPath, JSON.stringify({
      name: 'test',
      dependencies: { lodash: '^4.0.0' },
      devDependencies: { vitest: '^4.0.0' }
    }, null, 2));
  });

  it('detects dependency types', async () => {
    const result = await runner.runCheck({
      cooldownDaysOverride: 1,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    const lodash = result.packagesToUpdate.find(p => p.name === 'lodash');
    const vitestPkg = result.packagesToUpdate.find(p => p.name === 'vitest');

    expect(lodash.depType).toBe('dependency');
    expect(vitestPkg.depType).toBe('devDependency');
  });

  it('detects major updates', async () => {
    const result = await runner.runCheck({
      cooldownDaysOverride: 1,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    expect(result.majorUpdates.length).toBeGreaterThan(0);
  });

  it('updates package.json when enabled', async () => {
    await runner.runCheck({
      cooldownDaysOverride: 1,
      ignoreCooldownPatterns: [],
      updatePackageJson: true,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    const updated = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    expect(updated.dependencies.lodash).toBe('^5.0.0');
  });

  it('installs updates when enabled', async () => {
    const { execSync } = await import('node:child_process');
    execSync.mockClear();

    await runner.runCheck({
      cooldownDaysOverride: 1,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: true,
      majorRules: { allow: [], disallow: [] }
    });

    expect(execSync).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
  });

  afterAll(() => {
    if (original) fs.writeFileSync(pkgPath, original);
  });
});
