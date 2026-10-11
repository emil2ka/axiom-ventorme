# Карта владения файлами (волна 1)

Главный агент (интегратор):
- `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`
- `src/styles/tokens.css`, `src/styles/global.css`
- `src/lib/types.ts`, `src/lib/events.ts`, `src/lib/session.ts`, `src/lib/useMotionPreference.ts`
- `src/config/campaign.ts`, `src/config/motion.ts`
- `src/data/categories.ts`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro` (композитор)
- `public/favicon.svg`, `public/fonts/*`, `public/images/*`
- `scripts/check-release.mjs`, `scripts/screenshots.mjs`
- `tests/campaign.test.ts` (позже)
- `docs/*`

S2 (оболочка и статические секции) — писать только сюда:
- `src/components/SiteHeader.astro`
- `src/components/Hero.astro`
- `src/components/hero/HeroCompass.tsx`
- `src/components/VentormeFeatures.astro`
- `src/components/RegistrationSteps.astro`
- `src/components/Faq.astro`
- `src/components/FinalScene.astro`
- `src/components/RegistrationLink.astro`
- `src/components/SiteFooter.astro`

S3 (подборка и данные) — писать только сюда:
- `src/components/InterestExperience.tsx`
- `src/components/QuestionPanel.tsx`
- `src/components/DirectionResults.tsx`
- `src/components/DirectionDialog.tsx`
- `src/components/SelectionSummary.tsx`
- `src/components/interest/*` (локальные стили/вспомогательные файлы при необходимости)
- `src/data/questions.ts`
- `src/data/directions.ts`
- `src/lib/recommend.ts`
- `tests/recommend.test.ts`

S4 (компас и движение):
- `src/components/CompassScene.tsx`
- `src/components/compass/*` (локальные стили/хелперы)

Правила:
1. Один файл — один владелец в момент записи. Не редактировать чужие файлы даже «чуть-чуть» — вернуть запрос интегратору.
2. Никто, кроме главного агента, не трогает `package.json`/lockfile, не запускает `npm install`, не делает git-операций, не запускает `npm run build` (сборка — только интегратор; параллельные сборки конфликтуют в dist/).
3. Локальные стили — только в собственных компонентах (Astro scoped styles или CSS-модули/className-префиксы у React). Никаких глобальных селекторов.
4. Изменение контракта (`docs/contracts.md`, `src/lib/types.ts`) — только через запрос главному агенту.
5. Импортировать общие модули (`campaign`, `events`, `session`, `types`, `categories`, `motion`) можно только в том виде, как они есть. Не переименовывать экспорты.
6. Аудиторы (S5, S6) — read-only, никаких правок.
