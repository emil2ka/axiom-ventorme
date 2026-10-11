import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import QuestionPanel from '../src/components/QuestionPanel';
import DirectionResults from '../src/components/DirectionResults';
import SelectionSummary from '../src/components/SelectionSummary';
import { recommendResults } from '../src/lib/recommend';
import { questions } from '../src/data/questions';

const noop = () => {};
const ref = { current: null };

describe('Подборка: SSR-смоук', () => {
  it('QuestionPanel q1 показывает все варианты интересов', () => {
    const html = renderToStaticMarkup(
      <QuestionPanel
        step="q1"
        answers={{ interestIds: [], projectId: null, goalId: null }}
        limitMessage={false}
        busy={false}
        headingRef={ref}
        onToggleInterest={noop}
        onSelectProject={noop}
        onSelectGoal={noop}
        onNext={noop}
        onBack={noop}
      />,
    );
    for (const option of questions.q1.options) {
      expect(html).toContain(option.label);
    }
    expect(html).toContain('Вопрос 1 из 3');
    expect(html).toContain('Назад');
    expect(html).toContain('Далее');
  });

  it('DirectionResults показывает три карточки, пояснение и CTA', () => {
    const result = recommendResults({
      interestIds: ['interest-tech', 'interest-create'],
      projectId: 'project-data',
      goalId: 'try',
    });
    const html = renderToStaticMarkup(
      <DirectionResults
        result={result}
        goalId="try"
        headingRef={ref}
        registerTrigger={() => () => {}}
        onOpen={noop}
        onChangeAnswers={noop}
        onRestart={noop}
        onAnswerQuestions={noop}
      />,
    );
    expect(html).toContain('Вот с чего можно начать');
    expect(html).toContain('Это подборка для знакомства по твоим ответам');
    expect(html).toContain('Зарегистрироваться в Ventorme');
    expect(html.match(/Посмотреть подробнее/g)?.length).toBe(3);
    expect(html).toContain('У тебя получилось несколько интересов');
  });

  it('SelectionSummary без ответов показывает пустое состояние', () => {
    const html = renderToStaticMarkup(<SelectionSummary />);
    expect(html).toContain('Пока не выбрано');
    expect(html).toContain('#interests');
  });
});
