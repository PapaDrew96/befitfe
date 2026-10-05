import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync
} from 'node:fs';

import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');

const entries = [
  'index.html',
  'manifest.webmanifest',
  'assets'
];

rmSync(dist, {
  recursive: true,
  force: true
});

mkdirSync(dist, {
  recursive: true
});

for (const entry of entries) {
  const source = resolve(root, entry);
  const destination = resolve(dist, entry);

  if (!existsSync(source)) {
    throw new Error(`Missing required frontend entry: ${entry}`);
  }

  cpSync(source, destination, {
    recursive: true
  });
}

console.log('Native frontend bundle created in dist/');
