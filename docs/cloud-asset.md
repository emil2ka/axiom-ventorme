# Пиксельные облака

Созданы встроенным image_gen с `transparent_background: true`. Исходный PNG скопирован без обработки и сохраняет alpha. Файл: `public/sky/pixel-cloud-v1.png`. Размер: 2048 × 768.

В рабочую сцену возвращён первоначальный вариант: исходный широкий кластер `pixel-cloud-v1.png` в 12 слоях. Под облаками мягкая голубая подложка заполняет оставшиеся зазоры ближе к середине перехода и полностью скрывает смену сцены. Переход работает в обе стороны. При уменьшенном движении он пропускается.

Три дополнительно сгенерированных варианта (`pixel-cloud-round-v1.png`, `pixel-cloud-wisp-v1.png`, `pixel-cloud-bank-v1.png`) сохранены в `public/sky`, но в переходе не используются. Их промпты: [cloud-variant-prompts.json](cloud-variant-prompts.json).

## Точный промпт

Use case: stylized-concept. Asset type: reusable transparent pixel-art cloud sprite for an interactive blue sky floating-island website. Primary request: ONE beautifully hand-painted, wide billowing cumulus cloud cluster, with several connected large soft puffs and smaller wisps at both ends, floating in side view. Wide landscape composition, cloud fills most of the canvas, fully visible with a small transparent safety margin, no chopped edges. Crisp deliberate staircase pixel silhouette and clustered pixel shading, polished retro RPG pixel art compatible with detailed pixel floating grass islands. Rich rounded volume through large restrained tonal clusters: pale icy blue highlights, powder blue midtones, desaturated medium blue undersides. Soft peaceful daylight. Solid opaque cloud center, clean genuinely transparent area outside silhouette, only slight transparency on sparse outer pixel wisps. This is a standalone game sprite, not a screenshot, not a cloud sheet. Avoid white background, checkerboard drawn into image, sky backdrop, buildings, islands, stars, people, text, outlines, rectangular borders, photorealistic blur, noise, excessive tiny detail, purple or pink colors. The generated alpha must be preserved.
