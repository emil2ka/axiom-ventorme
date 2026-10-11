import { questions } from '../data/questions';
import { recommendResults } from './recommend';
import { safeGet, safeRemove, safeSet } from './storage';
import { track } from './events';
import type {
  Answers,
  CategoryId,
  GoalId,
  JourneyMode,
  JourneyState,
  JourneyStep,
  Phase,
  ResultMode,
} from './types';

const KEY = 'vp:journey:v2';
const UI_VERSION = '2';

export type JourneyAction =
  | { type: 'start' }
  | { type: 'branchSelect'; category: CategoryId }
  | { type: 'previewCategory'; category: CategoryId | null }
  | { type: 'toggleInterest'; id: string }
  | { type: 'clearRequested' }
  | { type: 'selectProject'; id: string }
  | { type: 'selectGoal'; id: GoalId }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'finish' }
  | { type: 'openDemo' }
  | { type: 'answerFromDemo' }
  | { type: 'edit' }
  | { type: 'commitEdit' }
  | { type: 'cancelEdit' }
  | { type: 'restart' }
  | { type: 'openDetail'; id: string }
  | { type: 'closeDetail' };

export function emptyAnswers(): Answers {
  return { interestIds: [], projectId: null, goalId: null };
}

function cloneAnswers(answers: Answers): Answers {
  return {
    interestIds: [...answers.interestIds],
    projectId: answers.projectId,
    goalId: answers.goalId,
  };
}

function initialState(): JourneyState {
  return {
    version: 2,
    phase: 'initial',
    step: 'q1',
    mode: 'first',
    draft: emptyAnswers(),
    committed: emptyAnswers(),
    resultIds: null,
    resultMode: null,
    mixed: false,
    openedDirectionId: null,
    requestedCategory: null,
    previewCategory: null,
  };
}

function sanitizeAnswers(value: unknown): Answers {
  const raw = (value ?? {}) as Record<string, unknown>;
  const goal = raw.goalId;
  return {
    interestIds: Array.isArray(raw.interestIds)
      ? raw.interestIds.filter((id): id is string => typeof id === 'string').slice(0, 2)
      : [],
    projectId: typeof raw.projectId === 'string' ? raw.projectId : null,
    goalId: goal === 'professions' || goal === 'try' || goal === 'nextstep' ? goal : null,
  };
}

function sanitize(value: unknown): JourneyState | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (raw.version !== 2) return null;
  const phase = raw.phase;
  if (
    typeof phase !== 'string' ||
    !['initial', 'questions', 'result', 'demo'].includes(phase)
  ) {
    return null;
  }
  const steps: string[] = ['q1', 'q2', 'q3'];
  const step = typeof raw.step === 'string' && steps.includes(raw.step) ? raw.step : 'q1';
  const base = initialState();
  return {
    ...base,
    phase: phase as Phase,
    step: step as JourneyStep,
    mode: raw.mode === 'edit' ? 'edit' : 'first',
    draft: sanitizeAnswers(raw.draft),
    committed: sanitizeAnswers(raw.committed),
    resultIds: Array.isArray(raw.resultIds)
      ? raw.resultIds.filter((id): id is string => typeof id === 'string')
      : null,
    resultMode: raw.resultMode === 'personal' || raw.resultMode === 'demo' ? raw.resultMode : null,
    mixed: raw.mixed === true,
  };
}

function load(): JourneyState {
  const raw = safeGet(KEY);
  if (!raw) return initialState();
  try {
    return sanitize(JSON.parse(raw)) ?? initialState();
  } catch {
    return initialState();
  }
}

function persist(state: JourneyState): void {
  const payload = {
    version: state.version,
    phase: state.phase,
    step: state.step,
    mode: state.mode,
    draft: state.draft,
    committed: state.committed,
    resultIds: state.resultIds,
    resultMode: state.resultMode,
    mixed: state.mixed,
  };
  safeSet(KEY, JSON.stringify(payload));
}

let state: JourneyState = load();
const listeners = new Set<(next: JourneyState) => void>();

export function getJourney(): JourneyState {
  return state;
}

export function subscribeJourney(listener: (next: JourneyState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of [...listeners]) {
    try {
      listener(state);
    } catch {
      return;
    }
  }
}

