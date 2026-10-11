# Light island artwork

The static architecture and island terrain are SVG pixel contours traced from the white/blue concept approved in this conversation. The SVGs contain only geometry; no raster image is embedded. Near-white backdrop pixels are excluded and the single character is removed from the starting island.

The page does not move fragments of the traced foliage. Those layers form the stationary illustration behind the animated foreground, so moving branches do not expose missing background.

Moving foreground branches and the university flag are authored SVG shapes in `../../scenery.tsx`. The only player is authored pixel geometry in `../../islands.ts`. These parts have transparent surroundings and contain no sampled bitmap background. The matching original flag is excluded from the campus illustration.

The synthetic cube stones were removed. Remaining small stone details belong to the approved static illustration. Whole islands float subtly; branches and flag move independently. Reduced-motion disables those animations.

The image-generated campus interior is still a concept and is not connected to this landing.
