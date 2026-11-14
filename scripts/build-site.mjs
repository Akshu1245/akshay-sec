// Keep developer tests and repository internals out of the published static site.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = resolve(root, 'dist');
const publish = [
  'index.html', 'workbench.html', 'case-study.html', '404.html',
  'style.css', 'studio.css', 'main.js', 'site-shell.js', 'bg-field.js',
  'engines.mjs', 'workbench.mjs', 'case-study.mjs', 'project-data.mjs',
  'robots.txt', 'sitemap.xml',
];
for (const name of publish) {
  if (!existsSync(resolve(root, name))) throw Error('Missing release file: '+name);
}
if (!existsSync(resolve(root, 'assets'))) throw Error('Missing assets directory');
rmSync(dist, {recursive:true,force:true});
mkdirSync(dist, {recursive:true});
for (const name of publish) cpSync(resolve(root,name),resolve(dist,name));
cpSync(resolve(root,'assets'),resolve(dist,'assets'),{recursive:true});
console.log('Built public static site: '+publish.length+' files + assets; tests and dev dependencies excluded.');
