# Контракт проекта «Выбери свой путь»

Версия: 1.0 (волна 0). Владелец изменений — главный агент. Изменение контракта до реализации согласуется со всеми потребителями.

## 1. Стек и команды

- Astro 7 (SSR-off, статическая сборка) + React-острова (@astrojs/react 7) + motion (Motion for React 14).
- TypeScript strict, стили — обычный CSS (scoped в компонентах + общие токены).
- Node >= 22.12. Установка: `npm install`. Разработка: `npm run dev`. Сборка: `npm run build`. Предпросмотр: `npm run preview`. Тесты: `npm test` (vitest). Проверка выпуска: `npm run check:release`.

## 2. Режимы выпуска (preview / competition)

`src/config/campaign.ts` — единственный источник URL регистрации.

- `PUBLIC_VENTORME_MODE=preview` (по умолчанию): URL = `https://ventorme.ai/register` (без UTM, честный нейтральный preview).
- `PUBLIC_VENTORME_MODE=competition` + `PUBLIC_VENTORME_TEAM_ID=...`: URL = база + `utm_source=hacknext` + `utm_campaign=team-{ID}`. ID — строка, ведущие нули сохраняются.
- Экспорты: `CAMPAIGN_MODE`, `TEAM_ID`, `REGISTRATION_BASE`, `buildRegistrationUrl(mode?, teamId?, base?)`, `registrationUrl()`.
- Никакой компонент не собирает URL самостоятельно. Все CTA используют `registrationUrl()`.

## 3. Категории (5, фиксированы)

`technology | creativity | research | people | organization`

- Ярлыки: Технологии, Творчество, Исследования, Люди, Организация (`src/data/categories.ts`).
- Цвета: technology `#8BA4FF`, creativity `#B79BFF`, research `#85E2C9`, people `#F1C68A`, organization `#F0A6C0`. CSS-токены `--cat-*`.

## 4. Типы

Все общие типы — в `src/lib/types.ts` (CategoryId, CompassMode, CompassSceneProps, GoalId, JourneyStep, InterestOption, ProjectOption, GoalOption, Direction, Answers, RecommendationResult, JourneyState, EventName). Не дублировать типы в компонентах.

## 5. CompassScene (владелец S4)

```ts
type CompassSceneProps = {
  mode: 'hero' | 'selection' | 'result' | 'final';
  selectedCategories: CategoryId[];
  activeCategory?: CategoryId;
  reducedMotion: boolean;
  onInterestSelect?: (category: CategoryId) => void;
  className?: string;
};
```

- Экспорт по умолчанию из `src/components/CompassScene.tsx`. Должен быть SSR-безопасным (без доступа к window на рендере), работать как статическая SVG-композиция без гидратации.
- Подписи интересов — настоящие `<button>` поверх SVG. Без `onInterestSelect` подписи некликабельны, но видны.
- Реакция на указатель только при `pointer: fine` и `!reducedMotion`; наклон <= 4°, смещение света <= 16px; движение не через React state.
- Пауза анимаций вне экрана (IntersectionObserver) и при `document.hidden`.
- `reducedMotion=true`: никакой автоматической анимации, статичная композиция, выбор всё равно подсвечивается.
- mode: hero — 5 подписей; selection — активная категория подсвечена; result — выбранные категории соединены лёгкой линией.

## 6. Состояние подборки (владелец S3)

Шаги: `idle → q1 → q2 → q3 → results`. Возвраты: q(n−1), «Изменить ответы» → q1 с сохранением, «Начать заново» → idle, «Посмотреть примеры без вопросов» → results(skip).

Вопрос 1 — мультивыбор до 2 (`InterestOption`), вопрос 2 — один (`ProjectOption`), вопрос 3 — один (`GoalOption`, не влияет на скоринг).

### Алгоритм рекомендаций (`src/lib/recommend.ts`, чистая функция)

```
scores[cat] = 0
q1: каждая выбранная категория +2
q2: категория выбранного проекта +2
max = максимум scores; topCategories = категории с score == max и > 0
mixed = topCategories.length > 1
score(направление) = сумма scores его категорий
сортировка: score desc, затем фиксированный порядок в data/directions.ts
без mixed: первые 3 по сортировке
с mixed: для каждой topCategory по CATEGORY_ORDER — лучшее направление, содержащее её
         (не дублируя), затем добить по общей сортировке до 3
skip: фиксированный набор generalPicks (3 id) из directions.ts, mixed=false
```

