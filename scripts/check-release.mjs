import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const mode = (process.env.PUBLIC_VENTORME_MODE ?? 'preview').trim().toLowerCase();
const teamId = (process.env.PUBLIC_VENTORME_TEAM_ID ?? '').trim();
const base = (process.env.PUBLIC_VENTORME_BASE ?? 'https://ventorme.ai/register').trim();

const errors = [];
const warnings = [];

const PLACEHOLDER_TEAM_RE = /^(017|номер|xxx+|todo|test|example|000)$/i;

let expected;
if (mode === 'competition') {
  if (!teamId) {
    errors.push('competition: PUBLIC_VENTORME_TEAM_ID пуст');
  } else {
    if (PLACEHOLDER_TEAM_RE.test(teamId)) {
      errors.push(`competition: номер "${teamId}" похож на пример-заглушку — нужен официальный номер из списка`);
    }
    if (!/^[0-9A-Za-z][0-9A-Za-z-]{0,15}$/.test(teamId)) {
      errors.push(`competition: номер "${teamId}" не соответствует формату строки из официального списка`);
    }
  }
  const u = new URL(base);
  u.searchParams.set('utm_source', 'hacknext');
  u.searchParams.set('utm_campaign', `team-${teamId}`);
  expected = u.toString();
} else {
  expected = new URL(base).toString();
  warnings.push(
    'preview: конкурсная атрибуция отключена (ссылка без team-номера). Конкурсный выпуск: PUBLIC_VENTORME_MODE=competition и PUBLIC_VENTORME_TEAM_ID.',
  );
}

const dist = join(process.cwd(), 'dist');
const files = [];
if (!existsSync(dist)) {
  errors.push('dist/ не найден — сначала выполните npm run build');
} else {
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  };
  walk(dist);
}

const PLACEHOLDER_RE = /team-(%D0%9D%D0%9E%D0%9C%D0%95%D0%A0|НОМЕР|XXX|TODO|undefined|null|example)/i;
const REGISTER_RE = /https:\/\/ventorme\.ai\/register[^"'`\\\s<)]*/g;

const foundUrls = new Set();
let placeholderFiles = [];

for (const file of files) {
  const isMarkup = /\.(html|svg|xml|txt|json)$/.test(file);
  const isCode = /\.(js|css)$/.test(file);
  if (!isMarkup && !isCode) continue;
  const content = readFileSync(file, 'utf8');
  if (isMarkup) {
    let m;
    while ((m = REGISTER_RE.exec(content)) !== null) foundUrls.add(m[0]);
  }
  if (PLACEHOLDER_RE.test(content)) placeholderFiles.push(file);
}

const normalize = (u) => u.replaceAll('&amp;', '&');
const normalizedExpected = normalize(expected);
let urlMatches = 0;
for (const raw of foundUrls) {
  const u = normalize(raw);
  if (u === normalizedExpected) urlMatches += 1;
  else errors.push(`найдена ссылка, не совпадающая с командной: ${u}`);
}

if (placeholderFiles.length > 0) {
  errors.push(`заглушки в сборке: ${placeholderFiles.join(', ')}`);
}

console.log('--- check-release ---');
console.log(`режим: ${mode}${mode === 'competition' ? ` (team-${teamId || '<пусто>'})` : ''}`);
console.log(`ожидаемая ссылка: ${expected}`);
console.log(`совпадающих ссылок в dist: ${urlMatches}, всего вариантов: ${foundUrls.size}`);
for (const w of warnings) console.log(`[warn] ${w}`);
for (const e of errors) console.log(`[error] ${e}`);

if (errors.length > 0) {
  console.log(`ИТОГ: FAIL (${errors.length} ошибок)`);
  process.exitCode = 1;
} else {
  console.log('ИТОГ: OK');
}
