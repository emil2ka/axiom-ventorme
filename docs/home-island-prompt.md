# Стартовый остров

Создан встроенным ImageGen с прозрачным фоном. Референсы стиля: существующие `university-polished.png` и `preparation-polished.png`. Скриншот старой стартовой площадки использован только как референс назначения и компактной композиции.

Итоговый ассет: `public/map-islands/home-polished.png`. Персонаж остаётся отдельным анимированным спрайтом. Исходный `home.svg` сохранён.

## Промпт

```text
Use case: stylized-concept
Asset type: transparent pixel-art sprite for the small central starting island in an interactive island map.
Primary request: Create ONE small neutral starting platform, visually belonging to the exact same pixel-art world as references 2 and 3. Reference 1 shows the existing crude starting platform: use its compact simple purpose, but completely improve its pixel art. DO NOT include its character.
Input images: Image 1 composition/function only; images 2 and 3 authoritative style, grass, rocks, lighting and pixel rendering references. Do not reproduce their buildings.
Subject: small floating grassy island with a faceted blue-gray rock underside tapering to an irregular point. A clean pale-stone circular standing pad at the center, large enough for a separately animated character. A short blue direction signpost at the rear-left of the pad, one very small shrub and a few tiny white flowers at the edges. Simple readable small-island silhouette, no buildings and no large tree.
Style/medium: polished crisp pixel art, the same fine square pixel clusters and detailed luminous lime-green grass rim, cool faceted cliff shading and cobalt accents as the reference university and library sprites. Avoid blurry oversized pixels and smooth vector/3D art.
Composition/framing: square canvas, centered entire island with transparent padding on all sides, 3/4 elevated frontal perspective matching the reference sprites. All of the standing pad visible and empty. Keep decorative objects away from its middle. Compact grass platform, modest cliff height. Clear silhouette at 130px display width.
Lighting/mood: soft bright daylight, cool-blue shadows, friendly.
Constraints: genuine transparent alpha background; no sky, no backdrop, no checkerboard baked in, no ground shadow outside sprite, no text, no UI, no humans or animals, no separated flying debris. No frame clipping. One island only.
```
