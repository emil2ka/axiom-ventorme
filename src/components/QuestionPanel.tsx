import type { RefObject } from 'react';
import { questions } from '../data/questions';
import { CATEGORY_LABELS } from '../data/categories';
import type { GoalId, JourneyState } from '../lib/types';
import './interest/interest.css';

type QuestionPanelProps = {
  journey: JourneyState;
  busy: boolean;
  limitMessage: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onToggleInterest: (id: string) => void;
  onSelectProject: (id: string) => void;
  onSelectGoal: (id: GoalId) => void;
  onNext: () => void;
  onBack: () => void;
  onCancelEdit: () => void;
  onClearRequested: () => void;
};

const STEP_INDEX: Record<string, number> = { q1: 1, q2: 2, q3: 3 };

export default function QuestionPanel({
  journey,
  busy,
  limitMessage,
  headingRef,
  onToggleInterest,
  onSelectProject,
  onSelectGoal,
  onNext,
  onBack,
  onCancelEdit,
  onClearRequested,
}: QuestionPanelProps) {
  const { step, mode, draft, requestedCategory } = journey;
  const index = STEP_INDEX[step];
  const title =
    step === 'q1'
      ? questions.q1.title
      : step === 'q2'
        ? questions.q2.title
        : questions.q3.title;

  const canProceed =
    step === 'q1'
      ? draft.interestIds.length > 0
      : step === 'q2'
        ? draft.projectId !== null
        : draft.goalId !== null;

  const nextLabel =
    step === 'q3'
      ? mode === 'edit'
        ? 'Обновить подборку'
        : 'Показать направления'
      : 'Далее';

  return (
    <div className="vp-interest-step">
      {mode === 'edit' && journey.resultIds ? (
        <div className="vp-interest-editbar">
          <span className="vp-interest-editbar-label">Редактирование ответов</span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onCancelEdit}
          >
            Отменить изменения
          </button>
        </div>
      ) : null}

      <div className="vp-interest-progress">
        <span className="vp-interest-progress-text">Вопрос {index} из 3</span>
        <span className="vp-interest-progress-bar" aria-hidden="true">
          <span
            className="vp-interest-progress-fill"
            style={{ width: `${Math.round((index / 3) * 100)}%` }}
          />
        </span>
      </div>

      <h3 ref={headingRef} tabIndex={-1} className="vp-interest-question">
        {title}
      </h3>

      {step === 'q1' ? (
        <fieldset className="vp-interest-fieldset">
          <legend className="visually-hidden">{title}</legend>
          <p className="vp-interest-hint">Выбери до двух интересов</p>

          {requestedCategory ? (
            <p className="vp-interest-requested" role="status">
              <span>
                Чтобы добавить «{CATEGORY_LABELS[requestedCategory]}», сними один из выбранных
                интересов
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={onClearRequested}
              >
                Понятно
              </button>
            </p>
          ) : null}

          <div className="vp-interest-options">
            {questions.q1.options.map((option) => {
              const selected = draft.interestIds.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="vp-interest-option"
                  data-type="check"
                  data-selected={selected}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleInterest(option.id)}
                  />
                  <span className="vp-interest-option-mark" aria-hidden="true" />
                  <span className="vp-interest-option-body">
                    <span className="vp-interest-option-label">{option.label}</span>
                    <span className="vp-interest-option-hint">{option.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {step === 'q2' ? (
        <fieldset className="vp-interest-fieldset">
          <legend className="visually-hidden">{title}</legend>
          <div className="vp-interest-options">
            {questions.q2.options.map((option) => {
              const selected = draft.projectId === option.id;
              return (
                <label
                  key={option.id}
                  className="vp-interest-option"
                  data-type="radio"
                  data-selected={selected}
                >
                  <input
                    type="radio"
                    name="vp-project"
                    checked={selected}
                    onChange={() => onSelectProject(option.id)}
                  />
                  <span className="vp-interest-option-mark" aria-hidden="true" />
                  <span className="vp-interest-option-body">
                    <span className="vp-interest-option-label">{option.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {step === 'q3' ? (
        <fieldset className="vp-interest-fieldset">
          <legend className="visually-hidden">{title}</legend>
          <div className="vp-interest-options">
            {questions.q3.options.map((option) => {
              const selected = draft.goalId === option.id;
              return (
                <label
                  key={option.id}
                  className="vp-interest-option"
                  data-type="radio"
                  data-selected={selected}
                >
                  <input
                    type="radio"
                    name="vp-goal"
                    checked={selected}
                    onChange={() => onSelectGoal(option.id)}
                  />
                  <span className="vp-interest-option-mark" aria-hidden="true" />
                  <span className="vp-interest-option-body">
                    <span className="vp-interest-option-label">{option.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <p className="vp-interest-limit" role="status">
        {limitMessage ? 'Выбери до двух. Можно заменить один из выбранных' : ''}
      </p>

      <div className="vp-interest-nav">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onBack}
          disabled={index === 1}
        >
          Назад
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onNext}
          disabled={!canProceed || busy}
        >
          {nextLabel}
          <span className="btn-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
