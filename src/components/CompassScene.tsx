import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import type { CategoryId, CompassSceneProps } from '../lib/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '../data/categories';
import {
  ARC_DOTS,
  CATEGORY_ANGLE,
  CENTER,
  NODE_R,
  arcPath,
  labelOffsetPercent,
  polar,
} from './compass/geometry';
import './compass/compass.css';

const TILT_MAX_DEG = 4;
const LIGHT_MAX_PX = 16;

function routePathFor(selected: Set<CategoryId>): string {
  const cats = CATEGORY_ORDER.filter((category) => selected.has(category));
  if (cats.length < 2) return '';
  const points = cats.map((category) => ({
    angle: CATEGORY_ANGLE[category],
    point: polar(CENTER, CENTER, NODE_R, CATEGORY_ANGLE[category]),
  }));
  let d = `M ${points[0].point.x.toFixed(2)} ${points[0].point.y.toFixed(2)}`;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    let diff = to.angle - from.angle;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    const midAngle = from.angle + diff / 2;
    const control = polar(CENTER, CENTER, 205, midAngle);
    d += ` Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${to.point.x.toFixed(2)} ${to.point.y.toFixed(2)}`;
  }
  return d;
}

export default function CompassScene({
  mode,
  selectedCategories,
  activeCategory,
  reducedMotion,
  onInterestSelect,
  className,
}: CompassSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    if (reducedMotion) {
      stage.style.removeProperty('--vp-tilt-x');
      stage.style.removeProperty('--vp-tilt-y');
      root.style.removeProperty('--vp-px');
      root.style.removeProperty('--vp-py');
      return;
    }
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    let raf = 0;
    let curTiltX = 0;
    let curTiltY = 0;
    let curLightX = 0;
    let curLightY = 0;
    let tgtTiltX = 0;
    let tgtTiltY = 0;
    let tgtLightX = 0;
    let tgtLightY = 0;

    const tick = () => {
      raf = 0;
      curTiltX += (tgtTiltX - curTiltX) * 0.09;
      curTiltY += (tgtTiltY - curTiltY) * 0.09;
      curLightX += (tgtLightX - curLightX) * 0.09;
      curLightY += (tgtLightY - curLightY) * 0.09;
      stage.style.setProperty('--vp-tilt-x', `${curTiltX.toFixed(3)}deg`);
      stage.style.setProperty('--vp-tilt-y', `${curTiltY.toFixed(3)}deg`);
      root.style.setProperty('--vp-px', `${curLightX.toFixed(2)}px`);
      root.style.setProperty('--vp-py', `${curLightY.toFixed(2)}px`);
      const settled =
        Math.abs(tgtTiltX - curTiltX) < 0.005 &&
        Math.abs(tgtTiltY - curTiltY) < 0.005 &&
        Math.abs(tgtLightX - curLightX) < 0.05 &&
        Math.abs(tgtLightY - curLightY) < 0.05;
      if (!settled) raf = requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (rect.width === 0) return;
      const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      tgtTiltY = nx * TILT_MAX_DEG;
      tgtTiltX = -ny * TILT_MAX_DEG;
      tgtLightX = nx * LIGHT_MAX_PX;
      tgtLightY = ny * LIGHT_MAX_PX;
      ensureLoop();
    };

    const onLeave = () => {
      tgtTiltX = 0;
      tgtTiltY = 0;
      tgtLightX = 0;
      tgtLightY = 0;
      ensureLoop();
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let offscreen = false;
    let hidden = false;
    const apply = () => {
      root.classList.toggle('is-paused', offscreen || hidden);
    };
    const io = new IntersectionObserver(
      (entries) => {
        offscreen = !entries[0]?.isIntersecting;
        apply();
      },
      { rootMargin: '80px' },
    );
    io.observe(root);
    const onVisibility = () => {
      hidden = document.hidden;
      apply();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const selected = new Set(selectedCategories);
  const hintCategory: CategoryId | null =
    mode === 'hero' && selectedCategories.length === 0 && !activeCategory ? 'technology' : null;

  const routePath = routePathFor(selected);

  const rootClass = [
    'vp-compass',
    `vp-compass--${mode}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootClass} data-reduced={String(reducedMotion)} data-mode={mode}>
      <div ref={stageRef} className="vp-compass-stage">
        <svg viewBox="0 0 760 760" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="vpc-arc-a" x1="120" y1="40" x2="640" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#8BA4FF" />
              <stop offset="1" stopColor="#B79BFF" />
            </linearGradient>
            <linearGradient id="vpc-arc-b" x1="620" y1="500" x2="140" y2="720" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#B79BFF" />
              <stop offset="1" stopColor="#85E2C9" />
            </linearGradient>
            <linearGradient id="vpc-arc-c" x1="560" y1="240" x2="620" y2="520" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#85E2C9" />
              <stop offset="1" stopColor="#8BA4FF" />
            </linearGradient>
            <radialGradient id="vpc-halo">
              <stop offset="0" stopColor="#657FFF" stopOpacity="0.34" />
              <stop offset="0.55" stopColor="#657FFF" stopOpacity="0.12" />
              <stop offset="1" stopColor="#657FFF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="vpc-core">
              <stop offset="0" stopColor="#F4F6FC" stopOpacity="0.95" />
              <stop offset="0.32" stopColor="#8BA4FF" stopOpacity="0.75" />
              <stop offset="1" stopColor="#8BA4FF" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={CENTER} cy={CENTER} r="170" fill="url(#vpc-halo)" />
          <g className="vp-compass-core-breathe">
            <circle cx={CENTER} cy={CENTER} r="118" fill="url(#vpc-core)" opacity="0.55" />
            <circle cx={CENTER} cy={CENTER} r="64" fill="url(#vpc-core)" />
            <circle cx={CENTER} cy={CENTER} r="7" fill="#F4F6FC" opacity="0.9" />
          </g>

          <path
            className="vp-compass-arc vp-compass-arc--a"
            d={arcPath(CENTER, CENTER, 348, -168, -12)}
            fill="none"
            stroke="url(#vpc-arc-a)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            className="vp-compass-arc vp-compass-arc--b"
            d={arcPath(CENTER, CENTER, 300, 16, 164)}
            fill="none"
            stroke="url(#vpc-arc-b)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.34"
          />
          <path
            className="vp-compass-arc vp-compass-arc--c"
            d={arcPath(CENTER, CENTER, 240, -64, 64)}
            fill="none"
            stroke="url(#vpc-arc-c)"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.24"
          />

          <g className="vp-compass-spin">
            <path
              d={arcPath(CENTER, CENTER, 362, -170, 170)}
              fill="none"
              stroke="#8BA4FF"
              strokeWidth="1"
              strokeDasharray="1.5 9"
              strokeLinecap="round"
              opacity="0.35"
            />
          </g>

          {routePath ? (
            <path className="vp-compass-route" d={routePath} pathLength={1} />
          ) : null}

          {ARC_DOTS.map(([radius, angle], index) => {
            const point = polar(CENTER, CENTER, radius, angle);
            return (
              <circle
                key={`dot-${index}`}
                cx={point.x.toFixed(2)}
                cy={point.y.toFixed(2)}
                r="1.6"
                fill="#ABB5CB"
                opacity="0.35"
              />
            );
          })}

          {CATEGORY_ORDER.map((category) => {
            const angle = CATEGORY_ANGLE[category];
            const node = polar(CENTER, CENTER, NODE_R, angle);
            const tickOuter = polar(CENTER, CENTER, NODE_R + 15, angle);
            const isActive = activeCategory === category;
            const isSelected = selected.has(category);
            const isHint = hintCategory === category;
            const nodeClass = [
              'vp-compass-node',
              isActive || isSelected ? 'vp-compass-node--on' : '',
              isHint ? 'vp-compass-node--hint' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <Fragment key={category}>
                <line
                  x1={node.x.toFixed(2)}
                  y1={node.y.toFixed(2)}
                  x2={tickOuter.x.toFixed(2)}
                  y2={tickOuter.y.toFixed(2)}
                  stroke={CATEGORY_COLORS[category]}
                  strokeWidth="1"
                  opacity="0.45"
                />
                <circle
                  className={nodeClass}
                  cx={node.x.toFixed(2)}
                  cy={node.y.toFixed(2)}
                  r={isActive || isSelected ? 6.5 : 4.5}
                  fill={CATEGORY_COLORS[category]}
                  opacity={isActive || isSelected ? 1 : 0.75}
                />
              </Fragment>
            );
          })}
        </svg>

        <div className="vp-compass-bloom" aria-hidden="true" />

        {CATEGORY_ORDER.map((category) => {
          const offset = labelOffsetPercent(CATEGORY_ANGLE[category]);
          const isSelected = selected.has(category);
          const style = {
            '--vp-lx': offset.x.toFixed(3),
            '--vp-ly': offset.y.toFixed(3),
            '--vp-label-color': CATEGORY_COLORS[category],
          } as CSSProperties;
          return (
            <button
              key={category}
              type="button"
              className="vp-compass-label"
              style={style}
              aria-pressed={isSelected}
              aria-label={`${CATEGORY_LABELS[category]} — выбрать интерес`}
              disabled={!onInterestSelect}
              onClick={onInterestSelect ? () => onInterestSelect(category) : undefined}
            >
              <span className="vp-compass-label-dot" aria-hidden="true" />
              <span className="vp-compass-label-text">{CATEGORY_LABELS[category]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
