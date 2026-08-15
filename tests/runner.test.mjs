import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runCheck } from '../src/runner.mjs';
import fs from 'fs';
import path from 'path';
import ncu from 'npm-check-updates';
import { execSync } from 'node:child_process';

// Mock npm-check-updates
vi.mock('npm-check-updates', () => ({
  default: {
    run: vi.fn()
  }
}));

// Mock child_process
vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

let tmpDir;
const originalCwd = process.cwd();

describe('runner.mjs', () => {
  beforeEach(() => {
    // Create isolated temp directory
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'runner-test-'));

    // Switch cwd into temp directory
    process.chdir(tmpDir);

    // Write isolated package.json
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'test',
        dependencies: { lodash: '^4.0.0' }
      })
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Cleanup temp directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects updates and classifies major/minor/patch', async () => {
    ncu.run.mockResolvedValue({
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
    expect(result.majorUpdates.length).toBe(1);
    expect(typeof result.packagesToUpdate[0].cooldownDays).toBe('number');
  });

  it('updates package.json when enabled', async () => {
    ncu.run.mockResolvedValue({
      lodash: {
        latest: '^5.0.0',
        time: { modified: '2024-01-01T00:00:00.000Z' }
      }
    });

    await runCheck({
      cooldownDaysOverride: 7,
      colour: false,
      updatePackageJson: true,
      installUpdates: false,
      majorRules: { allow: [], disallow: [] }
    });

    const updated = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8')
    );

    expect(updated.dependencies.lodash).toBe('^5.0.0');
  });

  it('runs npm install when installUpdates is true', async () => {
    ncu.run.mockResolvedValue({
      lodash: {
        latest: '^5.0.0',
        time: { modified: '2024-01-01T00:00:00.000Z' }
      }
    });

    await runCheck({
      cooldownDaysOverride: 7,
      colour: false,
      updatePackageJson: false,
      installUpdates: true,
      majorRules: { allow: [], disallow: [] }
    });

    expect(execSync).toHaveBeenCalledWith('npm install', { stdio: 'inherit' });
  });
});
