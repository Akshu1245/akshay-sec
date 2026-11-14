import {inspectUrl,inspectHeaders,inspectPassword,inspectLog,headerFixtures,sampleLog} from './engines.mjs';

const tools=['phishcheck','headercheck','passaudit','logwatch'];
const tabs=[...document.querySelectorAll('[role="tab"][data-tool]')];
const $=id=>document.getElementById(id);

function dom(type, className = '', text = '') {
  const element=document.createElement(type);
  if(className) element.className=className;
  element.textContent=text;
  return element;
}
function add(parent, ...children){parent.append(...children);return parent}
function render(target, headline, subtitle, items, tone='info') {
  const root=$(target);
  root.replaceChildren();
  const summary=dom('div','demo-summary tone-'+tone);
  add(summary,dom('h3','',headline),dom('p','',subtitle));
  add(root,summary);
  if(items.length) {
    const ul=dom('ul','demo-findings');
    for(const {name,reason,meta} of items){
      const li=dom('li','demo-finding');
      const span=dom('span','finding-name',name);
      if(meta) add(span,dom('small','finding-meta',meta));
      add(li,span,dom('p','',reason));
      add(ul,li);
    }
    add(root,ul);
  }
}
function activate(name, focus=false) {
  if(!tools.includes(name))return;
  for(const tab of tabs){
    const selected=tab.dataset.tool===name;
    tab.setAttribute('aria-selected',String(selected));
    tab.classList.toggle('is-selected',selected);
    tab.tabIndex=selected?0:-1;
    $(tab.getAttribute('aria-controls')).hidden=!selected;
    if(selected&&focus)tab.focus();
  }
}
function initialTab() {
  const name=window.location.hash.replace(/^#/,'');
  activate(tools.includes(name)?name:'phishcheck');
}
for(const tab of tabs){
  tab.addEventListener('click',()=>{
    const slug=tab.dataset.tool;
    activate(slug);
    history.replaceState(null,'','#'+slug);
  });
  tab.addEventListener('keydown',event=>{
    if(!['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'].includes(event.key))return;
    event.preventDefault();
    const at=tools.indexOf(tab.dataset.tool);
    const next=event.key==='Home'?0:event.key==='End'?tools.length-1:(at+(event.key==='ArrowDown'||event.key==='ArrowRight'?1:-1)+tools.length)%tools.length;
    const name=tools[next];
    activate(name,true);
    history.replaceState(null,'','#'+name);
  });
}
window.addEventListener('hashchange',initialTab);
initialTab();

$('phishForm').addEventListener('submit',event=>{
  event.preventDefault();
  const value=$('phishInput').value;
  const result=inspectUrl(value);
  if(!result.valid){render('phishResult','Please check the URL',result.error,[],'warn');return}
  render('phishResult',result.severity,
    'Illustrative signal score: '+result.score+'/100 · '+result.description,
    result.signals.length?result.signals.map(s=>({name:s.name,reason:s.reason,meta:'+'+s.points})):[{name:'No illustrated rules triggered',reason:'This is not a safety verdict. Check links independently.'}],
    result.score>=50?'danger':result.score>=20?'warn':'good');
});
document.querySelectorAll('[data-url-sample]').forEach(button=>button.addEventListener('click',()=>{
  $('phishInput').value=button.dataset.urlSample;
  $('phishForm').requestSubmit();
}));

$('headerInput').value=headerFixtures.strong;
$('headerPreset').addEventListener('change',()=>{
  const value=$('headerPreset').value;
  if(value==='custom'){$('headerInput').value='';$('headerInput').focus();}
  else $('headerInput').value=headerFixtures[value];
});
$('headerForm').addEventListener('submit',event=>{
  event.preventDefault();
  const value=$('headerInput').value;
  if(!value.trim()){render('headerResult','No response headers','Paste fictional HTTP headers or choose a sample.',[],'warn');return}
  const result=inspectHeaders(value);
  render('headerResult',result.present+' of '+result.total+' controls present',
    'Demonstration score '+result.score+'/100. '+result.note,
    result.checks.map(x=>({
      name:(x.present?'Present · ':'Missing · ')+x.name,
      reason:x.present?(x.value||x.explanation):x.explanation
    })),
    result.present===result.total?'good':result.present===0?'danger':'warn');
});

$('showPassword').addEventListener('click',()=>{
  const input=$('passInput');
  const show=input.type==='password';
  input.type=show?'text':'password';
  $('showPassword').textContent=show?'Hide':'Show';
  $('showPassword').setAttribute('aria-label',(show?'Hide':'Show')+' fictional password');
  input.focus();
});
document.querySelectorAll('[data-pass-sample]').forEach(button=>button.addEventListener('click',()=>{
  $('passInput').value=button.dataset.passSample;
  $('passForm').requestSubmit();
}));
$('passForm').addEventListener('submit',event=>{
  event.preventDefault();
  const result=inspectPassword($('passInput').value);
  render('passResult','Pattern score '+result.score+' / 4',result.description,
    result.findings.map(reason=>({name:'Observed pattern',reason})),result.score>=3?'good':result.score<=1?'danger':'warn');
});

$('logInput').value=sampleLog;
$('resetLog').addEventListener('click',()=>{$('logInput').value=sampleLog;$('logForm').requestSubmit()});
$('logForm').addEventListener('submit',event=>{
  event.preventDefault();
  const result=inspectLog($('logInput').value);
  const summaries=[
    ...result.warnings.map(w=>({name:w.name,reason:w.reason})),
    ...result.sources.map(s=>({
      name:s.ip+' · '+s.failures+' failed / '+s.successes+' accepted',
      reason:'Accounts in sample: '+s.users.join(', ')
    }))
  ];
  if(!summaries.length)summaries.push({name:'No recognized SSH events',reason:'Use the sample log to see a demonstration.'});
  render('logResult',result.warnings.length+' review flag'+(result.warnings.length===1?'':'s'),
    result.events+' recognized events · '+result.skipped+' skipped lines. '+result.note,
    summaries,result.warnings.length?'warn':'good');
});
