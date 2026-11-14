// Generate crawlable case-study HTML from the same verified project data as the browser pages.
// Run: node scripts/build-cases.mjs. No dependencies.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projects,orderedProjects} from '../project-data.mjs';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const dest=join(root,'cases');
mkdirSync(dest,{recursive:true});
const e=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const list=a=>'<ul class="case-list">'+a.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>';
const panel=(tag,title,body)=>'<section class="case-block glass"><p class="sec-tag">'+e(tag)+'</p><h2>'+e(title)+'</h2>'+body+'</section>';
const href=(label,url,css)=>'<a class="'+(css||'btn btn-line')+'" href="'+e(url)+'"'+(/^https?:/.test(url)?' target="_blank" rel="noopener noreferrer"':'')+'>'+e(label)+'</a>';
const base=readFileSync(join(root,'case-study.html'),'utf8');
for(const slug of orderedProjects){
 const p=projects[slug],canonical='https://akshay-sec.vercel.app/cases/'+slug+'.html';
 const picture=p.screenshot.startsWith('https://')?p.screenshot:'https://akshay-sec.vercel.app/'+p.screenshot;
 const actions=[href('View source ↗',p.source,'btn btn-fill'),p.live?href('Open project site ↗',p.live):'',p.lab?href('Try related demo →','workbench.html#'+p.lab):''].filter(Boolean).join('');
 const facts=[['Context',p.category],['Year',p.year],['Status',p.state],['Work',p.role]].map(x=>'<div class="case-meta-item"><span class="case-meta-key">'+e(x[0])+'</span><strong class="case-meta-value">'+e(x[1])+'</strong></div>').join('');
 const steps=p.steps.map((x,i)=>'<div class="case-step"><span class="case-step-index">'+String(i+1).padStart(2,'0')+'</span><h3>'+e(x[0])+'</h3><p>'+e(x[1])+'</p></div>').join('');
 const content=[
 '<article id="caseRoot" class="static-case">',
 '<header class="case-header"><p class="sec-tag">CASE FILE / '+e(p.index)+' · '+e(p.category.toUpperCase())+'</p><h1>'+e(p.title)+'</h1><p class="case-tagline">'+e(p.tagline)+'</p><p class="case-deck">'+e(p.subtitle)+'</p><div class="case-action-row">'+actions+'</div></header>',
 '<div class="case-banner glass"><span class="case-banner-label">PROJECT CONTEXT</span><span class="case-banner-text">'+e(p.state)+' · '+e(p.role)+'</span></div>',
 '<figure class="case-visual glass"><a href="'+e(p.screenshot)+'" target="_blank" rel="noopener noreferrer" class="case-image-link" aria-label="Open full-size screenshot of '+e(p.title)+'"><img class="case-image" src="'+e(p.screenshot)+'" alt="'+e(p.alt)+'" width="1280" height="800" decoding="async"></a><figcaption>'+e(p.screenshotNote)+'</figcaption></figure>',
 '<div class="case-columns"><div class="case-main-column">',
 panel('THE PREMISE','What I wanted to solve','<p class="case-copy">'+e(p.challenge)+'</p>'),
 panel('THE BUILD','How it works','<p class="case-copy">'+e(p.overview)+'</p>'),
 panel('THE WALKTHROUGH','Follow the flow','<div class="case-step-grid">'+steps+'</div>'),
 panel('IN THE REPOSITORY','What you can inspect',list(p.built)),
 panel('BE HONEST ABOUT IT','Limitations and open questions',list(p.constraints)),
 '</div><aside class="case-sidebar" aria-label="Evidence and case details"><div class="case-aside-panel glass"><p class="sec-tag">AT A GLANCE</p>'+facts+'<div class="case-tech">'+p.stack.map(x=>'<span class="tag">'+e(x)+'</span>').join('')+'</div></div>',
 '<div class="case-aside-panel glass"><p class="sec-tag">EVIDENCE TO OPEN</p><h3>Not just screenshots</h3>'+list(p.evidence)+href('Inspect the repository ↗',p.source,'text-link')+'</div></aside></div>',
 '<div class="case-end-note glass"><span class="case-end-symbol">◎</span><p>This case file explains published work, not an independent security certification.</p></div>',
 '</article>'
 ].join('\n');
 const others=orderedProjects.filter(x=>x!==slug).slice(0,3).map(id=>{const v=projects[id];return '<a class="case-next-link glass" href="cases/'+id+'.html"><span class="case-next-index">'+e(v.index)+' / '+e(v.category)+'</span><h3>'+e(v.title)+'</h3><p>'+e(v.tagline)+'</p><span class="case-next-arrow">Read the case file ↗</span></a>'}).join('\n');
 let html=base;
 const start=html.indexOf('  <div id="caseRoot">');
 const end=html.indexOf('  <section class="next-cases"',start);
 if(start<0||end<0)throw Error('case-study.html template structure changed');
 html=html.slice(0,start)+content+'\n'+html.slice(end);
 html=html.replace('<div class="next-case-grid" id="caseNext"></div>','<div class="next-case-grid">'+others+'</div>');
 html=html.replace('<span id="crumbName">Case file</span>','<span>'+e(p.title)+'</span>');
 html=html.replace(/<title>[^<]*<\/title>/,'<title>'+e(p.title)+' — Security Case Study | K S Akshay</title>');
 html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+e((p.subtitle+' '+p.challenge).slice(0,155))+'">');
 html=html.replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+e(p.title)+' | K S Akshay">');
 html=html.replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+e(p.subtitle)+'">');
 html=html.replace('</head>','<meta property="og:url" content="'+canonical+'"><meta property="og:image" content="'+e(picture)+'"><link rel="canonical" href="'+canonical+'"></head>');
 html=html.replace(/<script type="module" src="case-study.mjs"><\/script>/,'');
 // All relative URLs in this template and its generated article live one folder above cases/.
 html=html.replace(/\b(href|src|poster)="(?!https?:|mailto:|tel:|data:|#|\/)([^"]+)"/g,(m,a,u)=>a+'="../'+u+'"');
 writeFileSync(join(dest,slug+'.html'),html);
 console.log('Generated cases/'+slug+'.html ('+html.length+' bytes)');
}
