import type { CategoryId } from '../../lib/types';

export type Point = { x: number; y: number };

export const CENTER = 380;
export const NODE_R = 348;
export const LABEL_R_PERCENT = 41.5;

export const CATEGORY_ANGLE: Record<CategoryId, number> = {
  technology: -90,
  creativity: -18,
  research: 54,
  people: 126,
  organization: 198,
};

export function polar(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function labelOffsetPercent(angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * LABEL_R_PERCENT,
    y: Math.sin(rad) * LABEL_R_PERCENT,
  };
}

export const ARC_DOTS: Array<[number, number]> = [
  [350, -158],
  [342, -140],
  [352, -116],
  [340, -94],
  [346, -68],
  [336, -44],
  [350, -24],
  [302, 28],
  [294, 52],
  [304, 78],
  [290, 102],
  [298, 126],
  [292, 148],
  [238, -52],
  [245, -30],
  [234, -8],
  [242, 14],
  [236, 36],
  [244, 56],
];
