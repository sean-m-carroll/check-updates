import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runCheck } from '../src/runner.mjs';
import fs from 'fs';
import path from 'path';
import ncu from 'npm-check-updates';
import { execSync } from 'node:child_process';

vi.mock('npm-check-updates', () => ({
  default: { run: vi.fn() }
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

let tmpDir;
const originalCwd = process.cwd();

describe('runner.mjs', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'runner-test-'));
    process.chdir(tmpDir);

    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'test',
        dependencies: { lodash: '^4.0.0' },
        devDependencies: { vitest: '^1.0.0' }
      })
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('ignores non-dependency keys returned by ncu', async () => {
    ncu.run.mockResolvedValue({
      name: 'test',
      version: '1.0.0',
      lodash: {
        latest: '^5.0.0',
        time: { modified: '2024-01-01T00:00:00.000Z' }
      }
    });

    const result = await runCheck({
      cooldownDaysOverride: 7,
      colour: false,
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    expect(result.packagesToUpdate.length).toBe(1);
    expect(result.packagesToUpdate[0].name).toBe('lodash');
  });

  it('handles no dependency updates gracefully', async () => {
    ncu.run.mockResolvedValue({
      name: 'test',
      version: '1.0.0'
    });

    const result = await runCheck({
      cooldownDaysOverride: 7,
      colour: false,
      updatePackageJson: false,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    expect(result.packagesToUpdate.length).toBe(0);
    expect(result.majorUpdates.length).toBe(0);
  });
});
