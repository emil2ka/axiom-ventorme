# Выбери свой путь — знакомство с Ventorme

Интерактивный лендинг команды для Hacknext 2026: школьник выбирает интересы, получает редакционную подборку направлений для знакомства и переходит в Ventorme для регистрации.

> Это проектная страница команды, не официальный сайт Ventorme. Собственной регистрации на лендинге нет: все CTA ведут в Ventorme.

## Быстрый старт

Требуется Node >= 22.12.

```bash
npm install       # установка зависимостей
npm run dev       # локальная разработка (http://localhost:4321)
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр собранной версии
npm test          # 13 автотестов (логика подборки, SSR-смоук, компас)
npm run check:release  # проверка выпуска (режим, ссылки, заглушки)
npm run shots     # браузерный сценарий + скриншоты в docs/screenshots (нужен локальный Chromium)
```

## Режимы выпуска (preview / competition)

URL регистрации собирается в единственном месте — `src/config/campaign.ts`.

| Режим | Переменные | Что получается |
| --- | --- | --- |
| preview (по умолчанию) | — | все CTA ведут на `https://ventorme.ai/register` без атрибуции |
| competition | `PUBLIC_VENTORME_MODE=competition`, `PUBLIC_VENTORME_TEAM_ID=<номер>` | `https://ventorme.ai/register?utm_source=hacknext&utm_campaign=team-<номер>` |

Номер хранится строкой (ведущие нули сохраняются). Скопируйте `.env.example` в `.env` и заполните.

Конкурсный выпуск без номера невозможен: сборка в режиме `competition` без `PUBLIC_VENTORME_TEAM_ID` падает с понятной ошибкой; `npm run check:release` дополнительно отклоняет номер-заглушку (`017`, `XXX`, `TODO` и т.п.) и любую ссылку в HTML, не совпадающую с командной.

Проверенная матрица (реальные запуски): competition+042 → OK; competition+017 → FAIL; competition без номера → сборка падает; preview → OK.

## Структура

```text
src/
  pages/index.astro          # композитор страницы
  layouts/BaseLayout.astro   # HTML-каркас, метаданные, шрифты
  components/                # секции (astro) и острова (tsx)
    CompassScene.tsx         # SVG-компас (hero / selection / result)
    InterestExperience.tsx   # остров подборки: вопросы → результат
    QuestionPanel.tsx, DirectionResults.tsx, DirectionDialog.tsx, SelectionSummary.tsx
    SiteHeader.astro, Hero.astro, VentormeFeatures.astro, RegistrationSteps.astro, Faq.astro, FinalScene.astro, SiteFooter.astro
  config/campaign.ts         # единственный источник URL регистрации
  config/motion.ts           # длительности и кривые движения
  data/questions.ts          # 3 вопроса и их категории
  data/directions.ts         # 10 направлений + примеры для пропуска
  lib/recommend.ts           # детерминированная логика подборки
  lib/session.ts             # sessionStorage (без персональных данных)
  lib/events.ts              # события аналитики (свои, без внешнего SDK)
  styles/tokens.css, global.css
public/fonts/                # Manrope (кириллица+латиница, 44 КБ)
public/images/share-cover.png
scripts/check-release.mjs, screenshots.mjs, make-cover.mjs
tests/                       # vitest
docs/                        # contracts, ownership, progress, qa-report, handoff, research, screenshots
```

## Ключевые решения

- **Astro 7 + React 19 острова**: весь базовый контент и ссылки — в статическом HTML (страница работает без JS), интерактив — два острова (`HeroCompass`, `InterestExperience`).
- **Компас направлений** — SVG/CSS без WebGL: дуги, световое ядро, кликабельные подписи; наклон ≤4° только на точном указателе; пауза вне экрана и при скрытой вкладке; полная статика при reduced motion.
- **Подборка** — прозрачное правило: q1 +2 за категорию, q2 +2; при равенстве честное смешанное сообщение; никаких процентов «совместимости». Полная логика в `src/lib/recommend.ts`, покрыта тестами по всем 225 допустимым комбинациям.
- **Доступность**: настоящие checkbox/radio, fieldset/legend, `<dialog>` с возвратом фокуса, FAQ на `<details>`, skip-link, видимый фокус, reduced motion (системный + переключатель «Уменьшить анимацию»).
- **Аналитика** — опциональные собственные события (`window.__vpEvents`, событие `vp:event`), не блокируют переходы; внешних SDK нет.

## Ограничения интеграции

- Ответы с лендинга **не передаются** в аккаунт Ventorme: API-интеграции нет, тексты это честно отражают.
- Реальный путь онбординга Ventorme командой не проверялся (нужен аккаунт); формулировки нейтральные, см. `docs/handoff.md`.
- Preview-режим не даёт конкурсной атрибуции: без официального номера команды публиковать как конкурсную версию нельзя.
- Подробности проверок — в `docs/qa-report.md`; чек-лист перед сдачей — в `docs/handoff.md`.
