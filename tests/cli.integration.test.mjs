import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

let tmp;

describe('CLI integration', () => {
  it('runs end-to-end', () => {
    tmp = fs.mkdtempSync(path.join(process.cwd(), 'cli-test-'));
    fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({
      name: 'cli-test',
      dependencies: { lodash: '^4.0.0' },
      devDependencies: {}
    }, null, 2));

    const output = execFileSync(
      'node',
      [path.resolve('bin/cli.mjs'), '--cooldown-days', '1'],
      { cwd: tmp, encoding: 'utf8' }
    );

    expect(output).toContain('Cooldown days: 1');
  });
});
