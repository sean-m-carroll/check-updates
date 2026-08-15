// import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// import fs from 'fs';
// import path from 'path';
// import { execFileSync } from 'child_process';

// let tmpDir;
// const originalCwd = process.cwd();

// describe('CLI integration with cooldown column', () => {

//   beforeEach(() => {
//     tmpDir = fs.mkdtempSync(path.join(originalCwd, 'cli-int-test-'));
//     process.chdir(tmpDir);

//     fs.writeFileSync(
//       path.join(tmpDir, 'package.json'),
//       JSON.stringify({
//         name: 'test',
//         dependencies: { lodash: "4.0.0" }
//       })
//     );

//     // ⭐ Install dependencies so runner sees lodash
//     execFileSync('npm', ['install'], { cwd: tmpDir });

//     fs.writeFileSync(
//       path.join(tmpDir, 'config.json'),
//       JSON.stringify({
//         majorRules: { allow: ["lodash"], disallow: [] },
//         cooldownDaysOverride: 1,
//         npmMinimumReleaseAge: 0,
//         colour: false
//       })
//     );
//   });

//   afterEach(() => {
//     process.chdir(originalCwd);
//     fs.rmSync(tmpDir, { recursive: true, force: true });
//   });

//   it('prints aligned columns and hides top-level fields', () => {
//     const cliPath = path.resolve(originalCwd, 'bin/cli.mjs');
//     const configPath = path.join(tmpDir, 'config.json');

//     const output = execFileSync(
//       'node',
//       [
//         cliPath,
//         '--config', configPath,
//         '--cooldown-days', '1',
//         '--no-colour'
//       ],
//       { encoding: 'utf8' }
//     );

//     const lines = output.trim().split('\n');
//     const row = lines.find(l => l.startsWith('lodash'));

//     expect(row).toBeDefined();
//     expect(row.includes('1d')).toBe(true);
//     expect(row.includes('Major update')).toBe(false);
//   });

// });
