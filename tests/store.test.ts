import { describe, expect, it, vi } from 'vitest';

async function freshStore() {
  vi.resetModules();
  return import('../src/lib/journeyStore');
}

const ANSWERS_COMPLETE = {
  interestIds: ['interest-tech'],
  projectId: 'project-page',
  goalId: 'try' as const,
};

describe('journeyStore', () => {
  it('hero-ветка до mount: выбор из initial сразу открывает q1', async () => {
    const store = await freshStore();
    const next = store.dispatchJourney({ type: 'branchSelect', category: 'creativity' });
    expect(next.phase).toBe('questions');
    expect(next.step).toBe('q1');
    expect(next.draft.interestIds).toEqual(['interest-create']);
  });

  it('третий интерес через ветку: не меняет данные, показывает запрошенную категорию', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'branchSelect', category: 'technology' });
    store.dispatchJourney({ type: 'branchSelect', category: 'creativity' });
    const next = store.dispatchJourney({ type: 'branchSelect', category: 'research' });
    expect(next.draft.interestIds).toHaveLength(2);
    expect(next.requestedCategory).toBe('research');
    expect(next.step).toBe('q1');
  });

  it('полный первый проход даёт персональный результат с тремя направлениями', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'start' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-tech' });
    store.dispatchJourney({ type: 'next' });
    expect(store.getJourney().step).toBe('q2');
    store.dispatchJourney({ type: 'selectProject', id: 'project-data' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectGoal', id: 'nextstep' });
    const next = store.dispatchJourney({ type: 'next' });
    expect(next.phase).toBe('result');
    expect(next.resultMode).toBe('personal');
    expect(next.resultIds).toHaveLength(3);
    expect(next.committed.projectId).toBe('project-data');
    expect(next.draft).toEqual(next.committed);
  });

  it('next без ответов не пропускает шаг', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'start' });
    const next = store.dispatchJourney({ type: 'next' });
    expect(next.step).toBe('q1');
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-people' });
    const second = store.dispatchJourney({ type: 'next' });
    expect(second.step).toBe('q2');
  });

  it('demo нейтрален: общие примеры и отдельный режим', async () => {
    const store = await freshStore();
    const next = store.dispatchJourney({ type: 'openDemo' });
    expect(next.phase).toBe('demo');
    expect(next.resultMode).toBe('demo');
    expect(next.resultIds).toBeNull();
    expect(next.draft.interestIds).toEqual([]);
  });

  it('edit: черновик, отмена и атомарный коммит', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'start' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-tech' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectProject', id: 'project-page' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectGoal', id: 'try' });
    store.dispatchJourney({ type: 'next' });

    const editing = store.dispatchJourney({ type: 'edit' });
    expect(editing.phase).toBe('questions');
    expect(editing.mode).toBe('edit');
    expect(editing.draft).toEqual(editing.committed);

    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-tech' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-research' });
    const cancelled = store.dispatchJourney({ type: 'cancelEdit' });
    expect(cancelled.phase).toBe('result');
    expect(cancelled.mode).toBe('first');
    expect(cancelled.committed.interestIds).toEqual(['interest-tech']);

    store.dispatchJourney({ type: 'edit' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-tech' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-research' });
    const committed = store.dispatchJourney({ type: 'commitEdit' });
    expect(committed.phase).toBe('result');
    expect(committed.committed.interestIds).toContain('interest-research');
  });

  it('результат: ветка из hero открывает edit с черновиком', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'start' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-tech' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectProject', id: 'project-page' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectGoal', id: 'try' });
    store.dispatchJourney({ type: 'next' });

    const branch = store.dispatchJourney({ type: 'branchSelect', category: 'creativity' });
    expect(branch.mode).toBe('edit');
    expect(branch.step).toBe('q1');
    expect(branch.draft.interestIds).toEqual(['interest-tech', 'interest-create']);
  });

  it('demo не затирает персональный результат, отмена возвращает к нему', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'start' });
    store.dispatchJourney({ type: 'toggleInterest', id: 'interest-tech' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectProject', id: 'project-page' });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectGoal', id: 'try' });
    const personal = store.dispatchJourney({ type: 'next' });
    expect(personal.resultIds).toHaveLength(3);

    const demo = store.dispatchJourney({ type: 'openDemo' });
    expect(demo.phase).toBe('demo');
    expect(demo.resultIds).toEqual(personal.resultIds);

    store.dispatchJourney({ type: 'answerFromDemo' });
    expect(store.getJourney().mode).toBe('edit');
    const cancelled = store.dispatchJourney({ type: 'cancelEdit' });
    expect(cancelled.phase).toBe('result');
    expect(cancelled.resultIds).toEqual(personal.resultIds);
  });

  it('openDetail принимает только id актуального результата', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'openDetail', id: 'ux-ui' });
    expect(store.getJourney().openedDirectionId).toBeNull();
    store.dispatchJourney({ type: 'openDemo' });
    store.dispatchJourney({ type: 'openDetail', id: 'ux-ui' });
    expect(store.getJourney().openedDirectionId).toBe('ux-ui');
    store.dispatchJourney({ type: 'closeDetail' });
    expect(store.getJourney().openedDirectionId).toBeNull();
  });

  it('restart очищает ответы, результат и диалог', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'openDemo' });
    store.dispatchJourney({ type: 'openDetail', id: 'ux-ui' });
    const next = store.dispatchJourney({ type: 'restart' });
    expect(next.phase).toBe('initial');
    expect(next.resultIds).toBeNull();
    expect(next.openedDirectionId).toBeNull();
    expect(next.requestedCategory).toBeNull();
    expect(next.committed).toEqual({ interestIds: [], projectId: null, goalId: null });
  });

  it('persistence: состояние переживает повторную загрузку модуля, диалог — нет', async () => {
    const map = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
    });
    try {
      const store = await freshStore();
      store.dispatchJourney({ type: 'openDemo' });
      store.dispatchJourney({ type: 'openDetail', id: 'ux-ui' });
      const reloaded = await freshStore();
      const state = reloaded.getJourney();
      expect(state.phase).toBe('demo');
      expect(state.resultMode).toBe('demo');
      expect(state.openedDirectionId).toBeNull();
      reloaded.dispatchJourney({ type: 'restart' });
      const after = await freshStore();
      expect(after.getJourney().phase).toBe('initial');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('битое хранилище не ломает store', async () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => '{oops',
      setItem: () => undefined,
      removeItem: () => undefined,
    });
    try {
      const store = await freshStore();
      expect(store.getJourney().phase).toBe('initial');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('полный валидный набор ответов совпадает с ANSWERS_COMPLETE', async () => {
    const store = await freshStore();
    store.dispatchJourney({ type: 'start' });
    for (const id of ANSWERS_COMPLETE.interestIds) {
      store.dispatchJourney({ type: 'toggleInterest', id });
    }
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectProject', id: ANSWERS_COMPLETE.projectId });
    store.dispatchJourney({ type: 'next' });
    store.dispatchJourney({ type: 'selectGoal', id: ANSWERS_COMPLETE.goalId });
    const next = store.dispatchJourney({ type: 'next' });
    expect(next.committed.goalId).toBe('try');
    expect(next.mixed).toBe(false);
  });
});
