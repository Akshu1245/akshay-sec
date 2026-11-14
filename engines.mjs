// Small, deterministic BROWSER DEMOS. Not ports or executions of the linked Python tools.
// No remote calls, credential submission or authority to scan third-party systems.

export const headerFixtures = {
  strong: [
    'HTTP/2 200',
    'strict-transport-security: max-age=63072000; includeSubDomains',
    "content-security-policy: default-src 'self'; object-src 'none'",
    'x-content-type-options: nosniff',
    'referrer-policy: strict-origin-when-cross-origin',
    'permissions-policy: camera=(), microphone=()',
    'x-frame-options: DENY'
  ].join('\n'),
  weak: ['HTTP/1.1 200 OK','server: demo-server','content-type: text/html'].join('\n')
};

export const sampleLog = [
  'Nov 14 12:00:01 server sshd[100]: Failed password for invalid user admin from 203.0.113.44 port 2201 ssh2',
  'Nov 14 12:00:09 server sshd[101]: Failed password for root from 203.0.113.44 port 2202 ssh2',
  'Nov 14 12:00:13 server sshd[102]: Failed password for invalid user test from 203.0.113.44 port 2203 ssh2',
  'Nov 14 12:00:19 server sshd[103]: Failed password for deploy from 203.0.113.44 port 2204 ssh2',
  'Nov 14 12:00:28 server sshd[104]: Failed password for admin from 203.0.113.44 port 2205 ssh2',
  'Nov 14 12:00:39 server sshd[105]: Failed password for ubuntu from 203.0.113.44 port 2206 ssh2',
  'Nov 14 12:01:01 server sshd[106]: Accepted password for deploy from 203.0.113.44 port 2207 ssh2',
  'Nov 14 12:01:15 server sshd[107]: Accepted password for reporter from 198.51.100.7 port 2208 ssh2'
].join('\n');

export function inspectUrl(raw) {
  const signals = [];
  let url;
  try { url = new URL(String(raw).trim()); } catch { return { valid:false, error:'Enter a complete URL, including http:// or https://.' }; }
  if (!['http:', 'https:'].includes(url.protocol)) return {valid:false,error:'Only HTTP and HTTPS URLs are supported in this demo.'};
  if (String(raw).length > 2048) return {valid:false,error:'This demonstration supports URLs up to 2,048 characters.'};
  const host = url.hostname.toLowerCase();
  const add = (name, reason, points) => signals.push({name,reason,points});
  if(url.protocol !== 'https:') add('Plain HTTP','The address does not use HTTPS. This does not itself prove maliciousness.',15);
  if(url.username || url.password || String(raw).includes('@')) add('At sign in URL','An at sign can conceal the intended host in some URLs.',25);
  if(/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host.startsWith('[')) add('IP address as host','An IP host is harder to recognize than a familiar domain name.',20);
  if(host.includes('xn--')) add('Punycode hostname','Internationalized hostnames may visually resemble another name.',25);
  if(/(?:^|\.)[a-z0-9-]*?(?:paypa1|go0gle|micros0ft|arnazon|app1e)[a-z0-9-]*(?:\.|$)/i.test(host)) add('Lookalike brand spelling','This sample appears to imitate a recognizable name.',35);
  if(/\b(?:login|verify|urgent|secure|account|password)\b/i.test(decodeURIComponentSafe(url.pathname+' '+url.search+' '+host).replace(/[-_]/g,' '))) add('Account-related wording','Words such as login and verify appear in the address.',10);
  if(/\.(?:zip|tk|top|click|xyz)$/i.test(host)) add('TLD worth checking','The suffix is one commonly encountered in some suspicious links, but also used legitimately.',10);
  if(host.split('.').length>4) add('Deep subdomains','A long hostname hierarchy makes the real base domain easy to miss.',10);
  const total = Math.min(100,signals.reduce((sum,s)=>sum+s.points,0));
  return {
    valid:true,
    host,
    score:total,
    severity:total>=50?'High concern':total>=20?'Review carefully':'No demo warnings',
    description:total===0?'No rule in this small demo triggered. That is not a safety verdict.':'These are indicators to review, not proof of phishing.',
    signals
  };
}
function decodeURIComponentSafe(text) { try {return decodeURIComponent(text)} catch {return text} }

