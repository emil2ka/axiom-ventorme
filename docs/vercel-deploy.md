# Vercel: выпуск Axiom (Ventorme)

Проект готов к импорту репозитория `emil2ka/axiom-ventorme`, ветка `main`.

## Публикация

1. Открой https://vercel.com/new и импортируй репозиторий `axiom-ventorme`.
2. Root Directory оставь в корне репозитория. Framework Preset — Astro.
3. Нажми Deploy. Команда сборки, установки и каталог публикации уже заданы в `vercel.json`.

Настройки:

| Параметр | Значение |
| --- | --- |
| Node.js | 22.x, закреплён в `package.json` |
| Install Command | `npm ci` |
| Build Command | `PUBLIC_VENTORME_MODE=competition PUBLIC_VENTORME_TEAM_ID=106 npm run build:release` |
| Output Directory | `dist` |
| Rendering | Static |

Для текущего конкурсного выпуска не нужно вручную заводить переменные окружения: публичные `competition` и `106` заданы в команде сборки. Это не секреты. База регистрации по умолчанию — `https://ventorme.ai/register`. Локальные `.env` исключены из Git и загрузки через CLI; никаких токенов для работы страницы не требуется.

`build:release` сначала запускает `astro sync`, чтобы создать типы Astro и Vite в чистой среде, затем проверяет TypeScript, собирает сайт, затем проверяет ссылки в готовом `dist`. Ошибка атрибуции или отсутствие регистрационной ссылки останавливает выпуск. Ожидаемая ссылка: `https://ventorme.ai/register?utm_source=hacknext&utm_campaign=team-106`.

Адаптер Vercel и серверные функции не нужны: обе страницы статические. Файлы `/_astro/` имеют хеши и длительный кеш; рисунки и шрифты получают отдельные правила кеширования. `.vercel/` с привязкой аккаунта остаётся локальным.

## Проверка до публикации

```sh
npm ci
PUBLIC_VENTORME_MODE=competition PUBLIC_VENTORME_TEAM_ID=106 npm run build:release
npm run check:types
npm test
npm run preview -- --host 127.0.0.1 --port 4322
```

Открой `http://127.0.0.1:4322/` и пройди весь путь. Проверь возврат героя, повтор пути и ссылку на Ventorme. Кеширующие HTTP-заголовки Vercel проверяются уже после публикации: локальный Astro preview не читает `vercel.json`.

Выполнена чистая установка в отдельном каталоге без локального `.env` и сборка точной командой из `vercel.json`. Фактическая публикация в аккаунте Vercel в эту задачу не входила.

Официальная документация: https://docs.astro.build/en/guides/deploy/vercel/ и https://vercel.com/docs/functions/runtimes/node-js/node-js-versions.

Важно для CI: `.astro/` не хранится в Git. Запускай проверку типов через `npm run check:types`, чтобы генерация типов выполнялась перед `tsc`. Проверено в свежем архиве Git после `npm ci`, без предварительной сборки, `.astro/` и `.env`.
