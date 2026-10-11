import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HOME = process.env.HOME ?? '';
const CANDIDATES = [
  process.env.CHROME_PATH,
  join(HOME, 'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'),
  join(HOME, 'Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const executablePath = CANDIDATES.find((path) => path && existsSync(path));
if (!executablePath) {
  console.log('[shots] Не найден браузер — проверка пропущена.');
  process.exit(2);
}

const url = process.env.PREVIEW_URL ?? 'http://localhost:4321/';
const outDir = join(process.cwd(), 'docs', 'screenshots');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const checks = {};
const consoleErrors = [];
const failedRequests = [];
const motionLog = [];

const browser = await puppeteer.launch({
  executablePath,
  headless: 'shell',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu'],
});

async function newPage(width, height, reducedMotion = false) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  if (reducedMotion) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  }
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  return page;
}

async function shot(page, name) {
  await page.screenshot({ path: join(outDir, name) });
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function log(page, entry) {
  const state = await page.evaluate(() => ({
    progress: document.querySelector('.vp-interest-progress-text')?.textContent ?? null,
    results: document.querySelectorAll('.vp-direction-card').length,
    dialogOpen: document.querySelector('dialog.vp-dialog')?.open ?? false,
    editBanner: Boolean(document.querySelector('.vp-interest-editbar')),
    reason: document.querySelector('.vp-direction-reason')?.textContent ?? null,
    heroLabel: document.querySelector('[data-hero-primary-label]')?.textContent ?? null,
  }));
  motionLog.push({ at: entry, ...state });
}

async function clickByText(page, text) {
  const ok = await page.evaluate((needle) => {
    const nodes = Array.from(document.querySelectorAll('button, a'));
    const element = nodes.find((node) =>
      (node.textContent ?? '').replace(/\s+/g, ' ').trim().startsWith(needle),
    );
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ block: 'center' });
      element.click();
      return true;
    }
    return false;
  }, text);
  if (!ok) throw new Error(`Не найден элемент по тексту: ${text}`);
}

async function tapOption(page, index) {
  await page.evaluate((i) => {
    document.querySelectorAll('.vp-interest-option')[i]?.scrollIntoView({ block: 'center' });
  }, index);
  await sleep(180);
  const handles = await page.$$('.vp-interest-option');
  const target = handles[index];
  if (!target) throw new Error(`Опция ${index} не найдена`);
  const box = await target.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(140);
  const selected = await page.evaluate(
    (i) => document.querySelectorAll('.vp-interest-option')[i]?.getAttribute('data-selected') === 'true',
    index,
  );
  if (!selected) throw new Error(`Опция ${index} не отметилась`);
}

async function expectProgress(page, text) {
  const ok = await page.evaluate(
    (needle) => document.querySelector('.vp-interest-progress-text')?.textContent?.trim() === needle,
    text,
  );
  if (!ok) throw new Error(`Ожидался прогресс «${text}»`);
}

const summary = {};

