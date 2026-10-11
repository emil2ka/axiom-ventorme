# Axiom / Ventorme — переход внутрь острова за 4 секунды

[Начальный кадр университета](transition-references/university-start.jpg) · [Конечный кадр](transition-references/university-end.jpg) · [Все 10 кадров](transition-references)

## Как использовать

Загрузи пару изображений в генератор видео: `university-start.jpg` — первый кадр, `university-end.jpg` — последний кадр. Выбери длительность 4 секунды, соотношение 16:9 и 30 fps, если эти настройки доступны. Кадры уже очищены от интерфейса; фон и персонаж совпадают с сайтом.

Начальный кадр: герой уже приземлился на выбранный остров. Этот ролик отвечает только за приближение внутрь; прыжок с центрального островка остаётся отдельной анимацией сайта.

## Основной промпт — университет

```text
Create a single continuous 4-second camera journey between the supplied FIRST FRAME and LAST FRAME. Frame 0 must match the first image; the final frame must match the last image precisely.

A compact floating pixel-art university island becomes a full-scale walkable campus courtyard as the camera approaches. Preserve the white stone, royal-blue tiled roofs, green vegetation, warm windows and the same student seen from behind: brown hair, blue jacket, navy trousers, lime backpack. Exactly ONE student remains visible throughout.

0.00–0.35 seconds: briefly hold the complete island and student in the wide starting composition.
0.35–2.75 seconds: smoothly accelerate into a forward camera dolly, gently lowering the viewpoint from the elevated island overview to a view behind the student. The stone path and courtyard expand through coherent perspective. The island's rocky underside moves below the bottom of the frame as we approach ground level. Reveal finer architectural detail gradually. Keep the central entrance aligned. The student grows only because the camera approaches, with feet firmly on the path.
2.75–3.65 seconds: smoothly decelerate into the exact courtyard composition of the last reference image. The campus now fills the frame. The student stands naturally in the foreground facing the entrance.
3.65–4.00 seconds: hold the exact final frame completely stable so the website can continue without a jump.

One uninterrupted, controlled camera move. Consistent polished pixel-art throughout, crisp square pixel clusters, stable silhouettes and coherent geometry. Keep the same clean white / very pale blue background throughout; no new sky or background image. No cuts, fades, dissolves, black frames, vignettes or dark overlays. No text, buttons, cursor, UI or invented logos. No extra people. No architecture melting, transforming into unrelated buildings, texture swimming, flickering edges, camera shake, sudden scale jumps, spinning, disappearing student or sliding feet. The ending is stable, not a looping camera move.

Output: 4 seconds, 16:9, 30 fps, no audio.
```

## Короткий вариант

```text
4-second seamless camera dolly from the supplied pixel-art island first frame into the supplied campus courtyard last frame. Smooth forward movement and gentle lowering to a view behind the single student. Reveal detail through coherent perspective; the rocky underside leaves the frame below. Preserve the blue-white architecture, green vegetation, pixel-art style and student identity: brown hair, blue jacket, navy trousers, lime backpack. Same white background throughout. Keep the student fully visible with planted feet. No cuts, fades, morphing, extra people, UI, text, dark overlays, flicker or camera shake. Ease in and out; hold the exact last frame for the final 0.35 seconds. 4s, 16:9, 30fps, silent.
```

## Другие острова

Для каждого используй одноимённую пару `*-start.jpg` и `*-end.jpg`. В основном промпте меняй описание сцены, остальные требования сохраняй.

| Ключ | Сцена для замены university/campus |
|---|---|
| direction | direction-choice island, timber signposts and blue-roofed gazebo; approach the cozy workshop courtyard |
| preparation | study island with blue-roofed book kiosk and open book; approach the library courtyard and central entrance |
| funding | scholarship island with graduation-cap board and scroll; approach the scholarship pavilion entrance |
| application | admissions island with blue canopy, desk and red mailbox; approach the admissions office entrance |

Маленькие острова — условное представление больших локаций. Проси раскрывать пространство за входной зоной, а не превращать киоск в новое здание прямо на глазах. Для direction/funding/application можно добавить: “Keep the small kiosk as the foreground entry landmark; glide past it to reveal the larger location behind, without visibly morphing the kiosk.”

## Что проверять в результате

- Первый и последний кадры совпадают с референсами по положению входа и героя.
- Герой один и не исчезает; руки, рюкзак и голова не меняются между кадрами.
- Фон остаётся светлым; переход не прячется за затемнением.
- Финальные 0.35 секунды неподвижны, чтобы при подключении ролика не было скачка в сцену сайта.

Готового видео в этом пакете нет: здесь промпт и 10 кадров для твоей генерации. Видео нужно будет подогнать к реальному положению выбранного острова на лендинге; отдельный кадр острова является чистым референсом, а не записью всей карты.
