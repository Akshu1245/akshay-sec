// Publish only reviewed public files; exclude tests, CI, git and local research.
import {copyFileSync,cpSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),out=join(root,'dist');
execFileSync(process.execPath,[join(root,'scripts/build-cases.mjs')],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[join(root,'scripts/check-site.mjs')],{cwd:root,stdio:'inherit'});
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
const files=['index.html','workbench.html','case-study.html','404.html','style.css','studio.css','main.js','site-shell.js','motion.js','bg-field.js','engines.mjs','project-data.mjs','workbench.mjs','case-study.mjs','robots.txt','sitemap.xml'];
for(const f of files){
 if(!existsSync(join(root,f)))throw Error('Missing publishable file '+f);
 copyFileSync(join(root,f),join(out,f));
}
for(const d of ['assets','cases'])cpSync(join(root,d),join(out,d),{recursive:true});
console.log('Static site ready in dist/ without development files.');
