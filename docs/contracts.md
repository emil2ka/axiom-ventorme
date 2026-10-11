# Контракт проекта «Атлас будущего» (v2)

Версия: 2.0 (редизайн). Владелец изменений — главный агент. Изменение контракта сначала согласуется со всеми потребителями.

## 1. Стек и команды

- Astro 7 (static) + React 19 острова + motion + Three.js (сцена) + vitest.
- Node >= 22.12. `npm install` / `npm run dev` / `npm run build` / `npm run preview` / `npm test` / `npm run check:release` / `npm run shots`.

## 2. Режимы выпуска

`src/config/campaign.ts` — единственный источник URL регистрации. preview (по умолчанию) → `https://ventorme.ai/register`; competition (`PUBLIC_VENTORME_MODE=competition` + `PUBLIC_VENTORME_TEAM_ID`) → +`utm_source=hacknext`, `utm_campaign=team-<ID>`. Все CTA используют `registrationUrl()`; сборка в competition без номера падает; `check:release` отклоняет заглушки и несовпадающие HTML-ссылки.

## 3. Единое состояние — `src/lib/journeyStore.ts`

Фазы: `initial | questions | result | demo`; шагы: `q1|q2|q3`; режим `first | edit`.

```ts
type JourneyState = {
  version: 2; phase; step; mode;
  draft: Answers;        // текущие ответы (в edit — черновик)
  committed: Answers;    // подтверждённые ответы результата
  resultIds: string[] | null; resultMode: 'personal' | 'demo' | null;
  mixed: boolean;
  openedDirectionId: string | null;   // не персистится
  requestedCategory: CategoryId | null;
  previewCategory: CategoryId | null; // не персистится
};
```

Действия (`dispatchJourney`): `start`, `branchSelect`, `previewCategory`, `toggleInterest`, `clearRequested`, `selectProject`, `selectGoal`, `next`, `back`, `finish`, `openDemo`, `answerFromDemo`, `edit`, `commitEdit`, `cancelEdit`, `restart`, `openDetail`, `closeDetail`.

Инварианты:

- `q1|q2|q3` шаг переключается только при валидном выборе; `next` в edit на q3 = «Обновить подборку» (commit).
- Ветка героя (`branchSelect`): initial → добавляет интерес и открывает q1; questions/first → правит черновик, при двух выбранных ставит `requestedCategory`; result/demo → вход в edit с черновиком = committed (при двух — `requestedCategory`, данные не меняются).
- Demo: `resultIds = generalPicks`, `resultMode='demo'`, активные категории сцены пусты, персональные причины не показываются.
- `cancelEdit` возвращает фазу result/demo, `commitEdit` атомарно фиксирует черновик и пересчитывает результат.
- `restart` очищает всё, включая хранилище.
- Персист: ключ `vp:journey:v2`, только данные (без диалога/превью); при загрузке проходит `sanitize()`; битый JSON → initial. Доступ к storage только через `src/lib/storage.ts` (try/catch).
- События (`src/lib/events.ts`): experience_start, question_complete, experience_complete, experience_skip, direction_open, registration_click, faq_open, features_tab_open, motion_reduced, hero_branch. Без персональных данных.

## 4. Сцена — `src/components/scene/`

- `atlasScene.ts` — Three.js: `createAtlasScene(canvas) → AtlasHandle | null`; handle: `setState(SceneState)`, `setPointer(x,y)`, `setScroll(progress)`, `resize()`, `isStatic()`, `dispose()`.
- `FutureAtlas.tsx` — React-остров: canvas + SVG-постер + пять подписей-кнопок; подписки на store; динамический импорт сцены после idle; постер виден до/вместо WebGL.
- `SceneState`: `{ phase, resultMode, activeCategories, previewCategory, routeProgress, motion: 'full'|'reduced'|'static' }`.
- Подписи: `aria-pressed`, `aria-label «X — выбрать интерес»`; hover/focus → `previewCategory` (без изменения данных), клик → `branchSelect`.
- Производительность: один RAF; пауза вне экрана/скрытой вкладке; DPR ≤2 (мобильный ≤1.6); всё освобождается в `dispose()`/cleanup.

## 5. Результаты и причины

`src/lib/recommend.ts`: `recommendResults(answers)` (детерминированно, без процентов), `selectedCategories(answers)`, `explainResults(answers, result)` → причина по реальному пересечению категорий («Связано с твоим интересом: …»); при отсутствии пересечения — «Дополнительный вариант» (в текущей логике недостижимо, резерв честности).

Обзор карточки: название, причина, одна строка «Что можно делать: tasks[0]», «Подробнее». Полные tasks/tryNow/nextStep — в диалоге. Порядок блоков диалога зависит от цели q3 и совпадает с порядком в карточке.

## 6. Якоря и навигация

Шапка: «Исследовать» (#interests), «Возможности Ventorme» (#ventorme), «Как начать» (#steps), «Вопросы» (#faq) + CTA «Открыть Ventorme». Дополнительно: `#directions` (зона подборки/результатов), `#final`. Секции имеют scroll-margin-top. Заголовки шагов получают фокус после перехода (preventScroll + минимальный скролл при перекрытии).

## 7. Типографика, палитра, сетка

- Шрифты: Unbounded — .h1/.h2 (display), Manrope — текст и UI; локальные WOFF2, preload в BaseLayout.
- Токены: `src/styles/tokens.css` (палитра серебро/лайм, радиусы, шкала, длительности). Акцент `--accent` — только состояния/действия; категорийные оттенки `--cat-*` — кромки и метки.
- Контейнер 1280px, брейкпоинты проверки: 320, 360, 390, 430, 768, 1024, 1280, 1440. Проживание секций: clamp-отступы.

## 8. Доступность и no-JS

- Настоящие input в fieldset/legend; `<dialog>` с Escape/возвратом фокуса; FAQ — details (мобильный) / индекс-панель (desktop, агентом); focus-visible глобальный (лаймовый).
- Reduced motion: системный + переключатель «Уменьшить анимацию» (localStorage `vp:motion` → data-атрибут); сцена получает `motion: 'reduced'`/`'static'`.
- No-JS: текст, ссылки, FAQ, шаги и **SVG-постер сцены** присутствуют в HTML; интерактив заменён статикой без пустых контейнеров.

## 9. Владельцы файлов

`package.json`, lockfile, конфиги, `src/styles/*`, `src/lib/{types,recommend,journeyStore,storage,events,motionPref,useMotionPreference}.ts`, `src/config/*`, `src/pages/*`, `src/layouts/*`, `scripts/*`, `docs/*`, `public/*` — главный агент. Секции Interest/Scene/Final — главный агент; FeatureShowcase/faq — по назначению. Никто не редактирует чужие файлы без запроса интегратору.
