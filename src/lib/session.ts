import type { CategoryId, JourneyState } from './types';

const JOURNEY_KEY = 'vp:journey:v1';
const PENDING_CATEGORY_KEY = 'vp:pending-category';

const CATEGORY_IDS: CategoryId[] = [
  'technology',
  'creativity',
  'research',
  'people',
  'organization',
];

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    return;
  }
}

function safeRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    return;
  }
}

export function saveJourney(state: JourneyState): void {
  safeSet(JOURNEY_KEY, JSON.stringify(state));
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vp:journey', { detail: state }));
    }
  } catch {
    return;
  }
}

export function loadJourney(): JourneyState | null {
  const raw = safeGet(JOURNEY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    if (!parsed || typeof parsed !== 'object') return null;
    const steps = ['idle', 'q1', 'q2', 'q3', 'results'];
    if (typeof parsed.step !== 'string' || !steps.includes(parsed.step)) return null;
    const rawAnswers = parsed.answers;
    if (!rawAnswers || typeof rawAnswers !== 'object') return null;
    if (!Array.isArray(rawAnswers.interestIds)) return null;
    const answers = {
      interestIds: rawAnswers.interestIds
        .filter((id): id is string => typeof id === 'string')
        .slice(0, 2),
      projectId: typeof rawAnswers.projectId === 'string' ? rawAnswers.projectId : null,
      goalId:
        rawAnswers.goalId === 'professions' ||
        rawAnswers.goalId === 'try' ||
        rawAnswers.goalId === 'nextstep'
          ? rawAnswers.goalId
          : null,
    };
    const resultIds = Array.isArray(parsed.resultIds)
      ? parsed.resultIds.filter((id): id is string => typeof id === 'string')
      : null;
    return {
      step: parsed.step as JourneyState['step'],
      answers,
      resultIds,
      mixed: parsed.mixed === true,
      skipped: parsed.skipped === true,
      openedDirectionId: null,
    };
  } catch {
    return null;
  }
}

export function clearJourney(): void {
  safeRemove(JOURNEY_KEY);
}

export function setPendingCategory(category: CategoryId): void {
  if (CATEGORY_IDS.includes(category)) {
    safeSet(PENDING_CATEGORY_KEY, category);
  }
}

export function takePendingCategory(): CategoryId | null {
  const raw = safeGet(PENDING_CATEGORY_KEY);
  safeRemove(PENDING_CATEGORY_KEY);
  if (raw && (CATEGORY_IDS as string[]).includes(raw)) {
    return raw as CategoryId;
  }
  return null;
}
