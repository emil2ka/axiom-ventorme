import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import QuestionPanel from '../src/components/QuestionPanel';
import DirectionResults from '../src/components/DirectionResults';
import FutureAtlas from '../src/components/scene/FutureAtlas';
import FinalScene from '../src/components/FinalScene';
import { questions } from '../src/data/questions';
import type { JourneyState } from '../src/lib/types';

const noop = () => {};
const ref = { current: null };

const baseJourney: JourneyState = {
  version: 2,
  phase: 'questions',
  step: 'q1',
  mode: 'first',
  draft: { interestIds: [], projectId: null, goalId: null },
  committed: { interestIds: [], projectId: null, goalId: null },
  resultIds: null,
  resultMode: null,
  mixed: false,
  openedDirectionId: null,
  requestedCategory: null,
  previewCategory: null,
};

const resultJourney: JourneyState = {
  ...baseJourney,
  phase: 'result',
  step: 'q3',
  draft: { interestIds: ['interest-tech'], projectId: 'project-page', goalId: 'try' },
  committed: { interestIds: ['interest-tech'], projectId: 'project-page', goalId: 'try' },
  resultIds: ['ux-ui', 'web-dev', 'game-dev'],
  resultMode: 'personal',
};

const demoJourney: JourneyState = {
  ...baseJourney,
  phase: 'demo',
  resultIds: ['ux-ui', 'data-analysis', 'event-org'],
  resultMode: 'demo',
};

describe('Редизайн: SSR-смоук', () => {
  it('QuestionPanel q1 показывает все пять интересов и лимит', () => {
    const html = renderToStaticMarkup(
      <QuestionPanel
        journey={baseJourney}
        busy={false}
        limitMessage={false}
        headingRef={ref}
        onToggleInterest={noop}
        onSelectProject={noop}
        onSelectGoal={noop}
        onNext={noop}
        onBack={noop}
        onCancelEdit={noop}
        onClearRequested={noop}
      />,
    );
    for (const option of questions.q1.options) {
      expect(html).toContain(option.label);
    }
    expect(html).toContain('Выбери до двух интересов');
    expect(html).toContain('Вопрос 1 из 3');
  });

  it('QuestionPanel в режиме edit показывает баннер и отмену', () => {
    const html = renderToStaticMarkup(
      <QuestionPanel
        journey={{ ...resultJourney, phase: 'questions', mode: 'edit' }}
        busy={false}
        limitMessage={false}
        headingRef={ref}
        onToggleInterest={noop}
        onSelectProject={noop}
        onSelectGoal={noop}
        onNext={noop}
        onBack={noop}
        onCancelEdit={noop}
        onClearRequested={noop}
      />,
    );
    expect(html).toContain('Редактирование ответов');
    expect(html).toContain('Отменить изменения');
  });

  it('DirectionResults: причина, один preview-акцент и CTA', () => {
    const html = renderToStaticMarkup(
      <DirectionResults
        journey={resultJourney}
        headingRef={ref}
        registerTrigger={() => () => {}}
        onOpen={noop}
        onEdit={noop}
        onRestart={noop}
        onAnswerFromDemo={noop}
      />,
    );
    expect(html).toContain('Связано с твоим интересом');
    expect(html).toContain('Что можно делать:');
    expect(html.match(/Подробнее/g)?.length).toBe(3);
    expect(html).toContain('Зарегистрироваться в Ventorme');
    expect(html).toContain('Изменить ответы');
    expect(html).toContain('Начать заново');
  });

  it('DirectionResults: demo помечен как примеры', () => {
    const html = renderToStaticMarkup(
      <DirectionResults
        journey={demoJourney}
        headingRef={ref}
        registerTrigger={() => () => {}}
        onOpen={noop}
        onEdit={noop}
        onRestart={noop}
        onAnswerFromDemo={noop}
      />,
    );
    expect(html).toContain('Примеры');
    expect(html).toContain('Ответить на вопросы');
    expect(html).not.toContain('Связано с твоим интересом');
  });

  it('FutureAtlas SSR: poster и пять кнопок-веток без WebGL', () => {
    const html = renderToStaticMarkup(<FutureAtlas />);
    expect(html).toContain('vp-atlas-poster');
    expect(html.match(/class="vp-atlas-label"/g)?.length).toBe(5);
    expect(html).toContain('выбрать интерес');
  });

  it('FinalScene SSR: маршрут, заголовок и CTA', () => {
    const html = renderToStaticMarkup(<FinalScene />);
    expect(html).toContain('Не нужно решать всё сегодня');
    expect(html).toContain('Зарегистрироваться в Ventorme');
    expect(html).toContain('vp-final-ribbon');
  });
});
