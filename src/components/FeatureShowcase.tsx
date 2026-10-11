import { useState } from 'react';
import { track } from '../lib/events';
import './features/features.css';

type StepId = '01' | '02' | '03';

type Step = {
  id: StepId;
  title: string;
  text: string;
  caption: string;
};

const STEPS: Step[] = [
  {
    id: '01',
    title: 'Разобраться в интересах',
    text: 'Посмотреть, какие занятия и профессии связаны с твоими интересами.',
    caption: 'Слой 01 — интересы и связанные занятия.',
  },
  {
    id: '02',
    title: 'Изучить варианты учёбы',
    text: 'Подбор вузов и ориентиры по грантам — актуальные данные и условия в самом Ventorme.',
    caption: 'Слой 02 — вузы и ориентиры по грантам.',
  },
  {
    id: '03',
    title: 'Понять подготовку',
    text: 'Инструменты подготовки к экзаменам. Конкретные возможности и условия — на платформе.',
    caption: 'Слой 03 — инструменты подготовки к экзаменам.',
  },
];

export default function FeatureShowcase() {
  const [activeId, setActiveId] = useState<StepId>('01');
  const active = STEPS.find((step) => step.id === activeId) ?? STEPS[0];

  const selectStep = (id: StepId) => {
    if (id === activeId) return;
    setActiveId(id);
    track('features_tab_open', { step: id });
  };

  const shiftClass = (id: StepId) =>
    id === activeId
      ? 'vp-features-shift vp-features-shift--active'
      : 'vp-features-shift vp-features-shift--dim';

  return (
    <div className="vp-features-layout">
      <div className="vp-features-steps">
        <ul className="vp-features-list" role="list" aria-label="Шаги маршрута">
          {STEPS.map((step) => {
            const isActive = step.id === activeId;
            return (
              <li className="vp-features-item" key={step.id}>
                <button
                  type="button"
                  className={
                    isActive ? 'vp-features-step vp-features-step--active' : 'vp-features-step'
                  }
                  aria-pressed={isActive}
                  onClick={() => selectStep(step.id)}
                >
                  <span className="vp-features-step-num">{step.id}</span>
                  <span className="vp-features-step-title">{step.title}</span>
                  <span className="vp-features-step-text">{step.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <figure className="vp-features-visual">
        <div className="vp-features-stage">
          <svg
            className="vp-features-svg"
            viewBox="0 0 520 400"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="vp-features-fill-back" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" className="vp-features-stop-back-a" />
                <stop offset="1" className="vp-features-stop-back-b" />
              </linearGradient>
              <linearGradient id="vp-features-fill-mid" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" className="vp-features-stop-mid-a" />
                <stop offset="1" className="vp-features-stop-mid-b" />
              </linearGradient>
              <linearGradient id="vp-features-fill-front" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" className="vp-features-stop-front-a" />
                <stop offset="1" className="vp-features-stop-front-b" />
              </linearGradient>
            </defs>

            <g transform="rotate(-6 180 142)">
              <g className={shiftClass('03')}>
                <rect
                  className="vp-features-plate"
                  x="30"
                  y="40"
                  width="300"
                  height="205"
                  rx="18"
                  fill="url(#vp-features-fill-back)"
                />
                <g className="vp-features-graticule">
                  <line x1="90" y1="40" x2="90" y2="245" />
                  <line x1="150" y1="40" x2="150" y2="245" />
                  <line x1="210" y1="40" x2="210" y2="245" />
                  <line x1="270" y1="40" x2="270" y2="245" />
                  <line x1="30" y1="90" x2="330" y2="90" />
                  <line x1="30" y1="140" x2="330" y2="140" />
                  <line x1="30" y1="190" x2="330" y2="190" />
                </g>
                <circle className="vp-features-node" cx="105" cy="190" r="4.5" />
                <circle
                  className="vp-features-node vp-features-node--end"
                  cx="240"
                  cy="110"
                  r="4.5"
                />
                <circle className="vp-features-halo" cx="240" cy="110" r="11" />
              </g>
            </g>

            <g transform="rotate(3 255 197)">
              <g className={shiftClass('02')}>
                <rect
                  className="vp-features-plate"
                  x="105"
                  y="95"
                  width="300"
                  height="205"
                  rx="18"
                  fill="url(#vp-features-fill-mid)"
                />
                <polyline
                  className="vp-features-route vp-features-route--dashed"
                  points="140,255 205,190 270,225 340,160 380,190"
                />
                <circle className="vp-features-node" cx="140" cy="255" r="4.5" />
                <circle
                  className="vp-features-node vp-features-node--end"
                  cx="380"
                  cy="190"
                  r="5.5"
                />
                <circle className="vp-features-halo" cx="380" cy="190" r="12" />
              </g>
            </g>

            <g transform="rotate(-2 330 252)">
              <g className={shiftClass('01')}>
                <rect
                  className="vp-features-plate"
                  x="180"
                  y="150"
                  width="300"
                  height="205"
                  rx="18"
                  fill="url(#vp-features-fill-front)"
                />
                <polyline
                  className="vp-features-route"
                  points="215,300 285,240 355,275 430,212"
                />
                <circle className="vp-features-node" cx="215" cy="300" r="4.5" />
                <circle
                  className="vp-features-node vp-features-node--end"
                  cx="430"
                  cy="212"
                  r="6"
                />
                <circle className="vp-features-halo" cx="430" cy="212" r="13" />
              </g>
            </g>
          </svg>
        </div>
        <p className="vp-features-live" aria-live="polite">
          {active.caption}
        </p>
        <figcaption className="vp-features-note">
          Схема-иллюстрация, не скриншот платформы
        </figcaption>
      </figure>
    </div>
  );
}
