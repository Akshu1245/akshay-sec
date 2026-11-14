import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('home has real project paths, a working navigation and full-size screenshots',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/K\s*S\s*Akshay/i})).toBeVisible();
  await expect(page.getByRole('link',{name:/Try the workbench/i}).first()).toHaveAttribute('href','workbench.html');
  await expect(page.locator('a.project-case-link')).toHaveCount(5);
  await expect(page.locator('a.shot-link')).toHaveCount(6);
  await expect(page.locator('#company')).toContainText('no paying customers');
  // A full-page screenshot or disabled scroll JS must not show blank content.
  const projectOpacity=await page.locator('#projects').evaluate(el=>Number(getComputedStyle(el).opacity));
  expect(projectOpacity).toBeGreaterThan(0.99);
  expect(errors).toEqual([]);
  mkdirSync('test-results/visual',{recursive:true});
  await page.screenshot({path:'test-results/visual/home-desktop.png',fullPage:true,animations:'disabled'});
});

test('case files open and show useful source evidence',async({page})=>{
  const cases={qrshield:'QRShield',cyberlab:'Akshay Cyber Lab',whispercache:'WhisperCache',vendorguard:'VendorGuard AI',rakshex:'RaksHex'};
  for(const [slug,title] of Object.entries(cases)){
    await page.goto('/case-study.html?project='+slug);
    await expect(page.locator('.case-header h1')).toHaveText(title);
    await expect(page.locator('.case-main-column .case-block')).toHaveCount(5);
    await expect(page.getByRole('link',{name:/View source/i})).toHaveAttribute('href',/github.com\/Akshu1245\//);
    await expect(page.locator('.case-image')).toHaveAttribute('alt',/.+/);
  }
});

test('unknown case returns a deliberate not-found state',async({page})=>{
  await page.goto('/case-study.html?project=not-real');
  await expect(page.locator('#caseRoot')).toContainText('not in the archive');
});

test('URL demonstration is interactive and does not label a URL safe',async({page})=>{
  await page.goto('/workbench.html#phishcheck');
  await page.getByRole('button',{name:'Lookalike'}).click();
  await expect(page.locator('#phishResult')).toContainText('High concern');
  await expect(page.locator('#phishResult')).toContainText('Lookalike brand spelling');
  await page.getByRole('button',{name:'Simple HTTPS'}).click();
  await expect(page.locator('#phishResult')).toContainText('not a safety verdict');
});

test('header and password demos respond to fixture changes',async({page})=>{
  await page.goto('/workbench.html#headercheck');
  await page.getByRole('button',{name:'Inspect fixture'}).click();
  await expect(page.locator('#headerResult')).toContainText('6 of 6 controls present');
  await page.locator('#headerPreset').selectOption('weak');
  await page.getByRole('button',{name:'Inspect fixture'}).click();
  await expect(page.locator('#headerResult')).toContainText('0 of 6 controls present');
  await page.getByRole('tab',{name:/passaudit/}).click();
  await page.getByRole('button',{name:'Predictable'}).click();
  await expect(page.locator('#passResult')).toContainText('Pattern score');
  await expect(page.locator('#passResult')).toContainText('Predictable');
});

test('logwatch demo shows repeated failures followed by success',async({page})=>{
  await page.goto('/workbench.html#logwatch');
  await page.getByRole('button',{name:'Review events'}).click();
  await expect(page.locator('#logResult')).toContainText('2 review flags');
  await expect(page.locator('#logResult')).toContainText('Success following failures');
});

test('mobile navigation works without sideways scrolling',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const menu=page.locator('#navToggle');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.locator('#navLinks').getByRole('link',{name:'workbench'}).click();
  await expect(page).toHaveURL(/workbench\.html/);
  await expect(page.locator('.workbench-header h1')).toBeVisible();
  const width=await page.evaluate(()=>({inner:window.innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.inner+2);
  mkdirSync('test-results/visual',{recursive:true});
  await page.screenshot({path:'test-results/visual/workbench-mobile.png',fullPage:true,animations:'disabled'});
});

test('keyboard tabs and reduced-motion view remain usable',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/workbench.html');
  await expect(page.locator('.bg-video')).toBeHidden();
  await page.getByRole('tab',{name:/phishcheck/}).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('tab',{name:/headercheck/})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#panel-headercheck')).toBeVisible();
});

test('all project evidence images have local, decoded assets',async({page})=>{
  await page.goto('/');
  const images=await page.locator('.shot').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0})));
  expect(images).toHaveLength(6);
  expect(images.every(image=>image.loaded)).toBe(true);
  expect(images.some(image=>image.src==='assets/shot-cyberlab.png')).toBe(true);
  await page.goto('/case-study.html?project=cyberlab');
  await expect(page.locator('.case-image')).toHaveAttribute('src','assets/shot-cyberlab.png');
  expect(await page.locator('.case-image').evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
});

