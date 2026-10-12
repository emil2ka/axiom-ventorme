# Island clarity and character motion

Generated with built-in ImageGen. All selected PNG files retain native alpha transparency. The approved small map sprites remain in use. The large scenes were restored with clearer edges; the library is deliberately more modest. Images guided generation; no raster asset was manually cut or repainted.

## Character extension — front idle, greeting and profile jump

Asset: `public/characters/hero-front-side.png`

```text
Use case: stylized-concept
Asset type: production pixel-art character animation sprite sheet, genuinely transparent background.
Create a matching extension to the reference character atlas. Same young male traveler: thick tousled brown hair, bright blue eyes, cobalt blue open jacket over white shirt, dark navy jeans, black sneakers with white soles, vivid lime-green backpack with matching lime straps visible from the front. Preserve EXACT character identity, pixel shading, proportions and crisp pixel-cluster style. Reference atlas is identity/style only, do NOT copy its background or existing layout.

Output square sprite sheet 1536 x 1536, EXACTLY 4 columns by 4 rows = sixteen equally sized 384x384 cells, no grid lines or text. ONE character per cell, no other artwork. Every character centered around x192 inside its cell; standing feet y340, maximum full standing height ~285px, consistent scale and plenty of transparent margins. Character fills most of cell height. Same ground baseline for all grounded poses. Actual real alpha transparency throughout background, no background color, gradient, shadow, haze, outline rectangle or checkerboard.

Rows and cells, left-to-right:
ROW 1 (FRONT idle sequence): 0 front standing relaxed both feet down; 1 front slight breathing lift shoulders; 2 front calm blink both eyes closed; 3 front standing small friendly smile. All four face directly at viewer, hands down, same baseline.
ROW 2 (FRONT greeting sequence): 4 front raises right hand beside head; 5 front hand fully raised open palm waving; 6 front bends wrist to wave; 7 front lowers hand halfway back to idle. No face turns, feet stay planted.
ROW 3 (STRICT RIGHT-FACING PROFILE jump): 8 side standing turns right, face nose visible to right, backpack behind to LEFT; 9 side deep crouch bent knees and hips, head lowered but same feet baseline; 10 side explosive push up, arms forward/up, legs stretching; 11 side airborne ascending, both knees tucked, arms forward. ALL characters in this row face RIGHT. Genuine side silhouette, not rear view.
ROW 4 (STRICT RIGHT-FACING PROFILE jump continued): 12 side at apex knees tucked; 13 side descending feet extend below body arms out for balance; 14 side initial landing feet firmly on y340, crouched to absorb impact; 15 side recovering half-crouch, feet on same baseline. ALL face RIGHT with backpack behind body to LEFT. Flight frames should be positioned as though feet baseline y340 too: animation flight height is supplied in code, do not make atlas cell character drift upward.

Constraints: no detached limbs, no identity/clothing changes, no extra sprites, exactly sixteen cells, no labels, no UI. Crisp polished detailed pixel art consistent across all frames. Correct anatomically readable 2D poses; front views show face and both backpack straps, side views show profile and backpack behind.
```

## Front-facing jump

Asset: `public/characters/hero-front-jump.png`

```text
Use case: stylized-concept
Production PIXEL ART animation sprite atlas, a matching extension to the supplied character reference. EXACTLY the same brown-haired blue-eyed young male traveler, cobalt jacket over white shirt, lime backpack straps, navy jeans, black white-soled shoes, same anatomy, pixel clusters and shading. Render FRONT VIEW ONLY, facing straight at camera across ALL eight frames, face visible (never side or back). Original source background is transparent, preserve genuine alpha.
Landscape sheet, exactly 4 columns x2 rows, eight equally sized square cells, ONE full-body character per cell, NO borders, labels, grid, background, ground shadows or checkerboard. Frame margins keep every limb within its own cell. Same character scale as reference: max standing height~90% of a cell, planted feet~96% of cell height, centered~50%.
Sequence left to right:
Row1: 0 front mild knee bend preparing; 1 front deep crouch arms behind to gather force; 2 front push-off legs extending arms rising; 3 front rising airborne arms up both knees tucked.
Row2: 4 front apex legs tucked arms balanced; 5 front descending legs stretched down, arms to sides; 6 front deep landing squat knees bent feet firmly same baseline; 7 front recovering half-crouch returning to standing.
Do not position flying frames high inside cell: locomotion in world is handled in code. Keep reference foot baseline consistent for every frame so game anchor does not jitter. All visible front-facing face, same character proportions, no extra artwork. Actual transparent PNG.
```

## direction

Selected asset: `public/islands/direction-refined.png`

```text
Use case: precise-object-edit
High-resolution faithful restoration of the attached transparent direction island illustration for a website close-up.
Preserve EXACTLY the existing composition, architecture, number of buildings, roof profiles, central entrance, signs, banners, benches and gardens, foreground path, floating rock base, color palette, camera perspective and pixel-art illustration style. Do not add any object, extra ornament or more buildings.
Improve ONLY clarity and rendering fidelity: cleaner architectural edges, readable existing window frames and stairs, precise roof-tile shapes, less muddy or blurred existing texture, consistent fine pixel clusters, carefully resolved foliage and rock shading. Keep existing detail density, no micro-texture noise, no excessive outlines, no oversharpening halos, no photorealism or style change.
Output the full entire island with alpha transparency and comfortable unchanged margins, landscape 16:9. Request a true high-resolution 3840x2160 output if available, not just an enlarged low-resolution look. Preserve original geometric proportions and central entrance alignment exactly so it can replace the current image and serve as the last frame for a video transition.
No people, character, text, UI, background, sky, shadows outside the sprite, baked checkerboard, vignette, additional rocks or foliage. Exactly the same scene, restored more cleanly.
```

