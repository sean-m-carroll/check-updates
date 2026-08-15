import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatReport } from '../src/reporter.mjs';
import fs from 'fs';
import path from 'path';

let tmpDir;
const originalCwd = process.cwd();

describe('reporter coloured table', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'reporter-colour-test-'));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('matches snapshot with only dependency rows', () => {
    const result = {
      cooldownDays: 10,
      colour: false,
      packagesToUpdate: [
        {
          name: 'lodash',
          currentVersion: '^4.0.0',
          targetVersion: '^5.0.0',
          major: true,
          majorAllowed: true,
          eligible: true,
          cooldownDays: 12
        }
      ],
      majorUpdates: []
    };

    expect(formatReport(result)).toMatchSnapshot();
  });
});
