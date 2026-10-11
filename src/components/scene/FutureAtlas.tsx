import { useEffect, useRef, useState } from 'react';
import type { CategoryId, JourneyState, MotionMode, SceneState } from '../../lib/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../data/categories';
import { selectedCategories } from '../../lib/recommend';
import { dispatchJourney, getJourney, subscribeJourney } from '../../lib/journeyStore';
import { useMotionPreference } from '../../lib/useMotionPreference';
import type { AtlasHandle } from './atlasScene';
import './scene.css';

function toSceneState(journey: JourneyState, motion: MotionMode): SceneState {
  const answers = journey.phase === 'questions' ? journey.draft : journey.committed;
  return {
    phase: journey.phase,
    resultMode: journey.resultMode,
    activeCategories: journey.phase === 'demo' ? [] : selectedCategories(answers),
    previewCategory:
      journey.phase === 'initial' || journey.phase === 'questions'
        ? journey.previewCategory
        : null,
    routeProgress: 0,
    motion,
  };
}

export default function FutureAtlas() {
  const reduced = useMotionPreference();
  const [ready, setReady] = useState(false);
  const [staticFallback, setStaticFallback] = useState(false);
  const [journey, setJourney] = useState<JourneyState>(() => getJourney());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<AtlasHandle | null>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const unsubscribe = subscribeJourney((next) => setJourney(next));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let disposed = false;
    let handle: AtlasHandle | null = null;
    let unsubscribe: (() => void) | null = null;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const start = async () => {
      if (disposed) return;
      const module = await import('./atlasScene');
      if (disposed) return;
      handle = module.createAtlasScene(canvas);
      if (!handle) {
        setStaticFallback(true);
        return;
      }
      handleRef.current = handle;
      handle.setState(
        toSceneState(getJourney(), reducedRef.current ? 'reduced' : 'full'),
      );
      setReady(true);

      unsubscribe = subscribeJourney((next) => {
        handle?.setState(toSceneState(next, reducedRef.current ? 'reduced' : 'full'));
      });

      const finePointer = window.matchMedia('(pointer: fine)').matches;
      if (finePointer) {
        wrap.addEventListener('pointermove', onMove);
        wrap.addEventListener('pointerleave', onLeave);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    };

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      handle?.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    const onLeave = () => handle?.setPointer(0, 0);

    let ticking = false;
    let scrollRaf = 0;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      scrollRaf = requestAnimationFrame(() => {
        ticking = false;
        if (disposed || !handle) return;
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(
          0,
          Math.min(1, (vh * 0.65 - rect.top) / (vh * 0.5 + rect.height)),
        );
        handle.setScroll(progress * 0.6);
      });
    };

    const idle =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(() => void start(), { timeout: 1200 })
        : null;
    if (idle === null) {
      timeoutHandle = window.setTimeout(() => void start(), 240);
    } else {
      idleHandle = idle;
    }

    return () => {
      disposed = true;
      if (idleHandle !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      unsubscribe?.();
      window.removeEventListener('scroll', onScroll);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      handle?.dispose();
      handle = null;
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    handleRef.current?.setState(
      toSceneState(getJourney(), reduced ? 'reduced' : 'full'),
    );
  }, [reduced]);

  const scene = toSceneState(journey, staticFallback ? 'static' : reduced ? 'reduced' : 'full');
  const active = new Set(scene.activeCategories);

  return (
    <div
      ref={wrapRef}
      className="vp-atlas"
      data-ready={String(ready && !staticFallback)}
      data-static={String(staticFallback)}
    >
      <div className="vp-atlas-3d">
        <svg
          className="vp-atlas-poster"
          viewBox="0 0 800 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
        <defs>
          <linearGradient id="vpa-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0d1220" />
            <stop offset="1" stopColor="#070910" />
          </linearGradient>
          <radialGradient id="vpa-core">
            <stop offset="0" stopColor="#cffb74" stopOpacity="0.5" />
            <stop offset="0.45" stopColor="#cffb74" stopOpacity="0.12" />
            <stop offset="1" stopColor="#cffb74" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vpa-1" x1="60" y1="160" x2="740" y2="560">
            <stop offset="0" stopColor="#c4cdd9" />
            <stop offset="0.55" stopColor="#9fb6d8" />
            <stop offset="1" stopColor="#a9c0ff" />
          </linearGradient>
          <linearGradient id="vpa-2" x1="60" y1="280" x2="740" y2="480">
            <stop offset="0" stopColor="#c4cdd9" />
            <stop offset="0.6" stopColor="#b9b3d8" />
            <stop offset="1" stopColor="#c7a9ff" />
          </linearGradient>
          <linearGradient id="vpa-3" x1="60" y1="400" x2="740" y2="420">
            <stop offset="0" stopColor="#c4cdd9" />
            <stop offset="1" stopColor="#8fe3c4" />
          </linearGradient>
          <linearGradient id="vpa-4" x1="60" y1="500" x2="740" y2="500">
            <stop offset="0" stopColor="#c4cdd9" />
            <stop offset="1" stopColor="#f0c27d" />
          </linearGradient>
          <linearGradient id="vpa-5" x1="60" y1="140" x2="740" y2="620">
            <stop offset="0" stopColor="#c4cdd9" />
            <stop offset="1" stopColor="#f0a9b8" />
          </linearGradient>
        </defs>
        <rect width="800" height="640" fill="url(#vpa-sky)" />
        <circle cx="430" cy="330" r="190" fill="url(#vpa-core)" />
        <g fill="none" strokeLinecap="round">
          <g stroke="#05070c" strokeOpacity="0.85" strokeWidth="19" transform="translate(0 7)">
            <path d="M 20 170 C 210 200 330 300 430 328 C 540 358 620 200 790 180" />
            <path d="M 20 300 C 220 300 330 324 430 332 C 545 340 620 330 790 320" />
            <path d="M 20 420 C 220 400 330 352 430 336 C 545 318 620 400 790 430" />
            <path d="M 20 520 C 230 470 340 380 430 340 C 550 300 630 480 790 540" />
            <path d="M 20 110 C 230 200 340 320 430 326 C 560 334 640 280 790 240" />
          </g>
          <path d="M 20 170 C 210 200 330 300 430 328 C 540 358 620 200 790 180" stroke="url(#vpa-1)" strokeWidth="13" />
          <path d="M 20 300 C 220 300 330 324 430 332 C 545 340 620 330 790 320" stroke="url(#vpa-2)" strokeWidth="12" />
          <path d="M 20 420 C 220 400 330 352 430 336 C 545 318 620 400 790 430" stroke="url(#vpa-3)" strokeWidth="11" />
          <path d="M 20 520 C 230 470 340 380 430 340 C 550 300 630 480 790 540" stroke="url(#vpa-4)" strokeWidth="11" />
          <path d="M 20 110 C 230 200 340 320 430 326 C 560 334 640 280 790 240" stroke="url(#vpa-5)" strokeWidth="9" />
        </g>
        <g fill="#cffb74">
          <circle cx="700" cy="203" r="5" />
          <circle cx="712" cy="322" r="5" />
          <circle cx="700" cy="425" r="5" />
        </g>
      </svg>

        <canvas ref={canvasRef} className="vp-atlas-canvas" aria-hidden="true" />
      </div>

      <div className="vp-atlas-labels">
        {CATEGORY_ORDER.map((category) => {
          const isActive = active.has(category);
          return (
            <button
              key={category}
              type="button"
              className="vp-atlas-label"
              data-cat={category}
              aria-pressed={isActive}
              aria-label={`${CATEGORY_LABELS[category]} — выбрать интерес`}
              onClick={() => dispatchJourney({ type: 'branchSelect', category })}
              onPointerEnter={() =>
                dispatchJourney({ type: 'previewCategory', category })
              }
              onPointerLeave={() =>
                dispatchJourney({ type: 'previewCategory', category: null })
              }
              onFocus={() => dispatchJourney({ type: 'previewCategory', category })}
              onBlur={() => dispatchJourney({ type: 'previewCategory', category: null })}
            >
              <span className="vp-atlas-label-dot" aria-hidden="true" />
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
