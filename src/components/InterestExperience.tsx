import { useEffect, useRef, useState } from 'react';
import type { Answers, CategoryId, GoalId, JourneyState } from '../lib/types';
import { CATEGORY_ORDER } from '../data/categories';
import { categoryOfInterest, categoryOfProject, questions } from '../data/questions';
import { directionById } from '../data/directions';
import { recommendResults } from '../lib/recommend';
import {
  clearJourney,
  loadJourney,
  saveJourney,
  setPendingCategory,
  takePendingCategory,
} from '../lib/session';
import { track } from '../lib/events';
import { useMotionPreference } from '../lib/useMotionPreference';
import CompassScene from './CompassScene';
import QuestionPanel from './QuestionPanel';
import DirectionResults from './DirectionResults';
import DirectionDialog from './DirectionDialog';
import './interest/interest.css';

const INITIAL_STATE: JourneyState = {
  step: 'idle',
  answers: { interestIds: [], projectId: null, goalId: null },
  resultIds: null,
  mixed: false,
  skipped: false,
  openedDirectionId: null,
};

type InterestExperienceProps = {
  uiVersion?: string;
};

export default function InterestExperience({ uiVersion = '1' }: InterestExperienceProps) {
  const reducedMotion = useMotionPreference();
  const [state, setState] = useState<JourneyState>(INITIAL_STATE);
  const [limitMessage, setLimitMessage] = useState(false);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const shouldFocusRef = useRef(false);
  const lockRef = useRef(false);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const saved = loadJourney();
    const pending = takePendingCategory();
    let next: JourneyState | null = null;
    if (saved && saved.step !== 'idle' && saved.answers) {
      next = { ...saved, openedDirectionId: null };
    }
    if (pending) {
      const option = questions.q1.options.find((item) => item.category === pending);
      if (option) {
        const base = next ?? INITIAL_STATE;
        if (base.step !== 'results') {
          const interestIds = base.answers.interestIds.includes(option.id)
            ? base.answers.interestIds
            : [...base.answers.interestIds, option.id].slice(0, 2);
          next = {
            ...base,
            step: 'q1',
            answers: { ...base.answers, interestIds },
            openedDirectionId: null,
          };
          shouldFocusRef.current = true;
        } else {
          setPendingCategory(pending);
        }
      }
    }
    if (next) {
      setState(next);
      saveJourney(next);
    }
  }, []);

  useEffect(() => {
    if (!shouldFocusRef.current) return;
    const target =
      state.step === 'results'
        ? resultsHeadingRef.current
        : state.step === 'idle'
          ? null
          : headingRef.current;
    if (!target) return;
    shouldFocusRef.current = false;
    target.focus({ preventScroll: true });
  }, [state.step]);

  const commit = (next: JourneyState) => {
    setState(next);
    saveJourney(next);
  };

  const withLock = (action: () => void) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    action();
    window.setTimeout(() => {
      lockRef.current = false;
      setBusy(false);
    }, 320);
  };

  const markStarted = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('experience_start', { uiVersion });
    }
  };

  const startExperience = () => {
    markStarted();
    withLock(() => {
      shouldFocusRef.current = true;
      commit({ ...state, step: 'q1' });
    });
  };

  const toggleInterest = (id: string) => {
    if (state.step === 'results') return;
    markStarted();
    const ids = state.answers.interestIds;
    if (!ids.includes(id) && ids.length >= 2) {
      setLimitMessage(true);
      return;
    }
    setLimitMessage(false);
    const interestIds = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    const step = state.step === 'idle' ? 'q1' : state.step;
    commit({ ...state, step, answers: { ...state.answers, interestIds } });
  };

  const selectProject = (id: string) => {
    setLimitMessage(false);
    commit({ ...state, answers: { ...state.answers, projectId: id } });
  };

  const selectGoal = (id: GoalId) => {
    setLimitMessage(false);
    commit({ ...state, answers: { ...state.answers, goalId: id } });
  };

  const finish = (answers: Answers, skipped: boolean) => {
    const result = recommendResults(answers);
    shouldFocusRef.current = true;
    commit({
      ...state,
      step: 'results',
      resultIds: result.directionIds,
      mixed: result.mixed,
      skipped,
    });
    if (skipped) {
      track('experience_skip', { uiVersion });
    }
    if (!completedRef.current) {
      completedRef.current = true;
      track('experience_complete', { mixed: result.mixed, skipped, uiVersion });
    }
  };

  const next = () => {
    if (state.step === 'q1') {
      if (state.answers.interestIds.length === 0) return;
      withLock(() => {
        track('question_complete', { step: 'q1', uiVersion });
        shouldFocusRef.current = true;
        commit({ ...state, step: 'q2' });
      });
    } else if (state.step === 'q2') {
      if (!state.answers.projectId) return;
      withLock(() => {
        track('question_complete', { step: 'q2', uiVersion });
        shouldFocusRef.current = true;
        commit({ ...state, step: 'q3' });
      });
    } else if (state.step === 'q3') {
      if (!state.answers.goalId) return;
      withLock(() => {
        track('question_complete', { step: 'q3', uiVersion });
        finish(state.answers, false);
      });
    }
  };

  const back = () => {
    if (state.step === 'q2') {
      withLock(() => {
        shouldFocusRef.current = true;
        commit({ ...state, step: 'q1' });
      });
    } else if (state.step === 'q3') {
      withLock(() => {
        shouldFocusRef.current = true;
        commit({ ...state, step: 'q2' });
      });
    }
  };

  const skip = () => {
    withLock(() => {
      finish(INITIAL_STATE.answers, true);
    });
  };

  const changeAnswers = () => {
    markStarted();
    withLock(() => {
      shouldFocusRef.current = true;
      commit({ ...state, step: 'q1' });
    });
  };

  const restart = () => {
    withLock(() => {
      clearJourney();
      completedRef.current = false;
      startedRef.current = false;
      setLimitMessage(false);
      commit(INITIAL_STATE);
    });
  };

  const registerTrigger = (id: string) => (element: HTMLButtonElement | null) => {
    triggerRefs.current[id] = element;
  };

  const openDirection = (id: string) => {
    commit({ ...state, openedDirectionId: id });
    track('direction_open', { directionId: id, uiVersion });
  };

  const closeDirection = () => {
    const id = state.openedDirectionId;
    commit({ ...state, openedDirectionId: null });
    if (id) {
      window.setTimeout(() => {
        triggerRefs.current[id]?.focus();
      }, 80);
    }
  };

  const activeCategory: CategoryId | undefined = (() => {
    const ids = state.answers.interestIds;
    const last = ids[ids.length - 1];
    return last ? (categoryOfInterest(last) ?? undefined) : undefined;
  })();

  const selectedCategories = CATEGORY_ORDER.filter((category) => {
    const fromInterests = state.answers.interestIds.some(
      (id) => categoryOfInterest(id) === category,
    );
    const fromProject = state.answers.projectId
      ? categoryOfProject(state.answers.projectId) === category
      : false;
    return fromInterests || fromProject;
  });

  const onSceneSelect = (category: CategoryId) => {
    if (state.step === 'results') return;
    const option = questions.q1.options.find((item) => item.category === category);
    if (option) toggleInterest(option.id);
  };

  const skippedResult = state.skipped === true;

  return (
    <section id="interests" className="section" aria-labelledby="interests-heading">
      <div className="container">
        <div className="section-head vp-interest-head">
          <h2 id="interests-heading" tabIndex={-1} className="h2">
            Начнём с того, что тебе интересно
          </h2>
          <p className="lead">
            Ответь на три коротких вопроса. Покажем несколько направлений, с которыми можно
            познакомиться
          </p>
          <button type="button" className="link-arrow vp-interest-skip" onClick={skip}>
            Посмотреть примеры без вопросов
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>

        <div id="directions" className="vp-interest-layout">
          <div className="vp-interest-panel">
            <div aria-live="polite" className="visually-hidden">
              {state.step === 'results' ? 'Подборка готова: показаны 3 направления' : ''}
            </div>

            {state.step === 'idle' ? (
              <div className="vp-interest-start vp-interest-step">
                <h3 className="vp-interest-start-title">
                  Три вопроса — и покажем направления для знакомства
                </h3>
                <p className="vp-interest-start-text">
                  Это редакционная подборка по твоим интересам: ответы можно менять, а смотреть
                  примеры — без регистрации.
                </p>
                <div className="cta-row">
                  <button type="button" className="btn btn--primary" onClick={startExperience}>
                    Начать подборку
                    <span className="btn-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            ) : null}

            {state.step === 'q1' || state.step === 'q2' || state.step === 'q3' ? (
              <QuestionPanel
                key={state.step}
                step={state.step}
                answers={state.answers}
                limitMessage={limitMessage}
                busy={busy}
                headingRef={headingRef}
                onToggleInterest={toggleInterest}
                onSelectProject={selectProject}
                onSelectGoal={selectGoal}
                onNext={next}
                onBack={back}
              />
            ) : null}

            {state.step === 'results' && state.resultIds ? (
              <DirectionResults
                result={{
                  directionIds: state.resultIds,
                  mixed: state.mixed,
                  topCategories: [],
                  skipped: skippedResult,
                }}
                goalId={state.answers.goalId}
                headingRef={resultsHeadingRef}
                registerTrigger={registerTrigger}
                onOpen={openDirection}
                onChangeAnswers={changeAnswers}
                onRestart={restart}
                onAnswerQuestions={changeAnswers}
              />
            ) : null}
          </div>

          <div className="vp-interest-scene">
            <CompassScene
              mode={state.step === 'results' ? 'result' : 'selection'}
              selectedCategories={selectedCategories}
              activeCategory={activeCategory}
              reducedMotion={reducedMotion}
              onInterestSelect={onSceneSelect}
            />
          </div>
        </div>
      </div>

      <DirectionDialog
        direction={state.openedDirectionId ? directionById(state.openedDirectionId) : null}
        goalId={state.answers.goalId}
        onClose={closeDirection}
      />
    </section>
  );
}