- Никакой случайности. Равенство — честное сообщение «У тебя получилось несколько интересов — можно начать с любого».
- Проценты совместимости не показываются никогда.

### Сессия (владелец — главный агент, `src/lib/session.ts`)

- `saveJourney(state)`, `loadJourney()`, `clearJourney()`, `setPendingCategory(c)`, `takePendingCategory()`.
- Ключи `vp:journey:v1`, `vp:pending-category`; только категории/шаги, без персональных данных; все вызовы в try/catch.
- `saveJourney()` дополнительно диспатчит window-событие `vp:journey` с detail = state. `SelectionSummary` слушает его и читает `loadJourney()` при монтировании.
- Герой: клик по подписи компаса → `setPendingCategory(c)` → скролл к `#interests`. `InterestExperience` при монтировании вызывает `takePendingCategory()` и предвыбирает категорию, начиная с q1.
- Секция подборки: `id="interests"`, заголовок `id="interests-heading"` с `tabindex="-1"` (программный фокус из hero-CTA). Результаты/примеры имеют якорь `id="directions"` и всегда содержательны (в idle — тизер с кнопкой старта и ссылкой на примеры).

## 7. Прогресс и CTA

- Каждый внешний CTA: `<a href={registrationUrl()}>` + `onClick={() => track('registration_click', { placement })}`; никогда не preventDefault; переход происходит сразу.
- Кнопка называется «Зарегистрироваться в Ventorme» (профтест-вариант не используем: путь не проверен командой).
- Под CTA: «Откроется Ventorme. Создай аккаунт и заверши начальную настройку.»

## 8. События (владелец — главный агент, `src/lib/events.ts`)

`track(name, props)` — только `window.__vpEvents` + CustomEvent `vp:event`, без внешних SDK, никогда не бросает и не блокирует. Имена: experience_start, question_complete, experience_complete, experience_skip, direction_open, registration_click, faq_open, motion_reduced. Props: step, placement, category, resultMixed, uiVersion. Без персональных данных.

## 9. Reduced motion

- Системное предпочтение автоматически глушится CSS (global.css) + `MotionConfig reducedMotion="user"` в островах.
- Дополнительное действие «Уменьшить анимацию» в меню: `setManualReducedMotion()` (localStorage `vp:motion`, data-атрибут на `<html>`, событие `vp:motion-pref`).
- Острова читают объединённое предпочтение через `useMotionPreference()` из `src/lib/useMotionPreference.ts`. Сцена получает `reducedMotion` пропом.

## 10. Токены, сетка, брейкпоинты

- Токены: `src/styles/tokens.css` (палитра, радиусы, шкала отступов 4–128, длительности, `--header-h` 76/64).
- Общие классы: `container`, `section`, `section-head`, `eyebrow`, `h1/h2/h3`, `lead`, `micro`, `btn btn--primary/secondary/ghost`, `link-arrow`, `visually-hidden`, `skip-link`.
- Брейкпоинты проверки: 320, 360, 390, 430, 768, 1024, 1440. Контейнер 1240 + gutter clamp(20,5vw,64).
- Секции: padding-block clamp(64px, 9vw, 128px).

## 11. Диалоги и фокус

- Карточка направления — нативный `<dialog>` (showModal), заголовок диалога связан через aria-labelledby, Escape и кнопка «Закрыть» работают, фокус возвращается на карточку-кнопку, body не прокручивается.
- Мобильное меню: закрытие по Escape/вне/Kлику по пункту, возврат фокуса на кнопку меню, `aria-expanded`.
- FAQ — `<details>/<summary>` без JS-зависимости.

## 12. Тексты

Все тексты интерфейса — по разделу B24 ТЗ; формулировки не менять при реализации. Обещания о Ventorme — только согласованные нейтральные; никаких «бесплатно», «за 2 минуты», «через Google» и т.п. без проверки.

## 13. No-JS

Каждая секция обязана иметь осмысленную статическую разметку без JS: hero-текст, все ссылки, FAQ, шаги, сторона. Острова рендерятся серверно (astro SSR on build), поэтому их начальное состояние видно без JS; интерактив заменяется описанием + CTA.

## 14. Владелец общих файлов

`package.json`, lockfile, astro.config.mjs, tsconfig, `src/styles/*`, `src/lib/{types,events,session,useMotionPreference}.ts`, `src/config/*`, `src/data/categories.ts`, `src/layouts/*`, `src/pages/*`, `scripts/*`, `docs/*` — главный агент. Никто другой их не редактирует; запросы — через отчёт.
