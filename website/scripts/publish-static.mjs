import { cp, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const websiteRoot = fileURLToPath(new URL('../', import.meta.url));
const repositoryRoot = path.resolve(websiteRoot, '..');
const dist = path.join(websiteRoot, 'dist');
// Publish only the built site; keep documentation and project subpaths intact.
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!html.includes('<noscript>') || !html.includes('/assets/portfolio/')) throw new Error('Incomplete portfolio build');
await mkdir(path.join(repositoryRoot, 'assets'), { recursive: true });
await cp(path.join(dist, 'index.html'), path.join(repositoryRoot, 'index.html'));
await cp(path.join(dist, 'assets'), path.join(repositoryRoot, 'assets'), { recursive: true });
console.log('Published static files to the repository root for GitHub Pages.');
