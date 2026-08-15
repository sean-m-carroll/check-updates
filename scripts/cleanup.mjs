import fs from 'fs';
import path from 'path';

const root = process.cwd();

function removeIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

function cleanup() {
  // Remove temp test dirs
  for (const file of fs.readdirSync(root)) {
    if (file.startsWith('cli-test-')) {
      removeIfExists(path.join(root, file));
    }
  }

  // Remove stray snapshots
  removeIfExists(path.join(root, 'tests/__snapshots__'));

  console.log('Cleanup complete.');
}

cleanup();
