import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';

describe('CLI integration', () => {
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

  it('runs end-to-end', () => {
    const output = execFileSync(
      'node',
      [path.resolve('bin/cli.mjs'), '--cooldown-days', '1', '--no-colour'],
      { cwd: tmp, encoding: 'utf8' }
    );

    expect(output).toContain('Cooldown days: 1');
    expect(output).toContain('Package');
  });
});
