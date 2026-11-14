import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectUrl, inspectHeaders, inspectPassword, inspectLog, headerFixtures, sampleLog} from '../engines.mjs';
import {projects, orderedProjects} from '../project-data.mjs';

test('URL demo detects lookalike and HTTP on a fictional domain',()=>{
  const x=inspectUrl('http://paypa1-login.example/verify');
  assert.equal(x.valid,true);
  assert.ok(x.score>=50);
  assert.ok(x.signals.some(s=>s.name==='Lookalike brand spelling'));
  assert.ok(x.signals.some(s=>s.name==='Plain HTTP'));
});
test('URL demo never claims a basic HTTPS URL is safe',()=>{
  const x=inspectUrl('https://example.com');
  assert.equal(x.valid,true);
  assert.equal(x.score,0);
  assert.match(x.description,/not a safety verdict/i);
});
test('URL demo refuses non-web protocols and invalid input',()=>{
  assert.equal(inspectUrl('javascript:alert(1)').valid,false);
  assert.equal(inspectUrl('not a URL').valid,false);
  assert.equal(inspectUrl('http://192.0.2.25/login').signals.some(x=>x.name==='IP address as host'),true);
});
test('Header demo compares fixtures with correct upper and lower bounds',()=>{
  const good=inspectHeaders(headerFixtures.strong);
  const weak=inspectHeaders(headerFixtures.weak);
  assert.equal(good.score,100);
  assert.equal(weak.score,0);
  assert.equal(good.checks.length,6);
});
test('Header fixture accepts case-insensitive keys and does not treat status line as header',()=>{
  const r=inspectHeaders('HTTP/2 200\nCONTENT-SECURITY-POLICY: default-src self\nreferrer-policy: no-referrer');
  assert.equal(r.present,2);
  assert.equal(r.parsed,2);
});
test('Password demo penalizes predictable strings and never emits a crack-time guarantee',()=>{
  const weak=inspectPassword('password123');
  const strong=inspectPassword('v7@Pr9#qL2!kWx');
  assert.ok(weak.score<strong.score);
  assert.doesNotMatch(strong.description,/crack time is/);
  assert.equal(inspectPassword('').score,0);
});
test('Log fixture includes repeated failures and success after failures',()=>{
  const out=inspectLog(sampleLog);
  assert.equal(out.events,8);
  assert.equal(out.skipped,0);
  assert.equal(out.warnings.length,2);
  assert.equal(out.sources.length,2);
  assert.match(out.note,/does not calculate time-window bursts/i);
});
test('Log parser ignores unrelated input and has no false alerts',()=>{
  const x=inspectLog('irrelevant\nNov 14 12:00:00 server sshd[1]: Accepted password for guest from 192.0.2.3 port 23 ssh2');
  assert.equal(x.events,1);
  assert.equal(x.skipped,1);
  assert.equal(x.warnings.length,0);
});
test('Five case files include source, screenshot, constraints and honest status',()=>{
  assert.deepEqual(orderedProjects,['qrshield','cyberlab','whispercache','vendorguard','rakshex']);
  for(const p of Object.values(projects)){
    assert.ok(p.title && p.source.startsWith('https://github.com/'));
    assert.ok(p.screenshot && p.alt && p.screenshotNote);
    assert.ok(p.challenge && p.overview && p.built.length>=3 && p.steps.length>=3);
    assert.ok(p.constraints.length>=2);
  }
  assert.match(projects.rakshex.overview,/no.*paying customers/i);
  assert.match(projects.whispercache.constraints.join(' '),/simulated/i);
});
