// Design QA: geometry and interaction checks across small phones through desktop.
// Screenshots are visual review artifacts, NOT assertions that other companies' layouts were copied.
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const viewports=[320,360,390,768,1024,1280,1440];
const routes=[
  {name:'home',path:'/'},
  {name:'workbench',path:'/workbench.html'},
  {name:'qrshield',path:'/case-study.html?project=qrshield'},
  {name:'rakshex',path:'/case-study.html?project=rakshex'}
];
const screenshotWidths=new Set([320,390,768,1280,1440]);
const outDir='test-results/visual-extended';

test.describe('responsive geometry / all published experiences',()=>{
  for(const route of routes){
    for(const width of viewports){
      test(route.name+' at '+width+'px',async({browser})=>{
        const context=await browser.newContext({
          viewport:{width,height:800},
          deviceScaleFactor:1,
          reducedMotion:'reduce'
        });
        const page=await context.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(route.path,{waitUntil:'domcontentloaded'});
        await page.locator('main h1').first().waitFor({state:'visible'});
        await page.waitForTimeout(170);
        const geometry=await page.evaluate(()=>{
          const viewport=innerWidth;
          const html=document.documentElement;
          const main=document.querySelector('main');
          const rect=main.getBoundingClientRect();
          const h1=document.querySelector('main h1');
          const h1r=h1.getBoundingClientRect();
          const primary=[...document.querySelectorAll('a.btn,button.btn,button.lab-tab,.nav-toggle')].filter(node=>{
            const cs=getComputedStyle(node);
            return cs.visibility!=='hidden'&&cs.display!=='none'&&node.getClientRects().length;
          }).map(node=>{
            const r=node.getBoundingClientRect();
            return {label:(node.textContent||node.getAttribute('aria-label')||'').trim().slice(0,42),w:Math.round(r.width),h:Math.round(r.height)};
          });
          return {
            viewport,
            scrollWidth:html.scrollWidth,
            contentWidth:rect.width,
            headingWidth:h1r.width,
            headingRight:h1r.right,
            headingLeft:h1r.left,
            smallPrimary:primary.filter(x=>x.w<24||x.h<24),
            allVisible:[...document.querySelectorAll('.section,.featured-proof,.case-block,.lab-panel:not([hidden])')].every(el=>Number(getComputedStyle(el).opacity)>.99)
          };
        });
        expect(errors,'Browser console/runtime errors').toEqual([]);
        expect(geometry.scrollWidth,'Unexpected horizontal document overflow').toBeLessThanOrEqual(width+2);
        expect(geometry.headingRight,'Main heading escapes the right side').toBeLessThanOrEqual(width+2);
        expect(geometry.headingLeft,'Main heading escapes the left side').toBeGreaterThanOrEqual(-2);
        expect(geometry.smallPrimary,'Primary controls smaller than WCAG minimum').toEqual([]);
        expect(geometry.allVisible,'Text must remain visible without scroll').toBe(true);
        if(width<=390){
          const toggle=page.locator('#navToggle');
          await expect(toggle).toBeVisible();
          const box=await toggle.boundingBox();
          expect(box.height).toBeGreaterThanOrEqual(44);
          await toggle.click();
          await expect(toggle).toHaveAttribute('aria-expanded','true');
          await page.keyboard.press('Escape');
          await expect(toggle).toHaveAttribute('aria-expanded','false');
        }
        if(screenshotWidths.has(width)){
          mkdirSync(outDir,{recursive:true});
          await page.screenshot({
            path:outDir+'/'+route.name+'-'+width+'.png',
            fullPage:true,
            animations:'disabled',
            timeout:35000
          });
        }
        await context.close();
      });
    }
  }
});

test('document metadata and helpful 404 page',async({page})=>{
  await page.goto('/404.html');
  await expect(page.getByRole('heading',{name:"This path isn't in the archive."})).toBeVisible();
  await expect(page.getByRole('link',{name:/Back to the portfolio/})).toHaveAttribute('href','/index.html');
  await page.goto('/workbench.html');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/workbench\.html/);
  await page.goto('/case-study.html?project=qrshield');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/project=qrshield/);
});
