import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';

let tmpDir;
const originalCwd = process.cwd();

describe('CLI integration with cooldown column', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(originalCwd, 'cli-integration-test-'));
    process.chdir(tmpDir);

    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'cli-test',
        dependencies: { lodash: '^4.0.0' }
      })
    );
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('prints aligned columns and hides top-level fields', () => {
    const output = execFileSync(
      'node',
      [path.resolve(originalCwd, 'bin/cli.mjs'), '--cooldown-days', '1', '--no-colour'],
      { cwd: tmpDir, encoding: 'utf8' }
    );

    expect(output).not.toMatch(/name\s*:/);
    expect(output).not.toMatch(/version\s*:/);
    expect(output).not.toMatch(/scripts\s*:/);

    expect(output).toContain('Package');
    expect(output).toContain('Installed');
    expect(output).toContain('Updated');
    expect(output).toContain('Cooldown');
    expect(output).toContain('Notes');
  });
});
