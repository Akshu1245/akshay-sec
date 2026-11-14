import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync} from 'node:fs';
const sizes=[320,360,390,768,1024,1440,1920];
const routes=['/','/workbench.html','/cases/qrshield.html'];
mkdirSync('test-results/visual-audit',{recursive:true});

for(const route of routes){
 for(const width of sizes){
  test(route+' has no sideways scroll at '+width+'px and captures visual evidence',async({page})=>{
   await page.setViewportSize({width,height:width<600?780:960});
   await page.emulateMedia({reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(route,{waitUntil:'domcontentloaded'});
   await expect(page.locator('main h1').first()).toBeVisible();
   const d=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.currentSrc)
   }));
   expect(d.scroll,JSON.stringify(d)).toBeLessThanOrEqual(d.viewport+2);
   expect(d.broken.filter(u=>u.startsWith('http://127.0.0.1:4173/'))).toEqual([]);
   expect(errors).toEqual([]);
   const slug=route==='/'?'home':route.includes('workbench')?'workbench':'case-qrshield';
   await page.screenshot({path:'test-results/visual-audit/'+slug+'-'+width+'.png',fullPage:width===390||width===1440,animations:'disabled'});
  });
 }
}
for(const slug of ['qrshield','cyberlab','whispercache','vendorguard','rakshex']){
 test('Static '+slug+' case is readable without scripts and has canonical metadata',async({browser})=>{
  const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const p=await c.newPage();await p.goto('/cases/'+slug+'.html');
  await expect(p.locator('article .case-header h1')).toBeVisible();
  await expect(p.locator('.case-main-column .case-block')).toHaveCount(5);
  await expect(p.locator('link[rel="canonical"]')).toHaveAttribute('href',new RegExp('/cases/'+slug+'\\.html$'));
  await expect(p.locator('meta[property="og:image"]')).toHaveAttribute('content',/^https:\/\//);
  await c.close();
 });
}
test('Security policy headers are served and browser demo still works',async({page})=>{
 const response=await page.goto('/workbench.html');
 const headers=response.headers();
 expect(headers['content-security-policy']).toContain("script-src 'self'");
 expect(headers['content-security-policy']).not.toContain('unsafe-inline');
 expect(headers['x-frame-options']).toBe('DENY');
 expect(headers['x-content-type-options']).toBe('nosniff');
 await page.getByRole('button',{name:'Lookalike'}).click();
 await expect(page.locator('#phishResult')).toContainText('High concern');
});
test('Automated WCAG A/AA serious and critical checks',async({browser})=>{
 const context=await browser.newContext({bypassCSP:true});
 const page=await context.newPage();
 for(const route of ['/','/workbench.html','/cases/qrshield.html']){
  await page.goto(route);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  const major=audit.violations.filter(x=>x.impact==='serious'||x.impact==='critical');
  expect(major,route+' '+JSON.stringify(major.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.map(n=>n.target).slice(0,6)})))).toEqual([]);
 }
 await context.close();
});
