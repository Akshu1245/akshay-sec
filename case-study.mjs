import {projects, orderedProjects} from './project-data.mjs';

const params = new URLSearchParams(window.location.search);
const slug = params.get('project');
const root = document.querySelector('#caseRoot');
const label = document.querySelector('#crumbName');
const next = document.querySelector('#caseNext');

function el(type, className = '', text = null) {
  const node = document.createElement(type);
  if (className) node.className = className;
  if (text !== null) node.textContent = text;
  return node;
}
function add(parent, ...children) { parent.append(...children); return parent; }
function heading(tag, text, className = '') { return el(tag, className, text); }
function externalLink(label, url, style = 'btn btn-line') {
  const a = el('a', style, label);
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}
function internalLink(label, url, style = 'text-link') {
  const a = el('a', style, label);
  a.href = url;
  return a;
}
function boxSection(kicker, title, content) {
  const section = el('section','case-block glass');
  add(section, el('p','sec-tag',kicker), heading('h2', title));
  if (typeof content === 'string') add(section, el('p','case-copy',content));
  else if (content) add(section,content);
  return section;
}
function list(values) {
  const ul = el('ul','case-list');
  for (const value of values) add(ul, el('li','',value));
  return ul;
}
function renderCase(project) {
  document.title = project.title + ' | Case File · K S Akshay';
  label.textContent = project.title;
  root.replaceChildren();

  const header = el('header','case-header');
  add(header, el('p','sec-tag','CASE FILE / '+project.index+' · '+project.category.toUpperCase()));
  add(header, heading('h1',project.title));
  add(header, el('p','case-tagline',project.tagline));
  add(header, el('p','case-deck',project.subtitle));
  const buttons = el('div','case-action-row');
  add(buttons, externalLink('View source ↗',project.source,'btn btn-fill'));
  if(project.live) add(buttons, externalLink('Open project site ↗',project.live,'btn btn-line'));
  if(project.lab) add(buttons, internalLink('Try a related demo →','workbench.html#'+project.lab,'btn btn-line'));
  add(header,buttons);
  add(root,header);

  const banner = el('div','case-banner glass');
  add(banner,el('span','case-banner-label','PROJECT CONTEXT'));
  add(banner,el('span','case-banner-text',project.state+' · '+project.role));
  add(root,banner);

  const visual = el('figure','case-visual glass');
  const a = internalLink('', project.screenshot,'case-image-link');
  a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label','Open full-size screenshot of '+project.title);
  const img = el('img','case-image');
  img.src = project.screenshot;
  img.alt = project.alt;
  img.loading = 'eager';
  img.decoding = 'async';
  add(a,img);
  add(visual,a, el('figcaption','',project.screenshotNote));
  add(root,visual);

  const columns = el('div','case-columns');
  const main = el('div','case-main-column');
  add(main,boxSection('THE PREMISE','What I wanted to solve',project.challenge));
  add(main,boxSection('THE BUILD','How it works',project.overview));
  const steps = el('div','case-step-grid');
  project.steps.forEach(([title,description],i)=>{
    const item = el('div','case-step');
    add(item,el('span','case-step-index',String(i+1).padStart(2,'0')),heading('h3',title),el('p','',description));
    add(steps,item);
  });
  add(main,boxSection('THE WALKTHROUGH','Follow the flow',steps));
  add(main,boxSection('IN THE REPOSITORY','What you can inspect',list(project.built)));
  add(main,boxSection('BE HONEST ABOUT IT','Limitations and open questions',list(project.constraints)));

  const aside = el('aside','case-sidebar');
  const meta = el('div','case-aside-panel glass');
  add(meta,el('p','sec-tag','AT A GLANCE'));
  const pairs=[['Context',project.category],['Year',project.year],['Status',project.state],['Work',project.role]];
  for(const [key,value] of pairs){
    const pair=el('div','case-meta-item');
    add(pair,el('span','case-meta-key',key),el('strong','case-meta-value',value));
    add(meta,pair);
  }
  const chips=el('div','case-tech');
  project.stack.forEach(value=>add(chips,el('span','tag',value)));
  add(meta,chips);
  add(aside,meta);

  const facts=el('div','case-aside-panel glass');
  add(facts,el('p','sec-tag','EVIDENCE TO OPEN'),heading('h3','Not just screenshots'),list(project.evidence));
  add(facts,externalLink('Inspect the repository ↗',project.source,'text-link'));
  add(aside,facts);
  add(columns,main,aside);
  add(root,columns);

  const foot = el('div','case-end-note glass');
  add(foot,el('span','case-end-symbol','◎'),el('p','','This case file is an explanation of published work, not an independent security certification.'));
  add(root,foot);
}

if(projects[slug]) {
  renderCase(projects[slug]);
} else {
  root.replaceChildren();
  const notfound = el('section','case-not-found glass');
  add(notfound,el('p','sec-tag','404 / UNKNOWN CASE'),heading('h1','That case file is not in the archive.'),el('p','','Choose one of the projects below or return to the portfolio.'),internalLink('Back to projects →','index.html#projects','btn btn-fill'));
  add(root,notfound);
  label.textContent = 'Not found';
  document.title = 'Case not found | K S Akshay';
}

for(const id of orderedProjects.filter(id => id!==slug).slice(0,3)){
  const p=projects[id];
  const card=internalLink('', 'case-study.html?project='+id,'case-next-link glass');
  add(card,el('span','case-next-index',p.index+' / '+p.category),heading('h3',p.title),el('p','',p.tagline),el('span','case-next-arrow','Read the case file ↗'));
  add(next,card);
}
