import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';
import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';

let tmpDir;
const originalCwd = process.cwd();

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

describe('config.mjs', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'config-test-'));
    process.chdir(tmpDir);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads defaults when no config file is provided', () => {
    const cfg = loadConfig(null);
    expect(cfg.updatePackageJson).toBe(false);
    expect(cfg.installUpdates).toBe(false);
    expect(cfg.ignoreCooldownPatterns).toEqual([]);
    expect(cfg.majorRules.allow).toEqual([]);
    expect(cfg.majorRules.disallow).toEqual([]);
    expect(cfg.colour).toBe(true);
  });

  it('loads config file and converts regex patterns', () => {
    const configPath = path.join(tmpDir, 'ncu-config.json');
    fs.writeFileSync(configPath, JSON.stringify({
      cooldownDaysOverride: 10,
      ignoreCooldownPatterns: ['^eslint'],
      updatePackageJson: true,
      installUpdates: true,
      majorRules: { allow: ['react'], disallow: ['lodash'] },
      colour: false
    }));

    const cfg = loadConfig(configPath);

    expect(cfg.cooldownDaysOverride).toBe(10);
    expect(cfg.ignoreCooldownPatterns[0].test('eslint')).toBe(true);
    expect(cfg.majorRules.allow).toContain('react');
    expect(cfg.colour).toBe(false);
  });

  it('reads npm minimum-release-age', () => {
    execSync.mockReturnValue('12');
    expect(getNpmMinimumReleaseAge()).toBe(12);
  });

  it('falls back when npm config fails', () => {
    execSync.mockImplementation(() => { throw new Error('fail'); });
    expect(getNpmMinimumReleaseAge()).toBe(7);
  });
});