## university

Selected asset: `public/islands/university-refined.png`

```text
Use case: precise-object-edit
High-resolution faithful restoration of the attached transparent university island illustration for a website close-up.
Preserve EXACTLY the existing composition, architecture, number of buildings, shape of dome and roofs, central blue entrance, flags, banners, fountain, benches, gardens, foreground path, floating rock base, color palette, camera perspective and pixel-art illustration style. Do not add any object, extra ornament or more buildings.
Improve ONLY clarity and rendering fidelity: cleaner architectural edges, readable existing window frames and stairs, precise roof-tile shapes, less muddy or blurred existing texture, consistent fine pixel clusters, carefully resolved foliage and rock shading. Keep existing detail density, no micro-texture noise, no excessive outlines, no oversharpening halos, no photorealism or style change.
Output the full entire island with alpha transparency and comfortable unchanged margins, landscape 16:9. Request a true high-resolution 3840x2160 output if available, not just an enlarged low-resolution look. Preserve original geometric proportions and central entrance alignment exactly so it can replace the current image and serve as the last frame for a video transition.
No people, character, text, UI, background, sky, shadows outside the sprite, baked checkerboard, vignette, additional rocks or foliage. Exactly the same scene, restored more cleanly.
```

## funding

Selected asset: `public/islands/funding-refined.png`

```text
Use case: precise-object-edit
High-resolution faithful restoration of the attached transparent funding island illustration for a website close-up.
Preserve EXACTLY the existing composition, architecture, number of buildings, roof profiles, central entrance, signs, banners, benches and gardens, foreground path, floating rock base, color palette, camera perspective and pixel-art illustration style. Do not add any object, extra ornament or more buildings.
Improve ONLY clarity and rendering fidelity: cleaner architectural edges, readable existing window frames and stairs, precise roof-tile shapes, less muddy or blurred existing texture, consistent fine pixel clusters, carefully resolved foliage and rock shading. Keep existing detail density, no micro-texture noise, no excessive outlines, no oversharpening halos, no photorealism or style change.
Output the full entire island with alpha transparency and comfortable unchanged margins, landscape 16:9. Request a true high-resolution 3840x2160 output if available, not just an enlarged low-resolution look. Preserve original geometric proportions and central entrance alignment exactly so it can replace the current image and serve as the last frame for a video transition.
No people, character, text, UI, background, sky, shadows outside the sprite, baked checkerboard, vignette, additional rocks or foliage. Exactly the same scene, restored more cleanly.
```

## application

Selected asset: `public/islands/application-refined.png`

```text
Use case: precise-object-edit
High-resolution faithful restoration of the attached transparent application island illustration for a website close-up.
Preserve EXACTLY the existing composition, architecture, number of buildings, roof profiles, central entrance, signs, banners, benches and gardens, foreground path, floating rock base, color palette, camera perspective and pixel-art illustration style. Do not add any object, extra ornament or more buildings.
Improve ONLY clarity and rendering fidelity: cleaner architectural edges, readable existing window frames and stairs, precise roof-tile shapes, less muddy or blurred existing texture, consistent fine pixel clusters, carefully resolved foliage and rock shading. Keep existing detail density, no micro-texture noise, no excessive outlines, no oversharpening halos, no photorealism or style change.
Output the full entire island with alpha transparency and comfortable unchanged margins, landscape 16:9. Request a true high-resolution 3840x2160 output if available, not just an enlarged low-resolution look. Preserve original geometric proportions and central entrance alignment exactly so it can replace the current image and serve as the last frame for a video transition.
No people, character, text, UI, background, sky, shadows outside the sprite, baked checkerboard, vignette, additional rocks or foliage. Exactly the same scene, restored more cleanly.
```

## Simplified library

Selected asset: `public/islands/preparation-refined.png`

```text
Create the simpler library island for an existing polished pixel-art educational website. Image 1 is QUALITY / palette / pixel rendering reference only. Image 2 is SIMPLE ARCHITECTURAL composition reference. A modest beautiful one-to-two-storey white-stone and warm timber library, blue tiled gable roof, open-book emblem above a central wooden entrance at x50 y55 percent, a short paved path running to x50 y70, small book shelves visible in windows, a bench and one reading desk, two leafy trees at sides, restrained flowers. No tall tower, no clock tower, no glass annex, no palace, no excessive ivy/props. Keep the detailed but clean fine pixel craftsmanship of Image 1 rather than the coarse blocks of Image 2. Landscape 16:9 entire floating island with blue-grey faceted stone cliff and bright grass, not cropped. Single coherent island centered, airy balanced composition, no background/sky, true transparent alpha, no humans, no interface, no text or watermark. High clarity distinct roof tiles windows paving edges, avoid overdecorating.
```
