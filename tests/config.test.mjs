import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';

let tmpDir;
const originalCwd = process.cwd();

describe('config.mjs', () => {

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'config-test-'));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // -------------------------------------------------------------
  // DEFAULTING: majorRules.allow / majorRules.disallow
  // -------------------------------------------------------------

  it('defaults missing majorRules fields', () => {
    const file = path.join(tmpDir, 'config.json');

    fs.writeFileSync(file, JSON.stringify({
      majorRules: {} // missing allow/disallow
    }));

    const cfg = loadConfig(file);

    expect(cfg.majorRules.allow).toEqual([]);
    expect(cfg.majorRules.disallow).toEqual([]);
  });

  // -------------------------------------------------------------
  // DEFAULTING: majorRules entirely missing
  // -------------------------------------------------------------

  it('defaults majorRules when missing entirely', () => {
    const file = path.join(tmpDir, 'config.json');

    fs.writeFileSync(file, JSON.stringify({
      // no majorRules at all
    }));

    const cfg = loadConfig(file);

    expect(cfg.majorRules.allow).toEqual([]);
    expect(cfg.majorRules.disallow).toEqual([]);
  });

  // -------------------------------------------------------------
  // DEFAULTING: cooldownDaysOverride
  // -------------------------------------------------------------

  it('defaults cooldownDaysOverride when missing', () => {
    const file = path.join(tmpDir, 'config.json');

    fs.writeFileSync(file, JSON.stringify({
      majorRules: { allow: [], disallow: [] }
      // cooldownDaysOverride missing
    }));

    const cfg = loadConfig(file);

    expect(cfg.cooldownDaysOverride).toBeDefined();
    expect(typeof cfg.cooldownDaysOverride).toBe('number');
  });

  // -------------------------------------------------------------
  // getNpmMinimumReleaseAge fallback
  // -------------------------------------------------------------

  it('returns default npm minimum release age when missing', () => {
    const file = path.join(tmpDir, 'config.json');

    fs.writeFileSync(file, JSON.stringify({
      majorRules: { allow: [], disallow: [] }
      // no npmMinimumReleaseAge
    }));

    const cfg = loadConfig(file);
    const age = getNpmMinimumReleaseAge(cfg);

    expect(typeof age).toBe('number');
    expect(age).toBeGreaterThan(0);
  });

});
