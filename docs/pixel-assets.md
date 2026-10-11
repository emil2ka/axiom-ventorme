# Pixel assets

Использован встроенный ImageGen; CLI/API с пользовательским ключом не использовались. PNG сохранены с исходным альфа-каналом. Контуры персонажа и островов не вырезались по кадрам и не дорисовывались программной обработкой. Отдельные кадры атласа воспроизводятся CSS background-position.

## Карта

`public/map-islands/{direction,university,preparation,funding,application,home}.svg` — прежние пиксельные острова из согласованного светлого концепта, трассированные в SVG. Они сохранены визуально; подвижных деревьев нет.

## Детальные сцены

Файлы: `public/islands/{direction,university,preparation,funding,application}.png`.

Общая спецификация промптов: preserve the pixel-art building, local garden and foreground path from the scene reference; create a complete floating island with jagged slate-blue cliff below the garden; transparent background with clean edges; no sky, distant buildings, UI, labels or people; blue and white Ventorme palette; frontal game perspective; central walkable entrance path. Each scene must keep its distinct architecture.

- Direction: cozy timber workshop, blue roof, compass and signposts.
- University: classical white campus, blue roofs, courtyard, fountain and benches.
- Preparation: asymmetric library tower, clock and glass wing.
- Funding: curved contemporary glass scholarship pavilion.
- Application: low brick admissions/post office, blue striped awning and mailbox.

## Персонаж

Файл: `public/characters/hero-atlas.png`, 1536×1024, 24 ячейки 256×256.

Спецификация промпта: polished pixel-art student matching the reference; textured brown hair, royal-blue jacket, navy trousers, lime backpack; transparent sprite atlas, exact regular 6-column by 4-row grid; consistent identity, proportions and scale; centered figures, feet near baseline; no labels, grid lines, backdrop or shadows. Twenty-four distinct poses in reading order: back idle, three progressively deeper crouches, two push-off poses, rising flight, tucked apex, two descent poses, touchdown, deep landing impact, half recovery, upright recovery, eight back-facing walk frames, two front-facing walk frames.

В коде дополнительно выровнены центры и опорная линия кадров. Полёт, движение камеры, масштаб по глубине и ходьба реализованы кодом; атлас сам по себе не содержит анимацию.
