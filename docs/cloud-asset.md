# Пиксельные облака

Созданы встроенным image_gen с `transparent_background: true`. Исходный PNG скопирован без обработки и сохраняет alpha. Файл: `public/sky/pixel-cloud-v1.png`. Размер: 2048 × 768.

Один исходный кластер используется в 12 слоях с разным положением, масштабом и отражением. Слои распределены по четырём горизонтальным уровням экрана. Под ними Canvas гарантирует полное перекрытие при смене сцены. При уменьшенном движении переход пропускается.

## Точный промпт

Use case: stylized-concept. Asset type: reusable transparent pixel-art cloud sprite for an interactive blue sky floating-island website. Primary request: ONE beautifully hand-painted, wide billowing cumulus cloud cluster, with several connected large soft puffs and smaller wisps at both ends, floating in side view. Wide landscape composition, cloud fills most of the canvas, fully visible with a small transparent safety margin, no chopped edges. Crisp deliberate staircase pixel silhouette and clustered pixel shading, polished retro RPG pixel art compatible with detailed pixel floating grass islands. Rich rounded volume through large restrained tonal clusters: pale icy blue highlights, powder blue midtones, desaturated medium blue undersides. Soft peaceful daylight. Solid opaque cloud center, clean genuinely transparent area outside silhouette, only slight transparency on sparse outer pixel wisps. This is a standalone game sprite, not a screenshot, not a cloud sheet. Avoid white background, checkerboard drawn into image, sky backdrop, buildings, islands, stars, people, text, outlines, rectangular borders, photorealistic blur, noise, excessive tiny detail, purple or pink colors. The generated alpha must be preserved.