test('ambient animation can be paused and restored without deleting page content',async({page})=>{
  await page.goto('/');
  const motion=page.locator('#motionToggle');
  await expect(motion).toBeVisible();
  await expect(motion).toHaveAttribute('aria-pressed','false');
  await motion.click();
  await expect(motion).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('html')).toHaveClass(/motion-paused/);
  expect(await page.locator('.bg-video').evaluate(video=>video.paused)).toBe(true);
  await motion.click();
  await expect(motion).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#projects')).toBeVisible();
});

test('responsive navigation becomes a menu at tablet widths and closes with Escape',async({page})=>{
  await page.setViewportSize({width:1024,height:768});
  await page.goto('/');
  const toggle=page.locator('#navToggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator('#navLinks')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#navLinks')).toBeHidden();
});

test('all page headings use the same configured display font',async({page})=>{
  const fonts=[];
  for(const location of ['/', '/workbench.html','/case-study.html?project=qrshield']) {
    await page.goto(location);
    fonts.push(await page.locator('h1').first().evaluate(el=>getComputedStyle(el).fontFamily));
  }
  expect(new Set(fonts).size).toBe(1);
  expect(fonts[0]).toContain('Space Grotesk');
});

for(const width of [320,375,390,430,768,1024,1280,1440]) {
  test('viewport '+width+'px has no page overflow and keeps content reachable',async({page})=>{
    await page.setViewportSize({width,height:width<500?844:900});
    const routes=['/','/workbench.html','/case-study.html?project=qrshield'];
    for(const route of routes) {
      await page.goto(route);
      const info=await page.evaluate(()=>({
        viewport:window.innerWidth,
        scroll:document.documentElement.scrollWidth,
        main:document.querySelector('main')?.getBoundingClientRect().toJSON()
      }));
      expect(info.scroll,route+' overflows at '+width+'px').toBeLessThanOrEqual(info.viewport+2);
      expect(info.main.width).toBeGreaterThan(200);
      await expect(page.locator('h1').first()).toBeVisible();
      if(route==='/'&&width<=430) {
        const rects=await page.evaluate(()=>({
          name:document.querySelector('.hero h1').getBoundingClientRect().toJSON(),
          art:document.querySelector('.hero-art').getBoundingClientRect().toJSON()
        }));
        expect(rects.name.top,'Name should appear before robot on a phone').toBeLessThan(rects.art.top);
      }
      if ((width===390||width===1440) && route!=='/' ) {
        mkdirSync('test-results/visual',{recursive:true});
        const basename=route.includes('workbench')?'workbench':'case-study';
        await page.screenshot({path:'test-results/visual/'+basename+'-'+width+'.png',fullPage:true,animations:'disabled'});
      }
    }
    if(width===390||width===1440){
      await page.goto('/');
      mkdirSync('test-results/visual',{recursive:true});
      await page.screenshot({path:'test-results/visual/home-'+width+'.png',fullPage:true,animations:'disabled'});
    }
  });
}
