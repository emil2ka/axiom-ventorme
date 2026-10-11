import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const HOME = process.env.HOME ?? '';
const candidates = [
  process.env.CHROME_PATH,
  join(HOME, 'Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
  join(HOME, 'Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const executablePath = candidates.find((path) => path && existsSync(path));
if (!executablePath) {
  console.log('[cover] Браузер не найден — обложка не создана.');
  process.exit(2);
}

mkdirSync('public/images', { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: 'shell',
  args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('scripts/og-template.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise((resolve) => setTimeout(resolve, 300));
await page.screenshot({ path: 'public/images/share-cover.png' });
await browser.close();
console.log('[cover] public/images/share-cover.png создан');
