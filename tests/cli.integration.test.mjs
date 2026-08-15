import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';

describe('CLI integration with cooldown column', () => {
  let tmp;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(process.cwd(), 'cli-test-'));
    fs.writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({
        name: 'cli-test',
        dependencies: { lodash: '^4.0.0' }
      })
    );
  });

  it('prints cooldown column in full report', () => {
    const output = execFileSync(
      'node',
      [path.resolve('bin/cli.mjs'), '--cooldown-days', '1', '--no-colour'],
      { cwd: tmp, encoding: 'utf8' }
    );

    expect(output).toContain('Cooldown');
    expect(output).toMatch(/Package\s+Installed\s+Available\s+Cooldown\s+Notes/);
  });
});
