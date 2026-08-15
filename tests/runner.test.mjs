import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runCheck } from '../src/runner.mjs';
import fs from 'fs';
import path from 'path';
import ncu from 'npm-check-updates';
import { execSync } from 'node:child_process';

vi.mock('npm-check-updates', () => ({
  default: {
    run: vi.fn()
  }
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
    ncu.run.mockResolvedValueOnce({ lodash: '^5.0.0' });
    ncu.run.mockResolvedValueOnce({ lodash: '^5.0.0' });
    ncu.run.mockResolvedValueOnce({ lodash: '^5.0.0' });

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

  it('applies pattern-based major rules', async () => {
    ncu.run.mockResolvedValueOnce({ lodash: '^5.0.0' });
    ncu.run.mockResolvedValueOnce({ lodash: '^4.17.21' });
    ncu.run.mockResolvedValueOnce({ lodash: '^4.17.21' });

    const result = await runCheck({
      cooldownDaysOverride: 7,
      colour: false,
      updatePackageJson: false,
      installUpdates: false,
      majorRules: {
        allow: ['^lodash'],
        disallow: []
      }
    });

    expect(result.packagesToUpdate[0].majorAllowed).toBe(true);
  });

  it('falls back to minor/patch when major is blocked', async () => {
    ncu.run.mockResolvedValueOnce({ vitest: '^5.0.0' });
    ncu.run.mockResolvedValueOnce({ vitest: '^4.1.10' });
    ncu.run.mockResolvedValueOnce({ vitest: '^4.1.7' });

    const result = await runCheck({
      cooldownDaysOverride: 7,
      colour: false,
      updatePackageJson: false,
      installUpdates: false,
      majorRules: {
        allow: [],
        disallow: ['^vitest']
      }
    });

    expect(result.packagesToUpdate.length).toBe(1);
    expect(result.packagesToUpdate[0].targetVersion).toBe('^4.1.10');
    expect(result.packagesToUpdate[0].major).toBe(false);
    expect(result.packagesToUpdate[0].fallbackUsed).toBe(true);
  });
});
