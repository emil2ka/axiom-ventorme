import { useEffect, useRef, useState, type RefObject } from 'react';
import type { GoalId, JourneyState } from '../lib/types';
import { directionById } from '../data/directions';
import {
  dispatchJourney,
  getJourney,
  subscribeJourney,
} from '../lib/journeyStore';
import { track } from '../lib/events';
import { useMotionPreference } from '../lib/useMotionPreference';
import QuestionPanel from './QuestionPanel';
import DirectionResults from './DirectionResults';
import DirectionDialog from './DirectionDialog';
import BranchPanel from './interest/BranchPanel';
import './interest/interest.css';

export default function InterestExperience() {
  const [journey, setJourney] = useState<JourneyState>(() => getJourney());
  const [limitMessage, setLimitMessage] = useState(false);
  const [busy, setBusy] = useState(false);
  const reduced = useMotionPreference();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const lockRef = useRef(false);
  const navKeyRef = useRef('');
  const lastOpenedRef = useRef<string | null>(null);

  useEffect(() => subscribeJourney(setJourney), []);

  const minimalFocus = (element: HTMLElement | null) => {
    if (!element) return;
    element.focus({ preventScroll: true });
    const rect = element.getBoundingClientRect();
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
      ) || 76;
    if (rect.top < headerH + 16) {
      element.scrollIntoView({
        behavior: reducedRef.current ? 'auto' : 'smooth',
        block: 'start',
      });
    } else if (rect.bottom > window.innerHeight - 24) {
      element.scrollIntoView({
        behavior: reducedRef.current ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  };

  useEffect(() => {
    const key = `${journey.phase}:${journey.step}:${journey.mode}`;
    const previous = navKeyRef.current;
    navKeyRef.current = key;
    if (!previous) return;
    if (journey.phase === 'questions') minimalFocus(headingRef.current);
    else if (journey.phase === 'result' || journey.phase === 'demo')
      minimalFocus(resultsHeadingRef.current);
  }, [journey.phase, journey.step, journey.mode]);

  useEffect(() => {
    if (journey.openedDirectionId) {
      lastOpenedRef.current = journey.openedDirectionId;
      return;
    }
    const id = lastOpenedRef.current;
    if (id) {
      lastOpenedRef.current = null;
      window.setTimeout(() => triggerRefs.current[id]?.focus(), 60);
    }
  }, [journey.openedDirectionId]);

  const act = (action: () => void) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(true);
    action();
    window.setTimeout(() => {
      lockRef.current = false;
      setBusy(false);
    }, 300);
  };

  const toggleInterest = (id: string) => {
    const before = getJourney();
    const atLimit =
      before.draft.interestIds.length >= 2 && !before.draft.interestIds.includes(id);
    const next = dispatchJourney({ type: 'toggleInterest', id });
    const applied = next.draft.interestIds.includes(id);
    setLimitMessage(Boolean(atLimit && !applied));
  };

  const registerTrigger = (id: string) => (element: HTMLButtonElement | null) => {
    triggerRefs.current[id] = element;
  };

  const openDirection = (id: string) => {
    dispatchJourney({ type: 'openDetail', id });
    track('direction_open', { directionId: id, uiVersion: '2' });
  };

  const opened = journey.openedDirectionId
    ? directionById(journey.openedDirectionId)
    : null;

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
          <button
            type="button"
            className="link-arrow vp-interest-skip"
            onClick={() => dispatchJourney({ type: 'openDemo' })}
          >
            Посмотреть примеры без вопросов
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>

        <div id="directions" className="vp-interest-layout">
          <div className="vp-interest-panel">
            <div aria-live="polite" className="visually-hidden">
              {journey.phase === 'result'
                ? 'Подборка готова: показаны 3 направления'
                : journey.phase === 'demo'
                  ? 'Показаны примеры направлений'
                  : ''}
            </div>

            {journey.phase === 'initial' || journey.phase === 'questions' ? (
              <QuestionPanel
                key={`${journey.step}-${journey.mode}`}
                journey={journey}
                busy={busy}
                limitMessage={limitMessage}
                headingRef={headingRef as RefObject<HTMLHeadingElement | null>}
                onToggleInterest={toggleInterest}
                onSelectProject={(id) => {
                  setLimitMessage(false);
                  dispatchJourney({ type: 'selectProject', id });
                }}
                onSelectGoal={(id: GoalId) => {
                  setLimitMessage(false);
                  dispatchJourney({ type: 'selectGoal', id });
                }}
                onNext={() => act(() => dispatchJourney({ type: 'next' }))}
                onBack={() => act(() => dispatchJourney({ type: 'back' }))}
                onCancelEdit={() => act(() => dispatchJourney({ type: 'cancelEdit' }))}
                onClearRequested={() => dispatchJourney({ type: 'clearRequested' })}
              />
            ) : null}

            {journey.phase === 'result' || journey.phase === 'demo' ? (
              <DirectionResults
                journey={journey}
                headingRef={resultsHeadingRef as RefObject<HTMLHeadingElement | null>}
                registerTrigger={registerTrigger}
                onOpen={openDirection}
                onEdit={() => act(() => dispatchJourney({ type: 'edit' }))}
                onRestart={() =>
                  act(() => {
                    setLimitMessage(false);
                    dispatchJourney({ type: 'restart' });
                  })
                }
                onAnswerFromDemo={() => act(() => dispatchJourney({ type: 'answerFromDemo' }))}
              />
            ) : null}
          </div>

          <div className="vp-interest-scene">
            <BranchPanel />
          </div>
        </div>
      </div>

      <DirectionDialog
        direction={opened}
        goalId={journey.committed.goalId}
        onClose={() => dispatchJourney({ type: 'closeDetail' })}
      />
    </section>
  );
}
