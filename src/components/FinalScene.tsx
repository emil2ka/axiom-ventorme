import { useEffect, useState, type CSSProperties } from 'react';
import type { CategoryId, JourneyState } from '../lib/types';
import { CATEGORY_LABELS } from '../data/categories';
import { registrationUrl } from '../config/campaign';
import { getJourney, subscribeJourney } from '../lib/journeyStore';
import { selectedCategories } from '../lib/recommend';
import { track } from '../lib/events';
import './final/final.css';

const RIBBON_PATHS = [
  { id: 'technology', d: 'M 30 300 C 180 280 300 240 420 208 C 540 176 640 150 760 132' },
  { id: 'creativity', d: 'M 30 340 C 190 330 310 300 430 236 C 545 174 650 160 760 158' },
  { id: 'research', d: 'M 30 380 C 200 380 320 348 430 268 C 540 188 650 178 760 190' },
  { id: 'people', d: 'M 30 420 C 210 424 330 384 434 300 C 540 214 650 206 760 226' },
  { id: 'organization', d: 'M 30 260 C 180 240 300 210 420 184 C 540 158 640 130 760 112' },
] as const;

function answersFor(journey: JourneyState) {
  return journey.phase === 'questions' ? journey.draft : journey.committed;
}

export default function FinalScene() {
  const [journey, setJourney] = useState<JourneyState>(() => getJourney());

  useEffect(() => subscribeJourney(setJourney), []);

  const active = new Set<CategoryId>(
    journey.phase === 'demo' ? [] : selectedCategories(answersFor(journey)),
  );
  const hasResult = journey.phase === 'result' || journey.phase === 'demo';

  return (
    <section id="final" className="vp-final" aria-labelledby="final-title">
      <div className="container vp-final-grid">
        <div className="vp-final-scene" aria-hidden="true">
          <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="vpf-silver" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#c4cdd9" stopOpacity="0.5" />
                <stop offset="1" stopColor="#c4cdd9" stopOpacity="0.9" />
              </linearGradient>
              <radialGradient id="vpf-open">
                <stop offset="0" stopColor="#cffb74" stopOpacity="0.55" />
                <stop offset="1" stopColor="#cffb74" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="716" cy="176" r="120" fill="url(#vpf-open)" opacity="0.5" />

            {RIBBON_PATHS.map((ribbon) => (
              <g key={ribbon.id} data-active={active.has(ribbon.id)} className="vp-final-ribbon">
                <path d={ribbon.d} transform="translate(0 6)" fill="none" stroke="#04060b" strokeOpacity="0.8" strokeWidth="14" strokeLinecap="round" />
                <path d={ribbon.d} className="vp-final-path" fill="none" stroke="url(#vpf-silver)" strokeWidth="9" strokeLinecap="round" />
                <path d={ribbon.d} className="vp-final-edge" fill="none" stroke={`var(--cat-${ribbon.id})`} strokeWidth="1.6" strokeLinecap="round" transform="translate(0 -4.5)" />
              </g>
            ))}

            <g className="vp-final-nodes" data-visible={hasResult}>
              <circle cx="560" cy="156" r="5" />
              <circle cx="640" cy="152" r="5" />
              <circle cx="716" cy="176" r="6.5" />
            </g>
          </svg>
          {active.size > 0 ? (
            <p className="vp-final-caption">
              {Array.from(active)
                .map((category) => CATEGORY_LABELS[category])
                .join(' · ')}
            </p>
          ) : (
            <p className="vp-final-caption vp-final-caption--muted">Пять возможностей — один путь</p>
          )}
        </div>

        <div className="vp-final-copy">
          <h2 id="final-title" className="h2">
            Не нужно решать всё сегодня. Начни с одного шага.
          </h2>
          <p className="lead">
            Познакомься с Ventorme и его возможностями для выбора профессии и поступления.
          </p>
          <div className="vp-final-cta">
            <a
              className="btn btn--primary"
              href={registrationUrl()}
              onClick={() => track('registration_click', { placement: 'finale' })}
            >
              Зарегистрироваться в Ventorme
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <p className="micro">Регистрация откроется на ventorme.ai</p>
          </div>
        </div>
      </div>
    </section>
  );
}
