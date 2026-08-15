import fs from 'fs';
import path from 'path';

export function cleanupDir(dir) {
  if (!fs.existsSync(dir)) return;

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.lstatSync(full).isDirectory()) {
      cleanupDir(full);
    } else {
      fs.unlinkSync(full);
    }
  }

  fs.rmdirSync(dir);
}