export function inspectHeaders(input) {
  const values = new Map();
  for(const line of String(input).split(/\r?\n/).slice(0,100)){
    const colon=line.indexOf(':');
    if(colon<=0)continue;
    const key=line.slice(0,colon).trim().toLowerCase();
    if(!/^[a-z0-9-]+$/.test(key)) continue;
    values.set(key,line.slice(colon+1).trim());
  }
  const rules = [
    ['Content-Security-Policy','content-security-policy','Restricts the sources that can load content.'],
    ['Strict-Transport-Security','strict-transport-security','Asks browsers to prefer HTTPS for this host.'],
    ['X-Content-Type-Options','x-content-type-options','Helps prevent content-type sniffing.'],
    ['Referrer-Policy','referrer-policy','Controls referrer information passed to other sites.'],
    ['Permissions-Policy','permissions-policy','Limits use of selected browser capabilities.'],
    ['X-Frame-Options','x-frame-options','Offers a legacy clickjacking control. CSP frame-ancestors is another approach.']
  ];
  const checks=rules.map(([name,key,explanation])=>({name,present:values.has(key),explanation,value:values.get(key)||''}));
  const present=checks.filter(c=>c.present).length;
  return {total:checks.length,present,score:Math.round(100*present/checks.length),checks,parsed:values.size,note:'Presence alone does not prove that a security header is configured correctly. TLS and server behavior were not tested.'};
}

export function inspectPassword(value) {
  const str = String(value);
  if(!str) return {score:0,description:'Enter a fictional password to see the pattern analysis.',findings:[]};
  const findings=[];
  let score=0;
  if(str.length>=8)score++;
  else findings.push('Shorter than eight characters.');
  if(str.length>=14)score++;
  else findings.push('Longer, unique passphrases are generally preferable.');
  const variety=[/[a-z]/.test(str),/[A-Z]/.test(str),/\d/.test(str),/[^\w]/.test(str)].filter(Boolean).length;
  if(variety>=3)score++;
  else findings.push('Limited character variety in this simplified example.');
  const predictable=/(password|admin|qwerty|12345|letmein|welcome)/i.test(str)||/(.)\1{3,}/.test(str)||/(?:abcd|1234|qwer|asdf)/i.test(str);
  if(predictable){score=Math.max(0,score-2);findings.push('Predictable word, keyboard walk, repeated characters or sequence.');}
  if(/(?:19|20)\d{2}/.test(str)) findings.push('A year-like sequence is present.');
  if(!predictable&&str.length>=16&&variety>=3)score=4;
  else if(!predictable&&str.length>=10&&variety>=3)score=Math.min(4,score+1);
  if(!findings.length)findings.push('No obvious pattern flagged by these very limited rules.');
  const labels=['Very weak-looking','Weak-looking','Some variation','Stronger-looking','Stronger-looking'];
  return {score:Math.min(4,score),description:labels[Math.min(4,score)]+' in this example. This is not a crack-time estimate or a security guarantee.',findings};
}

export function inspectLog(input) {
  const events=[];
  let skipped=0;
  const rows=String(input).split(/\r?\n/).slice(0,500);
  for(const line of rows){
    if(!line.trim()) continue;
    const m=line.match(/\b(Failed|Accepted) password for (?:invalid user )?(\S+) from (\d{1,3}(?:\.\d{1,3}){3})\b/i);
    if(!m){skipped++;continue}
    events.push({kind:m[1].toLowerCase(),user:m[2],ip:m[3]});
  }
  const grouped=new Map();
  const warnings=[];
  for(const event of events){
    let entry=grouped.get(event.ip);
    if(!entry){entry={ip:event.ip,failures:0,successes:0,users:new Set(),successAfterFailures:false}; grouped.set(event.ip,entry)}
    entry.users.add(event.user);
    if(event.kind==='failed')entry.failures++;
    else {
      entry.successes++;
      if(entry.failures>=5)entry.successAfterFailures=true;
    }
  }
  for(const item of grouped.values()){
    if(item.failures>=5) warnings.push({name:'Repeated failures',reason:item.ip+' has '+item.failures+' failed attempts within the supplied sample.'});
    if(item.successAfterFailures) warnings.push({name:'Success following failures',reason:'A later accepted login is shown from '+item.ip+' after five or more failures.'});
  }
  return {
    events:events.length,
    skipped,
    sources:[...grouped.values()].map(x=>({ip:x.ip,failures:x.failures,successes:x.successes,users:[...x.users]})),
    warnings,
    note:'This exercise counts events in the supplied text. It does not calculate time-window bursts or establish whether a login was unauthorized.'
  };
}
