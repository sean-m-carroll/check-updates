import { execSync } from 'node:child_process';
import { describe, it, expect, vi } from 'vitest';
import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';
import fs from 'fs';
import path from 'path';

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

describe('config.mjs', () => {
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
    const tmp = path.resolve('tmp-config.json');
    fs.writeFileSync(tmp, JSON.stringify({
      cooldownDaysOverride: 10,
      ignoreCooldownPatterns: ['^eslint'],
      updatePackageJson: true,
      installUpdates: true,
      majorRules: { allow: ['react'], disallow: ['lodash'] },
      colour: false
    }));

    const cfg = loadConfig(tmp);

    expect(cfg.cooldownDaysOverride).toBe(10);
    expect(cfg.ignoreCooldownPatterns[0].test('eslint')).toBe(true);
    expect(cfg.majorRules.allow).toContain('react');
    expect(cfg.colour).toBe(false);

    fs.unlinkSync(tmp);
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
