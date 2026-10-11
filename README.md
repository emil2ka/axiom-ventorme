# Выбери свой путь — «Атлас будущего» (Ventorme × Hacknext 2026)

Интерактивный лендинг команды: школьник выбирает интересы, получает редакционную подборку направлений для знакомства и переходит в Ventorme для регистрации. Визуальная концепция — пять объёмных лент, сходящихся в один узел и расходящихся в возможные пути (Three.js), серебряный материал, лаймовый акцент, типографика Unbounded + Manrope.

> Это проектная страница команды, не официальный сайт Ventorme. Собственной регистрации на лендинге нет: все CTA ведут в Ventorme.

## Быстрый старт

Требуется Node >= 22.12.

```bash
npm install       # установка зависимостей
npm run dev       # локальная разработка (http://localhost:4321)
npm run build     # production-сборка в dist/
npm run preview   # предпросмотр собранной версии
npm test          # 27 автотестов (логика подборки, store, SSR-смоук)
npm run check:release  # проверка выпуска (режим, ссылки, заглушки)
npm run shots     # браузерный сценарий и скриншоты в docs/screenshots
```

## Режимы выпуска (preview / competition)

URL регистрации собирается в единственном месте — `src/config/campaign.ts`.

| Режим | Переменные | Что получается |
| --- | --- | --- |
| preview (по умолчанию) | — | все CTA ведут на `https://ventorme.ai/register` без атрибуции |
| competition | `PUBLIC_VENTORME_MODE=competition`, `PUBLIC_VENTORME_TEAM_ID=<номер>` | `https://ventorme.ai/register?utm_source=hacknext&utm_campaign=team-<номер>` |

Номер — строка (ведущие нули сохраняются). Скопируйте `.env.example` в `.env`. Сборка в competition без номера падает; `check:release` отклоняет заглушки (`017`, `XXX`, `TODO`…). Матрица проверена: 042 → OK, 017 → FAIL, без номера → build FAIL, preview → OK.

## Структура (ключевое)

```text
src/
  components/
    scene/atlasScene.ts        # Three.js: пять лент, морф «путь собран», свет, состояния
    scene/FutureAtlas.tsx      # остров: canvas + SVG-постер + подписи-ветки
    InterestExperience.tsx     # вопросы/результаты/демо/edit (единый остров)
    QuestionPanel.tsx, DirectionResults.tsx, DirectionDialog.tsx, interest/BranchPanel.tsx
    FeatureShowcase.tsx (Ventorme), FaqExperience.tsx, FinalScene.tsx
    Hero.astro, SiteHeader.astro, SiteFooter.astro, RegistrationSteps.astro, RegistrationLink.astro
  lib/journeyStore.ts          # единое состояние (фазы, draft/committed, edit, demo)
  lib/recommend.ts             # детерминированная подборка + объяснения причин
  config/campaign.ts           # единственный источник URL регистрации
  data/questions.ts, data/directions.ts
  styles/tokens.css, global.css
public/fonts/                  # Manrope + Unbounded (OFL, локально)
docs/                          # contracts, redesign-decisions, redesign-review, qa-report, handoff, screenshots
```

## Что важно знать

- **Сцена**: three.js загружается динамическим импортом после простоя; до/вместо WebGL показывается полноценный SVG-постер; reduced motion — статичная поза. Один RAF, пауза вне экрана и скрытой вкладке, DPR ≤2.
- **Состояние**: `initial → q1→q3 → result`; отдельные режимы `demo` (примеры) и `edit` (черновик с отменой/фиксацией); hero-CTA запускает q1 (подпись меняется по фазе); ветки hero работают до и после гидратации; reload восстанавливает черновик, диалог закрыт.
- **Честность**: без процентов совместимости; причины результата строятся по реальным совпадениям категорий; demo честно помечен «Примеры»; ответы не передаются в Ventorme (интеграции нет).
- **Доступность**: настоящие input/fieldset, `<dialog>` с возвратом фокуса, FAQ-индекс/аккордеон, focus-visible, skip-link, reduced motion (системный + ручной переключатель).

## Ограничения

- Публикация и конкурсный номер команды — вне этой сборки (см. `docs/handoff.md`).
- Браузерная проверка выполнена в Chromium headless; реальные устройства — на команде.
- Подробности решений — `docs/redesign-decisions.md`; отчёт проверок — `docs/redesign-review.md`.