function set(next: JourneyState, persistState = true): JourneyState {
  state = next;
  if (persistState) persist(state);
  emit();
  return state;
}

export function optionIdForCategory(category: CategoryId): string | null {
  const option = questions.q1.options.find((item) => item.category === category);
  return option ? option.id : null;
}

function hasAnyAnswers(answers: Answers): boolean {
  return answers.interestIds.length > 0 || answers.projectId !== null;
}

function isComplete(answers: Answers): boolean {
  return (
    answers.interestIds.length > 0 && answers.projectId !== null && answers.goalId !== null
  );
}

function enterQuestions(prev: JourneyState, patch: Partial<JourneyState>): JourneyState {
  return set({
    ...prev,
    phase: 'questions',
    openedDirectionId: null,
    previewCategory: null,
    ...patch,
  });
}

function finish(previous: JourneyState, answers: Answers, mode: ResultMode): JourneyState {
  const result = recommendResults(answers);
  track('experience_complete', {
    mixed: result.mixed,
    skipped: result.skipped,
    uiVersion: UI_VERSION,
  });
  return set({
    ...previous,
    phase: 'result',
    step: 'q3',
    mode: 'first',
    committed: cloneAnswers(answers),
    draft: cloneAnswers(answers),
    resultIds: result.directionIds,
    resultMode: mode,
    mixed: result.mixed,
    openedDirectionId: null,
    requestedCategory: null,
  });
}

