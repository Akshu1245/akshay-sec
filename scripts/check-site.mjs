// Offline portfolio integrity audit. Run: node scripts/check-site.mjs
// Optional HTTP probes: node scripts/check-site.mjs --external
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projects,orderedProjects} from '../project-data.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','case-study.html','workbench.html'];
const failures=[];
const warnings=[];
const relative=new Set();
const external=new Set();
const check=(condition,message)=>{if(!condition)failures.push(message)};
const content=path=>readFileSync(resolve(root,path),'utf8');
const ids=new Map();
for(const page of pages){
  const html=content(page);
  const items=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const idSet=new Set(items);
  check(items.length===idSet.size,page+': duplicate HTML IDs');
  ids.set(page,idSet);
}
const specialFragments=new Set(['phishcheck','headercheck','passaudit','logwatch']);
for(const page of pages){
  const html=content(page);
  const anchors=[...html.matchAll(/<a\b[^>]*>/gi)].map(m=>m[0]);
  for(const anchor of anchors){
    const href=anchor.match(/\bhref="([^"]+)"/);
    check(!!href,page+': anchor without an href');
    if(/\btarget="_blank"/.test(anchor))check(/\brel="[^"]*noopener/.test(anchor),page+': external tab missing noopener');
    if(href)check(href[1]!=='#'&&!/^javascript:/i.test(href[1]),page+': dead or script link '+href[1]);
  }
  for(const match of html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)){
    const url=match[1];
    if(/^(?:https?:|mailto:|tel:|data:)/i.test(url)){if(/^https?:/.test(url))external.add(url);continue;}
    if(url.startsWith('#')){
      check(ids.get(page).has(url.slice(1)),page+': broken local anchor '+url);
      continue;
    }
    const [pathAndQuery,hash]=''+url.includes('#')?url.split('#'):[url,''];
    const path=pathAndQuery.split('?')[0].replace(/^\//,'');
    check(!path.includes('..'),page+': path escapes root '+url);
    if(path) {
      relative.add(path);
      check(existsSync(resolve(root,path)),page+': local asset missing '+path);
    }
    if(hash&&pages.includes(path)) {
      check(ids.get(path).has(hash)||(path==='workbench.html'&&specialFragments.has(hash)),page+': broken cross-page anchor '+url);
    }
    if(path==='case-study.html'&&pathAndQuery.includes('project=')){
      const p=new URLSearchParams(pathAndQuery.split('?')[1]).get('project');
      check(!!projects[p],page+': unknown case project '+p);
    }
  }
  for(const match of html.matchAll(/<img\b[^>]*>/gi)){
    check(/\balt="[^"]*"/.test(match[0]),page+': missing image alternative text');
    check(/\bloading="lazy"/.test(match[0]),page+': missing lazy-load hint');
  }
  check(!/\bTODO\b|\bFIXME\b/.test(html),page+': publishing placeholder');
}
const home=content('index.html');
const detail=content('case-study.html');
const lab=content('workbench.html');
check((home.match(/class="shot-link"/g)||[]).length===6,'Six real screenshot links must remain on the homepage');
check((home.match(/class="project-case-link"/g)||[]).length===5,'Five project case-file links are required');
check(home.includes('no paying customers'),'RaksHex pre-revenue status missing');
check(home.includes('pre-incorporation'),'RaksHex incorporation caveat missing');
check(home.includes('workbench.html#phishcheck'),'Security workbench sample links missing');
check(home.includes('href="mailto:akshaykammar31@gmail.com"'),'Public contact email missing');
check(home.includes('data-email="akshaykammar31@gmail.com"'),'Copy email does not match public email');
check(home.includes('https://pin.it/4MVrrNHI2')&&home.includes('https://pin.it/3iy7frADX'),'Both Pinterest design references must be credited');
check(!home.includes('impossible-travel'),'Logwatch has no impossible-travel detection');
check(!home.includes('nothing is uploaded'),'QRShield optionally submits a URL for Web Risk');
check(detail.includes('case-study.mjs'),'Case page must load detail renderer');
check(lab.includes('workbench.mjs'),'Workbench page must load interaction logic');
check(lab.includes('simplified educational reimplementations'),'Workbench must distinguish demos from Python');
for(const p of Object.values(projects)){
  if(!p.screenshot.startsWith('https://'))check(existsSync(resolve(root,p.screenshot)),'Missing case screenshot '+p.screenshot);
  else external.add(p.screenshot);
  external.add(p.source);
  if(p.live)external.add(p.live);
}
check(orderedProjects.length===5,'Five case studies expected');
for(const name of ['style.css','studio.css','main.js','site-shell.js','bg-field.js','case-study.mjs','workbench.mjs','engines.mjs','project-data.mjs','assets/mark.svg']){
  check(existsSync(resolve(root,name)),'Required design/runtime file missing: '+name);
}
console.log('Portfolio audit: '+pages.length+' pages, '+relative.size+' internal paths, '+external.size+' external URL references.');
if(failures.length)console.error(failures.map(e=>'FAIL '+e).join('\n'));
else console.log('PASS: internal links, project routing, assets, source provenance and publication guards.');

if(process.argv.includes('--external')){
 for(const url of external) {
   try {
     const response=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(10000),headers:{'User-Agent':'AkshaySecPortfolioAudit/1.0'}});
     if(response.status===404||response.status===410)failures.push('Missing external destination '+response.status+' '+url);
     else if(response.status>=400)warnings.push('Unconfirmed external status '+response.status+' '+url);
     else console.log('HTTP '+response.status+' '+url);
   }catch(e){warnings.push('Could not verify '+url+': '+e.message)}
 }
 warnings.forEach(w=>console.warn('WARN '+w));
 console.log('External probes are indicative; browser verification may still be required.');
}
if(failures.length)process.exitCode=1;
