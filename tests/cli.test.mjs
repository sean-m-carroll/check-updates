import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as cli from '../src/cli.mjs';
import { loadConfig, getNpmMinimumReleaseAge } from '../src/config.mjs';
import { runCheck } from '../src/runner.mjs';
import { printReport } from '../src/reporter.mjs';
import fs from 'fs';
import path from 'path';

let tmpDir;
const originalCwd = process.cwd();

vi.mock('../src/config.mjs', () => ({
  loadConfig: vi.fn(),
  getNpmMinimumReleaseAge: vi.fn()
}));

vi.mock('../src/runner.mjs', () => ({
  runCheck: vi.fn()
}));

vi.mock('../src/reporter.mjs', () => ({
  printReport: vi.fn()
}));

describe('CLI unit tests', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'cli-unit-test-'));
    process.chdir(tmpDir);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('merges config and CLI flags', async () => {
    loadConfig.mockReturnValue({
      cooldownDaysOverride: null,
      ignoreCooldownPatterns: [],
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] },
      colour: true
    });

    getNpmMinimumReleaseAge.mockReturnValue(7);
    runCheck.mockResolvedValue({ result: true });

    await cli.main([
      '--config', 'myconfig.json',
      '--cooldown-days', '3',
      '--update-package-json',
      '--ignore-pattern', '^eslint',
      '--allow-major', 'react',
      '--no-colour'
    ]);

    expect(loadConfig).toHaveBeenCalledWith('myconfig.json');
    expect(runCheck).toHaveBeenCalled();
    expect(printReport).toHaveBeenCalled();
  });
});