export function dispatchJourney(action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'start': {
      if (state.phase === 'initial') {
        track('experience_start', { uiVersion: UI_VERSION });
        return enterQuestions(state, { step: 'q1', mode: 'first' });
      }
      return state;
    }

    case 'branchSelect': {
      const optionId = optionIdForCategory(action.category);
      if (!optionId) return state;
      track('hero_branch', { category: action.category, uiVersion: UI_VERSION });

      if (state.phase === 'initial') {
        track('experience_start', { uiVersion: UI_VERSION });
        return enterQuestions(state, {
          step: 'q1',
          mode: 'first',
          draft: { ...state.draft, interestIds: [optionId] },
          requestedCategory: null,
        });
      }

      if (state.phase === 'questions' && state.mode === 'first') {
        const ids = state.draft.interestIds;
        if (ids.includes(optionId)) {
          return set({ ...state, step: 'q1', requestedCategory: null, previewCategory: null });
        }
        if (ids.length >= 2) {
          return set({ ...state, step: 'q1', requestedCategory: action.category });
        }
        return set({
          ...state,
          step: 'q1',
          requestedCategory: null,
          previewCategory: null,
          draft: { ...state.draft, interestIds: [...ids, optionId] },
        });
      }

      if (state.phase === 'questions' && state.mode === 'edit') {
        const ids = state.draft.interestIds;
        if (ids.includes(optionId)) {
          return set({ ...state, step: 'q1', requestedCategory: null, previewCategory: null });
        }
        if (ids.length >= 2) {
          return set({ ...state, step: 'q1', requestedCategory: action.category });
        }
        return set({
          ...state,
          step: 'q1',
          requestedCategory: null,
          previewCategory: null,
          draft: { ...state.draft, interestIds: [...ids, optionId] },
        });
      }

      const base: JourneyState = {
        ...state,
        phase: 'questions',
        mode: 'edit',
        draft: cloneAnswers(state.committed),
        openedDirectionId: null,
        previewCategory: null,
      };
      const ids = base.draft.interestIds;
      if (ids.includes(optionId)) {
        return set({ ...base, step: 'q1', requestedCategory: null });
      }
      if (ids.length >= 2) {
        return set({ ...base, step: 'q1', requestedCategory: action.category });
      }
      return set({
        ...base,
        step: 'q1',
        requestedCategory: null,
        draft: { ...base.draft, interestIds: [...ids, optionId] },
      });
    }

    case 'previewCategory': {
      if (state.phase !== 'initial' && state.phase !== 'questions') return state;
      return set({ ...state, previewCategory: action.category }, false);
    }

    case 'toggleInterest': {
      let base = state;
      if (base.phase !== 'questions') {
        if (base.phase === 'initial') {
          track('experience_start', { uiVersion: UI_VERSION });
          base = { ...base, phase: 'questions', mode: 'first' };
        } else {
          base = {
            ...base,
            phase: 'questions',
            mode: 'edit',
            draft: cloneAnswers(state.committed),
          };
        }
      }
      const ids = base.draft.interestIds;
      if (ids.includes(action.id)) {
        return set({
          ...base,
          step: 'q1',
          requestedCategory: null,
          draft: { ...base.draft, interestIds: ids.filter((id) => id !== action.id) },
        });
      }
      if (ids.length >= 2) {
        return set({ ...base, step: 'q1', requestedCategory: null });
      }
      return set({
        ...base,
        step: 'q1',
        requestedCategory: null,
        draft: { ...base.draft, interestIds: [...ids, action.id] },
      });
    }

    case 'clearRequested': {
      if (!state.requestedCategory) return state;
      return set({ ...state, requestedCategory: null });
    }

    case 'selectProject': {
      if (state.phase !== 'questions') return state;
      return set({ ...state, draft: { ...state.draft, projectId: action.id } });
    }

    case 'selectGoal': {
      if (state.phase !== 'questions') return state;
      return set({ ...state, draft: { ...state.draft, goalId: action.id } });
    }

    case 'next': {
      if (state.phase !== 'questions') return state;
      if (state.step === 'q1') {
        if (state.draft.interestIds.length === 0) return state;
        track('question_complete', { step: 'q1', uiVersion: UI_VERSION });
        return set({ ...state, step: 'q2', requestedCategory: null });
      }
      if (state.step === 'q2') {
        if (!state.draft.projectId) return state;
        track('question_complete', { step: 'q2', uiVersion: UI_VERSION });
        return set({ ...state, step: 'q3' });
      }
      if (state.step === 'q3') {
        if (!state.draft.goalId) return state;
        track('question_complete', { step: 'q3', uiVersion: UI_VERSION });
        return finish(state, state.draft, 'personal');
      }
      return state;
    }

    case 'back': {
      if (state.phase !== 'questions') return state;
      if (state.step === 'q2') return set({ ...state, step: 'q1' });
      if (state.step === 'q3') return set({ ...state, step: 'q2' });
      return state;
    }

    case 'finish': {
      if (state.phase !== 'questions' || !isComplete(state.draft)) return state;
      return finish(state, state.draft, 'personal');
    }

    case 'openDemo': {
      track('experience_skip', { uiVersion: UI_VERSION });
      return set({
        ...state,
        phase: 'demo',
        resultMode: 'demo',
        mixed: false,
        openedDirectionId: null,
        requestedCategory: null,
      });
    }

    case 'answerFromDemo': {
      const base: JourneyState = hasAnyAnswers(state.committed)
        ? { ...state, mode: 'edit' as JourneyMode, draft: cloneAnswers(state.committed) }
        : { ...state, mode: 'first' as JourneyMode };
      return enterQuestions(base, { step: 'q1' });
    }

    case 'edit': {
      if (state.phase !== 'result' && state.phase !== 'demo') return state;
      track('experience_start', { uiVersion: UI_VERSION, resumed: true });
      return set({
        ...state,
        phase: 'questions',
        mode: 'edit',
        step: 'q1',
        draft: cloneAnswers(state.committed),
        openedDirectionId: null,
        requestedCategory: null,
      });
    }

    case 'commitEdit': {
      if (state.phase !== 'questions' || !isComplete(state.draft)) return state;
      return finish(state, state.draft, 'personal');
    }

    case 'cancelEdit': {
      if (state.phase !== 'questions' || state.mode !== 'edit') return state;
      return set({
        ...state,
        phase: state.resultIds ? 'result' : 'demo',
        mode: 'first',
        step: 'q3',
        draft: cloneAnswers(state.committed),
        requestedCategory: null,
      });
    }

    case 'restart': {
      safeRemove(KEY);
      return set(initialState(), false);
    }

    case 'openDetail': {
      const available =
        state.phase === 'demo' ? recommendResults(emptyAnswers()).directionIds : state.resultIds;
      if (!available || !available.includes(action.id)) return state;
      return set({ ...state, openedDirectionId: action.id }, false);
    }

    case 'closeDetail': {
      if (!state.openedDirectionId) return state;
      return set({ ...state, openedDirectionId: null }, false);
    }

    default:
      return state;
  }
}
