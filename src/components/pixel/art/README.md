# Pixel vectors

These SVGs are traced from the AI-generated visual concept approved in this conversation. They are not claimed to be hand-painted original illustrations.

The backdrop and interface were excluded by explicit object outlines. The image colours were quantized to 192 colours; pixels are stored as coloured SVG path runs. No raster image or data URI is embedded.

Named groups:

- `terrain`: island surface and stone underside;
- `landmark`: upper architecture and flora;
- `warm-light`: warm highlights with subtle opacity animation.

`traveller.svg` contains the independently movable back-facing character. All stationary people were removed from career, campus, study and mail scenes. Their background areas were reconstructed using neighbouring scene colours. The page renders just one independently movable protagonist. The small starting island is hand-built SVG geometry in PixelLanding.tsx.

The grouping is suitable for whole-scene movement and light animation. The university door halves and flag have separate named groups for animation. Further detailed animation of branches or roof pieces would require additional separation or newly drawn parts. Scaling preserves the existing pixel detail; it does not reveal additional unseen geometry.
