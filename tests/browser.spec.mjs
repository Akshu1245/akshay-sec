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
  const menu=page.getByRole('button',{name:'Open menu'});
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
