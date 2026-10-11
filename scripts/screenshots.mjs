import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HOME = process.env.HOME ?? '';
const CANDIDATES = [
  process.env.CHROME_PATH,
  join(HOME, 'Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  join(HOME, 'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

const executablePath = CANDIDATES.find((path) => path && existsSync(path));
if (!executablePath) {
  console.log('[shots] Не найден браузер для скриншотов — проверка пропущена.');
  process.exit(2);
}

const url = process.env.PREVIEW_URL ?? 'http://localhost:4321/';
const outDir = join(process.cwd(), 'docs', 'screenshots');
mkdirSync(outDir, { recursive: true });

const checks = {};
const consoleErrors = [];
const failedRequests = [];

const browser = await puppeteer.launch({
  executablePath,
  headless: 'shell',
  args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1'],
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
  return name;
}

async function clickByText(page, text) {
  const ok = await page.evaluate((needle) => {
    const nodes = Array.from(document.querySelectorAll('button, a'));
    const el = nodes.find((node) => (node.textContent ?? '').replace(/\s+/g, ' ').trim().startsWith(needle));
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    }
    return false;
  }, text);
  if (!ok) throw new Error(`Не найден элемент по тексту: ${text}`);
  return ok;
}

async function tapOption(page, index) {
  await page.evaluate((i) => {
    const el = document.querySelectorAll('.vp-interest-option')[i];
    el?.scrollIntoView({ block: 'center' });
  }, index);
  await sleep(200);
  const handles = await page.$$('.vp-interest-option');
  const target = handles[index];
  if (!target) throw new Error(`Опция ${index} не найдена`);
  const box = await target.boundingBox();
  if (!box) throw new Error(`Опция ${index} без boundingBox`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(150);
  const selected = await page.evaluate(
    (i) => document.querySelectorAll('.vp-interest-option')[i]?.getAttribute('data-selected') === 'true',
    index,
  );
  if (!selected) throw new Error(`Опция ${index} не отметилась после тапа`);
}

async function expectProgress(page, text) {
  const ok = await page.evaluate(
    (needle) => document.querySelector('.vp-interest-progress-text')?.textContent?.trim() === needle,
    text,
  );
  if (!ok) throw new Error(`Ожидалось «${text}»`);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const summary = {};

try {
  const page = await newPage(1440, 900);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(400);
  await shot(page, 'desktop-01-hero.png');

  summary.ctaUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="ventorme.ai/register"]')).map((a) => a.href),
  );
  summary.horizontalOverflowDesktop = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

  await page.evaluate(() => document.getElementById('interests')?.scrollIntoView());
  await sleep(600);
  await shot(page, 'desktop-02-interests-idle.png');

  await clickByText(page, 'Начать подборку');
  await sleep(450);
  await expectProgress(page, 'Вопрос 1 из 3');
  await tapOption(page, 0);
  await tapOption(page, 2);
  await shot(page, 'desktop-03-q1-selected.png');

  await clickByText(page, 'Далее');
  await sleep(450);
  await expectProgress(page, 'Вопрос 2 из 3');
  await tapOption(page, 2);
  await clickByText(page, 'Далее');
  await sleep(450);
  await expectProgress(page, 'Вопрос 3 из 3');
  await tapOption(page, 0);
  await clickByText(page, 'Показать направления');
  await sleep(700);
  await page.evaluate(() => document.querySelector('.vp-results-heading')?.scrollIntoView({ block: 'start' }));
  await sleep(300);
  await shot(page, 'desktop-04-results.png');

  summary.mixedNote = await page.evaluate(() =>
    document.body.textContent?.includes('У тебя получилось несколько интересов') ?? false,
  );
  summary.cardCount = await page.$$eval('.vp-direction-card', (nodes) => nodes.length);

  await clickByText(page, 'Посмотреть подробнее');
  await sleep(500);
  await shot(page, 'desktop-05-dialog.png');
  summary.dialogOpen = await page.evaluate(
    () => document.querySelector('dialog.vp-dialog')?.open ?? false,
  );
  await page.keyboard.press('Escape');
  await sleep(300);
  summary.dialogClosedAfterEscape = await page.evaluate(
    () => !(document.querySelector('dialog.vp-dialog')?.open ?? false),
  );
  summary.focusReturnedToCard = await page.evaluate(() => {
    const active = document.activeElement;
    return active instanceof HTMLElement && active.textContent?.includes('Посмотреть подробнее');
  });

  await page.evaluate(() => document.getElementById('ventorme')?.scrollIntoView());
  await sleep(500);
  await shot(page, 'desktop-06-ventorme.png');
  summary.selectionSummaryHasDirections = await page.evaluate(() => {
    const summaryEl = document.querySelector('.vp-summary');
    return summaryEl ? summaryEl.textContent?.includes('Направления подборки') ?? false : false;
  });

  await page.evaluate(() => document.getElementById('steps')?.scrollIntoView());
  await sleep(400);
  await shot(page, 'desktop-07-steps.png');

  await page.evaluate(() => document.getElementById('faq')?.scrollIntoView());
  await sleep(400);
  await page.evaluate(() => {
    const first = document.querySelector('#faq details');
    first?.setAttribute('open', 'true');
  });
  await sleep(300);
  await shot(page, 'desktop-08-faq.png');
  summary.faqFirstOpen = await page.evaluate(
    () => document.querySelector('#faq details')?.open ?? false,
  );

  await page.evaluate(() => document.getElementById('final')?.scrollIntoView());
  await sleep(400);
  await shot(page, 'desktop-09-final.png');
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(300);
  await shot(page, 'desktop-10-footer.png');
  await page.close();

  const mobile = await newPage(390, 844);
  await mobile.goto(url, { waitUntil: 'networkidle0' });
  await sleep(400);
  await shot(mobile, 'mobile-01-hero.png');
  summary.horizontalOverflowMobile = await mobile.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

  await mobile.evaluate(() => document.getElementById('interests')?.scrollIntoView());
  await sleep(600);
  await shot(mobile, 'mobile-02-interests.png');
  await clickByText(mobile, 'Начать подборку');
  await sleep(400);
  await expectProgress(mobile, 'Вопрос 1 из 3');
  await tapOption(mobile, 0);
  await tapOption(mobile, 1);
  await shot(mobile, 'mobile-03-q1.png');
  await clickByText(mobile, 'Далее');
  await sleep(400);
  await expectProgress(mobile, 'Вопрос 2 из 3');
  await tapOption(mobile, 0);
  await clickByText(mobile, 'Далее');
  await sleep(400);
  await expectProgress(mobile, 'Вопрос 3 из 3');
  await tapOption(mobile, 1);
  await clickByText(mobile, 'Показать направления');
  await sleep(700);
  const mobileResults = await mobile.evaluate(
    () => document.querySelectorAll('.vp-direction-card').length,
  );
  if (mobileResults !== 3) throw new Error(`Мобильные результаты: карточек ${mobileResults}, ожидалось 3`);
  await mobile.evaluate(() => document.querySelector('.vp-results-heading')?.scrollIntoView({ block: 'start' }));
  await sleep(300);
  await shot(mobile, 'mobile-04-results.png');
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);

  await mobile.click('[data-menu-btn]');
  await sleep(350);
  await shot(mobile, 'mobile-05-menu.png');
  summary.menuOpen = await mobile.evaluate(
    () => document.querySelector('[data-menu-panel]')?.getAttribute('data-open') === 'true',
  );
  await mobile.keyboard.press('Escape');
  await sleep(300);
  summary.menuClosedAfterEscape = await mobile.evaluate(
    () => document.querySelector('[data-menu-panel]')?.getAttribute('data-open') !== 'true',
  );
  await mobile.close();

  const reduced = await newPage(390, 844, true);
  await reduced.goto(url, { waitUntil: 'networkidle0' });
  await sleep(400);
  await reduced.evaluate(() => document.getElementById('interests')?.scrollIntoView());
  await sleep(400);
  await shot(reduced, 'mobile-06-reduced-motion.png');
  await reduced.close();

  const nojs = await browser.newPage();
  await nojs.setJavaScriptEnabled(false);
  await nojs.setViewport({ width: 390, height: 844 });
  await nojs.goto(url, { waitUntil: 'networkidle0' });
  await sleep(300);
  await shot(nojs, 'mobile-07-no-js.png');
  summary.noJsHasTitle = await nojs.evaluate(
    () => (document.querySelector('h1')?.textContent ?? '').includes('Твоё будущее'),
  );
  summary.noJsHasRegistrationLink = await nojs.evaluate(
    () =>
      Array.from(document.querySelectorAll('a')).some((a) =>
        a.href.includes('ventorme.ai/register'),
      ),
  );
  summary.noJsHasFaq = await nojs.evaluate(
    () => document.querySelectorAll('#faq details').length,
  );
  await nojs.close();

  summary.consoleErrors = consoleErrors;
  summary.failedRequests = failedRequests.slice(0, 10);
  summary.browser = executablePath;
} catch (error) {
  summary.error = String(error);
} finally {
  await browser.close();
}

writeFileSync(join(outDir, 'run-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
