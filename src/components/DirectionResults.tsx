import type { CSSProperties, RefObject } from 'react';
import type { Direction, DirectionSymbol, GoalId, RecommendationResult } from '../lib/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/categories';
import { directionById } from '../data/directions';
import { registrationUrl } from '../config/campaign';
import { track } from '../lib/events';
import './interest/interest.css';

type DirectionResultsProps = {
  result: RecommendationResult;
  goalId: GoalId | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  registerTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  onOpen: (id: string) => void;
  onChangeAnswers: () => void;
  onRestart: () => void;
  onAnswerQuestions: () => void;
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

function DirectionCard({
  direction,
  index,
  goalId,
  registerTrigger,
  onOpen,
}: {
  direction: Direction;
  index: number;
  goalId: GoalId | null;
  registerTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  onOpen: (id: string) => void;
}) {
  const color = CATEGORY_COLORS[direction.categories[0]];
  const emphasisClass =
    goalId === 'try'
      ? ' vp-direction-card--emphasis-try'
      : goalId === 'nextstep'
        ? ' vp-direction-card--emphasis-next'
        : '';
  const className = `vp-direction-card${index === 0 ? ' vp-direction-card--lead' : ''}${emphasisClass}`;

  const tryBlock = (
    <div className="vp-direction-try" key="try">
      <span className="vp-direction-label">Попробуй сейчас</span>
      {direction.tryNow}
    </div>
  );
  const nextBlock = (
    <div className="vp-direction-next" key="next">
      <span className="vp-direction-label">Следующий шаг</span>
      {direction.nextStep}
    </div>
  );
  const tasksBlock = (
    <div key="tasks">
      <span className="vp-direction-label">Что можно делать</span>
      <ul className="vp-direction-tasks">
        {direction.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
    </div>
  );

  const blocks =
    goalId === 'try'
      ? [tryBlock, tasksBlock, nextBlock]
      : goalId === 'nextstep'
        ? [nextBlock, tasksBlock, tryBlock]
        : [tasksBlock, tryBlock, nextBlock];

  return (
    <article className={className} style={{ '--dir-color': color } as CSSProperties}>
      <div className="vp-direction-top">
        <span className="vp-direction-symbol">
          <SymbolGlyph symbol={direction.symbol} />
        </span>
        <h4 className="vp-direction-title">{direction.title}</h4>
      </div>
      <div className="vp-direction-chips">
        {direction.categories.map((category) => (
          <span
            key={category}
            className="vp-direction-chip"
            style={{ '--chip-color': CATEGORY_COLORS[category] } as CSSProperties}
          >
            <span className="vp-direction-chip-dot" aria-hidden="true" />
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
      <p className="vp-direction-summary">{direction.summary}</p>
      {blocks}
      <div className="vp-direction-actions">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          ref={registerTrigger(direction.id)}
          onClick={() => onOpen(direction.id)}
        >
          Посмотреть подробнее
        </button>
      </div>
    </article>
  );
}

export default function DirectionResults({
  result,
  goalId,
  headingRef,
  registerTrigger,
  onOpen,
  onChangeAnswers,
  onRestart,
  onAnswerQuestions,
}: DirectionResultsProps) {
  const picked = result.directionIds
    .map((id) => directionById(id))
    .filter((direction): direction is Direction => direction !== null);

  return (
    <div className="vp-interest-step">
      <h3 ref={headingRef} tabIndex={-1} className="vp-results-heading">
        Вот с чего можно начать
      </h3>

      {result.skipped ? (
        <>
          <p className="vp-results-note">
            Это примеры направлений для знакомства. Ответь на вопросы, чтобы собрать свою подборку.
          </p>
          <div className="vp-results-controls">
            <button type="button" className="btn btn--secondary btn--sm" onClick={onAnswerQuestions}>
              Ответить на вопросы
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="vp-results-note">
            По твоим интересам мы выбрали несколько направлений для знакомства
          </p>
          {result.mixed ? (
            <p className="vp-results-mixed">
              У тебя получилось несколько интересов — можно начать с любого
            </p>
          ) : null}
        </>
      )}

      <div className="vp-direction-grid">
        {picked.map((direction, index) => (
          <DirectionCard
            key={direction.id}
            direction={direction}
            index={index}
            goalId={goalId}
            registerTrigger={registerTrigger}
            onOpen={onOpen}
          />
        ))}
      </div>

      <p className="vp-results-explainer">
        Это подборка для знакомства по твоим ответам. Она не заменяет профориентационный тест.
      </p>

      <div className="vp-results-controls">
        <span className="vp-results-controls-text">
          Можно изменить ответы или посмотреть другие направления
        </span>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onChangeAnswers}>
          Изменить ответы
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Начать заново
        </button>
      </div>

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
