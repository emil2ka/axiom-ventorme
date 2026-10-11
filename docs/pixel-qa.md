# Pixel landing QA — 2026-10-11

Current entry: `src/components/pixel/UnifiedLanding.tsx`.

- Production build, TypeScript, 27 existing tests and release URL validation passed.
- Desktop viewport: 1280×720. Mobile viewport: 390×844; no horizontal overflow.
- Map uses the previous five SVG islands plus the central home island, white background, one student character.
- Full-motion jump sampled in browser: idle → three crouch poses → push-off → air → fall → landing/recovery. Character element persists and opacity remains 1.
- Back-facing walk cycle uses eight distinct frames; character moves along the path and opens the relevant platform entry panel.
- All five island interiors load distinct PNG assets. Library, pavilion, admissions office and university additionally checked with reduced motion. Each keeps exactly one hero. Reduced-motion entry marker positioning corrected by measuring after the camera transform is painted.
- Returning restores the map and moves the hero to the central island. Full motion restored after QA.
- Old map and detailed scene crossfade in the same camera canvas. This is a blended transition between two illustrations, not a continuous 3D model.
- Environment remains static; no cut-out foliage animation or shading overlay.

Registration opens the official platform. Backend diagnostics, university search and account creation are outside this landing implementation. Preview mode has no competition team attribution until the official team ID is supplied.
