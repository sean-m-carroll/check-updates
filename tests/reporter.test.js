import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatReport } from '../src/reporter.mjs';
import fs from 'fs';
import path from 'path';

let tmpDir;
const originalCwd = process.cwd();

describe('reporter.mjs formatting', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'reporter-test-'));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('prints no dependency rows when none exist', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: false,
      packagesToUpdate: [],
      majorUpdates: []
    });

    expect(out).toContain('No packages eligible for update.');
  });

  it('prints cooldown column for dependency updates', () => {
    const out = formatReport({
      cooldownDays: 5,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^5.0.0',
          major: true,
          majorAllowed: false,
          eligible: false,
          cooldownDays: 12
        }
      ],
      majorUpdates: []
    });

    expect(out).toContain('lodash');
    expect(out).toContain('12d');
  });
});
