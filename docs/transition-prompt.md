# Axiom / Ventorme — переход внутрь острова за 4 секунды, БЕЗ ПЕРСОНАЖЕЙ

[Начальный кадр](transition-references/university-start.jpg) · [Конечный кадр](transition-references/university-end.jpg) · [Все 10 кадров без людей](transition-references)

## Как использовать

Загрузи обновлённую пару изображений: `university-start.jpg` — первый кадр, `university-end.jpg` — последний. В этих кадрах нет человечка. Старые референсы с героем нужно заменить, иначе генератор может снова добавить его даже при исправленном промпте.

Длительность: 4 секунды. Формат: 16:9, 30 fps, если эти настройки доступны. Видео содержит только остров, здания и окружение. Персонаж сайта отрисовывается отдельно кодом и в видеогенерацию не входит.

## Основной промпт — университет

```text
Create a single continuous 4-second camera journey between the supplied FIRST FRAME and LAST FRAME. Frame 0 must match the first image; the final frame must match the last image precisely.

ENVIRONMENT ONLY. The island and courtyard must be completely uninhabited throughout every frame. Do not generate any people, students, characters, avatars, human silhouettes, faces, creatures or moving figures anywhere, even briefly or in the distance.

A compact floating pixel-art university island becomes a full-scale campus courtyard as the camera approaches. Preserve the white stone, royal-blue tiled roofs, green vegetation and warm windows from the references.

0.00–0.35 seconds: briefly hold the complete empty island in the wide starting composition.
0.35–2.75 seconds: smoothly accelerate into a forward camera dolly, gently lowering the viewpoint from the elevated island overview to a ground-level view along the empty central path. The stone path and courtyard expand through coherent perspective. The island's rocky underside moves below the bottom of the frame as the camera approaches ground level. Reveal finer architectural detail gradually. Keep the central entrance aligned. Do not add any person to lead or follow the camera.
2.75–3.65 seconds: smoothly decelerate into the exact empty courtyard composition of the last reference image. The campus fills the frame, with the central path completely clear.
3.65–4.00 seconds: hold the exact final frame completely stable so the website can continue without a jump.

One uninterrupted, controlled camera move. Consistent polished pixel-art throughout, crisp square pixel clusters, stable silhouettes and coherent geometry. Keep the same clean white / very pale blue background throughout; no new sky or background image. No cuts, fades, dissolves, black frames, vignettes or dark overlays. No text, buttons, cursor, UI or invented logos. No architecture melting, transforming into unrelated buildings, texture swimming, flickering edges, camera shake, sudden scale jumps or spinning. The ending is stable, not a looping camera move. All visible space remains empty of people and characters.

Output: 4 seconds, 16:9, 30 fps, no audio.
```

## Короткий вариант

```text
4-second seamless camera dolly from the supplied empty pixel-art island first frame into the supplied empty campus courtyard last frame. Environment only: absolutely no people, characters, students, avatars, silhouettes, faces or creatures at any time. Smooth forward movement and gentle lowering to ground level along the empty path. Reveal detail through coherent perspective; the rocky underside leaves the frame below. Preserve blue-white architecture, green vegetation and pixel-art style. Same white background throughout. No cuts, fades, morphing, UI, text, dark overlays, flicker or camera shake. Ease in and out; hold the exact empty last frame for the final 0.35 seconds. 4s, 16:9, 30fps, silent.
```

## Negative prompt, если есть отдельное поле

```text
person, people, student, human, character, avatar, protagonist, silhouette, face, creature, crowd, walking figure, running figure, appearing figure, UI, text, cursor, black frame, fade, dissolve, vignette, camera shake, flicker, melting buildings, texture swimming
```

## Другие острова

Используй одноимённые пары `*-start.jpg` и `*-end.jpg`. В основном промпте меняй описание сцены; запрет на людей и персонажей оставляй без изменений.

| Ключ | Сцена для замены university/campus |
|---|---|
| direction | empty direction-choice island, timber signposts and blue-roofed gazebo; approach the empty cozy workshop courtyard |
| preparation | empty study island with blue-roofed book kiosk and open book; approach the empty library courtyard and central entrance |
| funding | empty scholarship island with graduation-cap board and scroll; approach the empty scholarship pavilion entrance |
| application | empty admissions island with blue canopy, desk and red mailbox; approach the empty admissions office entrance |

Для direction/funding/application можно добавить: “Keep the small kiosk as the foreground entry landmark; glide past it to reveal the larger location behind, without visibly morphing the kiosk.”

## Проверка результата

- Никаких людей и персонажей ни в одном кадре, включая фон, окна и последние секунды.
- Первый и последний кадры совпадают с референсами по положению входа и окружения.
- Фон остаётся светлым; переход не скрыт затемнением.
- Финальные 0.35 секунды неподвижны.

В пакете промпт и 10 обновлённых кадров без персонажей. Готовое видео здесь не генерировалось. Ролик нужно подогнать к реальному положению острова на карте сайта; сам игровой герой остаётся отдельным анимированным слоем.
