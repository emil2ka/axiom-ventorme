# Pixel landing QA — 2026-10-11

Current entry: `src/components/pixel/UnifiedLanding.tsx`.

- Production build, TypeScript, 27 existing tests and release URL validation passed.
- Desktop viewport: 1280×720. Mobile viewport: 390×844; no horizontal overflow.
- Map uses five polished PNG islands preserving the approved miniature buildings, plus the central home island, white background, one student character.
- Full-motion jump sampled in browser: idle → three crouch poses → push-off → air → fall → landing/recovery. Character element persists and opacity remains 1.
- Back-facing walk cycle uses eight distinct frames; character moves along the path and opens the relevant platform entry panel.
- All five island interiors load distinct PNG assets. Library, pavilion, admissions office and university additionally checked with reduced motion. Each keeps exactly one hero. Reduced-motion entry marker positioning corrected by measuring after the camera transform is painted.
- Returning restores the map and moves the hero to the central island. Full motion restored after QA.
- Old map and detailed scene crossfade in the same camera canvas. This is a blended transition between two illustrations, not a continuous 3D model.
- Interiors remain static. Whole map islands float subtly; no cut-out foliage animation or shading overlay.

Registration opens the official platform. Backend diagnostics, university search and account creation are outside this landing implementation. Preview mode has no competition team attribution until the official team ID is supplied.

## Whole-island polish update

Five map sprites regenerated from the approved concept with preserved buildings and silhouettes. Opaque parts have clear margins inside each asset. The entire image floats ±3px; no fragments move separately. Home hero ground offset sampled over 24 frames varies by under 0.05px. Motion pauses during jump/zoom, and the hero stays at opacity 1. The old SVG sources remain available. Ten clean start/end video reference frames exported at 1280×720; video generation is left to the user.

Mobile opaque-island bounds checked against the stage and viewport: all five uncut. Minimum horizontal margin 7px, minimum bottom margin 32px. Reduced motion disables floating; full motion restored after verification.

## Environment-only video reference update

All ten video reference frames re-exported without any hero layer. Export page contains one environment image and zero character nodes in each world/view. Main landing character is unchanged. Video prompts explicitly forbid people, avatars and silhouettes throughout.