try {
  const page = await newPage(1440, 900);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await shot(page, 'desktop-01-hero.png');
  await log(page, 'hero');
  summary.webglSceneReady = await page.evaluate(
    () => document.querySelector('.vp-atlas')?.getAttribute('data-ready') === 'true',
  );
  summary.ctaUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="ventorme.ai/register"]')).map((a) => a.href),
  );
  summary.horizontalOverflowDesktop = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

  await clickByText(page, 'Исследовать интересы');
  await sleep(900);
  await expectProgress(page, 'Вопрос 1 из 3');
  summary.heroCtaOpensQ1 = await page.evaluate(() => {
    const rect = document.querySelector('.vp-interest-question')?.getBoundingClientRect();
    return Boolean(rect && rect.top >= 0 && rect.top < window.innerHeight);
  });
  await log(page, 'after-hero-cta');

  await tapOption(page, 0);
  await tapOption(page, 2);
  await shot(page, 'desktop-02-q1.png');
  await clickByText(page, 'Далее');
  await sleep(500);
  await expectProgress(page, 'Вопрос 2 из 3');
  await tapOption(page, 1);
  await shot(page, 'desktop-03-q2.png');
  await clickByText(page, 'Далее');
  await sleep(500);
  await expectProgress(page, 'Вопрос 3 из 3');
  await tapOption(page, 0);
  await shot(page, 'desktop-04-q3.png');
  await clickByText(page, 'Показать направления');
  await sleep(900);
  await page.evaluate(() =>
    document.querySelector('.vp-results-heading')?.scrollIntoView({ block: 'start' }),
  );
  await sleep(300);
  await shot(page, 'desktop-05-result.png');
  summary.resultCards = await page.$$eval('.vp-direction-card', (nodes) => nodes.length);
  summary.resultHasReasons = await page.evaluate(
    () => document.querySelectorAll('.vp-direction-reason').length,
  );
  await log(page, 'result');

  await clickByText(page, 'Подробнее');
  await sleep(600);
  await shot(page, 'desktop-06-dialog.png');
  summary.dialogOpen = await page.evaluate(
    () => document.querySelector('dialog.vp-dialog')?.open ?? false,
  );
  await page.keyboard.press('Escape');
  await sleep(300);
  summary.dialogClosedAfterEscape = await page.evaluate(
    () => !(document.querySelector('dialog.vp-dialog')?.open ?? false),
  );
  summary.focusReturnedToCard = await page.evaluate(
    () => document.activeElement?.textContent?.includes('Подробнее') ?? false,
  );

  await clickByText(page, 'Изменить ответы');
  await sleep(600);
  summary.editBannerVisible = await page.evaluate(
    () => Boolean(document.querySelector('.vp-interest-editbar')),
  );
  await shot(page, 'desktop-07-edit.png');
  await log(page, 'edit');
  await clickByText(page, 'Отменить изменения');
  await sleep(600);
  summary.cancelReturnsToResult = await page.evaluate(
    () => document.querySelectorAll('.vp-direction-card').length === 3,
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  summary.heroLabelAfterResult = await page.evaluate(
    () => document.querySelector('[data-hero-primary-label]')?.textContent?.trim() ?? null,
  );

  const branchOk = await page.evaluate(() => {
    const chip = document.querySelector('.vp-atlas-label[data-cat="creativity"]');
    chip?.scrollIntoView({ block: 'center' });
    chip?.click();
    return true;
  });
  if (!branchOk) throw new Error('Ветка героя недоступна');
  await sleep(700);
  await page.evaluate(() =>
    document.querySelector('.vp-interest-requested')?.scrollIntoView({ block: 'center' }),
  );
  await sleep(300);
  summary.branchRequestedHint = await page.evaluate(
    () => document.querySelector('.vp-interest-requested')?.textContent?.includes('Чтобы добавить') ?? false,
  );
  await shot(page, 'desktop-08-branch-hint.png');
  await log(page, 'branch-hint');

  await clickByText(page, 'Посмотреть примеры без вопросов');
  await sleep(700);
  summary.demoBadge = await page.evaluate(
    () => document.querySelector('.vp-direction-badge')?.textContent?.trim() ?? null,
  );
  await page.evaluate(() =>
    document.querySelector('.vp-results-heading')?.scrollIntoView({ block: 'start' }),
  );
  await sleep(300);
  await shot(page, 'desktop-09-demo.png');
  await log(page, 'demo');

  await page.evaluate(() => document.getElementById('ventorme')?.scrollIntoView());
  await sleep(700);
  await shot(page, 'desktop-10-ventorme.png');
  summary.featuresCaption = await page.evaluate(
    () => document.body.textContent?.includes('Схема-иллюстрация') ?? false,
  );

  await page.evaluate(() => document.getElementById('steps')?.scrollIntoView());
  await sleep(400);
  await shot(page, 'desktop-11-steps.png');

  await page.evaluate(() => document.getElementById('faq')?.scrollIntoView());
  await sleep(500);
  await shot(page, 'desktop-12-faq.png');

  await page.evaluate(() => document.getElementById('final')?.scrollIntoView());
  await sleep(500);
  await shot(page, 'desktop-13-final.png');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(400);
  await shot(page, 'desktop-14-footer.png');
  await page.close();

  const mobile = await newPage(390, 844);
  await mobile.goto(url, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await mobile.screenshot({ path: join(outDir, 'mobile-01-hero.png') });
  summary.mobileCtaVisible = await mobile.evaluate(() => {
    const cta = document.querySelector('[data-hero-primary]')?.getBoundingClientRect();
    return Boolean(cta && cta.bottom <= 844 && cta.top > 0);
  });
  summary.mobileSceneVisible = await mobile.evaluate(() => {
    const scene = document.querySelector('.vp-atlas-3d')?.getBoundingClientRect();
    return Boolean(scene && scene.height > 180 && scene.top < 844);
  });
  summary.horizontalOverflowMobile = await mobile.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

  await mobile.evaluate(() => document.getElementById('interests')?.scrollIntoView());
  await sleep(800);
  await shot(mobile, 'mobile-02-interests.png');
  await tapOption(mobile, 0);
  await tapOption(mobile, 3);
  await clickByText(mobile, 'Далее');
  await sleep(500);
  await tapOption(mobile, 0);
  await clickByText(mobile, 'Далее');
  await sleep(500);
  await tapOption(mobile, 1);
  await clickByText(mobile, 'Показать направления');
  await sleep(900);
  await mobile.evaluate(() =>
    document.querySelector('.vp-results-heading')?.scrollIntoView({ block: 'start' }),
  );
  await sleep(300);
  await shot(mobile, 'mobile-03-result.png');
  summary.mobileResultCards = await mobile.$$eval('.vp-direction-card', (nodes) => nodes.length);

  await clickByText(mobile, 'Подробнее');
  await sleep(600);
  await shot(mobile, 'mobile-04-dialog.png');
  await mobile.keyboard.press('Escape');
  await sleep(300);

  await mobile.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await mobile.click('[data-menu-btn]');
  await sleep(400);
  await shot(mobile, 'mobile-05-menu.png');
  await mobile.keyboard.press('Escape');
  await sleep(300);
  await mobile.close();

  const reduced = await newPage(1440, 900, true);
  await reduced.goto(url, { waitUntil: 'networkidle0' });
  await sleep(1600);
  await shot(reduced, 'desktop-15-reduced-motion.png');
  summary.reducedSceneReady = await reduced.evaluate(
    () => document.querySelector('.vp-atlas')?.getAttribute('data-ready') === 'true',
  );
  await reduced.close();

  const nojs = await browser.newPage();
  await nojs.setJavaScriptEnabled(false);
  await nojs.setViewport({ width: 390, height: 844 });
  await nojs.goto(url, { waitUntil: 'networkidle0' });
  await sleep(400);
  await nojs.screenshot({ path: join(outDir, 'mobile-06-no-js.png') });
  summary.noJsHasTitle = await nojs.evaluate(() =>
    (document.querySelector('h1')?.textContent ?? '').includes('Твой интерес'),
  );
  summary.noJsHasRegistrationLink = await nojs.evaluate(() =>
    Array.from(document.querySelectorAll('a')).some((a) => a.href.includes('ventorme.ai/register')),
  );
  summary.noJsHasPoster = await nojs.evaluate(
    () => Boolean(document.querySelector('.vp-atlas-poster')),
  );
  summary.noJsFaqItems = await nojs.evaluate(
    () => document.querySelectorAll('#faq details').length,
  );
  await nojs.close();

  const mid = await newPage(1280, 720);
  await mid.goto(url, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await shot(mid, 'desktop-00-hero-1280x720.png');
  await mid.close();

  const small = await newPage(360, 800);
  await small.goto(url, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await shot(small, 'mobile-00-hero-360x800.png');
  summary.small360Overflow = await small.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  await small.close();

  const tiny = await newPage(320, 690);
  await tiny.goto(url, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await shot(tiny, 'mobile-07-hero-320.png');
  summary.tiny320Overflow = await tiny.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  const ctaIn320 = await tiny.evaluate(() => {
    const rect = document.querySelector('[data-hero-primary]')?.getBoundingClientRect();
    return rect ? rect.width > 120 && rect.height >= 44 : false;
  });
  summary.tiny320CtaReadable = ctaIn320;
  await tiny.close();

  summary.motionLog = motionLog;
  summary.consoleErrors = consoleErrors;
  summary.failedRequests = failedRequests.slice(0, 8);
  summary.browser = executablePath;
} catch (error) {
  summary.error = String(error);
  summary.motionLog = motionLog;
  summary.consoleErrors = consoleErrors;
} finally {
  await browser.close();
}

writeFileSync(join(outDir, 'run-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
