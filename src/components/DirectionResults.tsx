import type { CSSProperties, RefObject } from 'react';
import type { Direction, DirectionSymbol, JourneyState } from '../lib/types';
import { directionById, generalPicks } from '../data/directions';
import { explainResults } from '../lib/recommend';
import { registrationUrl } from '../config/campaign';
import { track } from '../lib/events';
import './interest/interest.css';

type DirectionResultsProps = {
  journey: JourneyState;
  headingRef: RefObject<HTMLHeadingElement | null>;
  registerTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  onOpen: (id: string) => void;
  onEdit: () => void;
  onRestart: () => void;
  onAnswerFromDemo: () => void;
};

function SymbolGlyph({ symbol }: { symbol: DirectionSymbol }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (symbol) {
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 4 20 8 12 12 4 8Z" />
          <path {...common} d="M4 12l8 4 8-4" />
          <path {...common} d="M4 16l8 4 8-4" />
        </svg>
      );
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect {...common} x="4" y="4" width="7" height="7" rx="1.5" />
          <rect {...common} x="13" y="4" width="7" height="7" rx="1.5" />
          <rect {...common} x="4" y="13" width="7" height="7" rx="1.5" />
          <rect {...common} x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'orbit':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="3.2" />
          <ellipse {...common} cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-24 12 12)" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3 20h19" />
          <path {...common} d="M6.5 20v-8" />
          <path {...common} d="M12 20V6" />
          <path {...common} d="M17.5 20v-5" />
        </svg>
      );
    case 'path':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M4 18c4-8 10 2 16-12" />
          <circle {...common} cx="4" cy="18" r="1.6" />
          <circle {...common} cx="20" cy="6" r="1.6" />
        </svg>
      );
    case 'pulse':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M3 12h4l2.5-6 4 12 2.5-6H21" />
        </svg>
      );
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M5 19c0-7 14-5 14-14" />
          <circle {...common} cx="5" cy="19" r="1.6" />
          <circle {...common} cx="19" cy="5" r="1.6" />
        </svg>
      );
    case 'signal':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...common} d="M5.5 13a11 11 0 0 1 13 0" />
          <path {...common} d="M8.5 16a6 6 0 0 1 7 0" />
          <circle {...common} cx="12" cy="18.5" r="1.4" />
        </svg>
      );
    case 'focus':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...common} cx="12" cy="12" r="6" />
          <path {...common} d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DirectionResults({
  journey,
  headingRef,
  registerTrigger,
  onOpen,
  onEdit,
  onRestart,
  onAnswerFromDemo,
}: DirectionResultsProps) {
  const isDemo = journey.phase === 'demo' || journey.resultMode === 'demo';
  const ids = isDemo ? generalPicks : journey.resultIds ?? [];
  const directions = ids
    .map((id) => directionById(id))
    .filter((direction): direction is Direction => direction !== null);
  const explanations = isDemo
    ? null
    : explainResults(journey.committed, {
        directionIds: ids,
        mixed: journey.mixed,
        topCategories: [],
        skipped: false,
      });

  return (
    <div className="vp-interest-step">
      <h3 ref={headingRef} tabIndex={-1} className="vp-results-heading">
        Вот с чего можно начать
      </h3>

      {isDemo ? (
        <>
          <p className="vp-results-note">
            Это примеры направлений для знакомства. Ответь на вопросы, чтобы собрать свою
            подборку.
          </p>
          <div className="vp-results-actions">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={onAnswerFromDemo}
            >
              Ответить на вопросы
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="vp-results-note">
            По твоим интересам мы выбрали несколько направлений для знакомства
          </p>
          {journey.mixed ? (
            <p className="vp-results-mixed">
              У тебя получилось несколько интересов — можно начать с любого
            </p>
          ) : null}
        </>
      )}

      <div className="vp-direction-grid">
        {directions.map((direction, index) => {
          const reason = isDemo
            ? 'Пример направления для знакомства'
            : explanations?.find((item) => item.id === direction.id)?.reason ??
              'Вариант для знакомства';
          return (
            <article
              key={direction.id}
              className={`vp-direction-card${index === 0 ? ' vp-direction-card--lead' : ''}`}
              style={{ '--dir-color': `var(--cat-${direction.categories[0]})` } as CSSProperties}
            >
              <div className="vp-direction-top">
                <span className="vp-direction-symbol" style={{ color: 'var(--silver)' }}>
                  <SymbolGlyph symbol={direction.symbol} />
                </span>
                <h4 className="vp-direction-title">{direction.title}</h4>
                {isDemo ? <span className="vp-direction-badge">Примеры</span> : null}
              </div>
              <p className="vp-direction-reason">{reason}</p>
              <p className="vp-direction-preview">
                <strong>Что можно делать:</strong> {direction.tasks[0]}
              </p>
              <div className="vp-direction-actions">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  ref={registerTrigger(direction.id)}
                  onClick={() => onOpen(direction.id)}
                >
                  Подробнее
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="vp-results-explainer">
        {isDemo
          ? 'Это примеры направлений. Они не заменяют профориентационный тест.'
          : 'Это подборка для знакомства по твоим ответам. Она не заменяет профориентационный тест.'}
      </p>

      {!isDemo ? (
        <div className="vp-results-actions">
          <span className="vp-results-actions-note">
            Можно изменить ответы или начать знакомство заново
          </span>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
            Изменить ответы
          </button>
          <button type="button" className="btn btn--ghost" onClick={onRestart}>
            Начать заново
          </button>
        </div>
      ) : null}

      <div className="vp-results-cta">
        <a
          className="btn btn--primary"
          href={registrationUrl()}
          onClick={() => track('registration_click', { placement: 'results' })}
        >
          Зарегистрироваться в Ventorme
          <span className="btn-arrow" aria-hidden="true">
            →
          </span>
        </a>
        <p className="micro">Откроется Ventorme. Создай аккаунт и заверши начальную настройку.</p>
      </div>
    </div>
  );
}
