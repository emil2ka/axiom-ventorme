import { describe, expect, it } from 'vitest';
import { recommendResults } from '../src/lib/recommend';
import { questions } from '../src/data/questions';
import { directions, generalPicks } from '../src/data/directions';
import type { Answers, GoalId } from '../src/lib/types';

const validIds = new Set(directions.map((direction) => direction.id));
const interestIds = questions.q1.options.map((option) => option.id);
const projectIds = questions.q2.options.map((option) => option.id);
const goalIds = questions.q3.options.map((option) => option.id) as GoalId[];

function combinations(): Array<{ interestIds: string[]; projectId: string; goalId: GoalId }> {
  const pairs: string[][] = [];
  for (let i = 0; i < interestIds.length; i += 1) {
    pairs.push([interestIds[i]]);
    for (let j = i + 1; j < interestIds.length; j += 1) {
      pairs.push([interestIds[i], interestIds[j]]);
    }
  }
  const result: Array<{ interestIds: string[]; projectId: string; goalId: GoalId }> = [];
  for (const pair of pairs) {
    for (const projectId of projectIds) {
      for (const goalId of goalIds) {
        result.push({ interestIds: pair, projectId, goalId });
      }
    }
  }
  return result;
}

describe('recommendResults', () => {
  it('для всех 225 допустимых комбинаций даёт 3 уникальных существующих направления', () => {
    const combos = combinations();
    expect(combos.length).toBe(225);
    for (const combo of combos) {
      const answers: Answers = {
        interestIds: combo.interestIds,
        projectId: combo.projectId,
        goalId: combo.goalId,
      };
      const result = recommendResults(answers);
      expect(result.directionIds).toHaveLength(3);
      expect(new Set(result.directionIds).size).toBe(3);
      for (const id of result.directionIds) {
        expect(validIds.has(id)).toBe(true);
      }
    }
  });

  it('детерминирован: повторные вызовы дают одинаковый результат', () => {
    const answers: Answers = {
      interestIds: [interestIds[0], interestIds[1]],
      projectId: projectIds[3],
      goalId: 'try',
    };
    const first = recommendResults(answers);
    const second = recommendResults(answers);
    expect(second).toEqual(first);
  });

  it('равенство категорий: mixed=true и подборка покрывает разные категории', () => {
    const answers: Answers = {
      interestIds: ['interest-tech', 'interest-create'],
      projectId: 'project-data',
      goalId: 'professions',
    };
    const result = recommendResults(answers);
    expect(result.mixed).toBe(true);
    expect(result.topCategories.length).toBeGreaterThanOrEqual(2);
    const picked = result.directionIds.map(
      (id) => directions.find((direction) => direction.id === id)!,
    );
    const covered = new Set(picked.flatMap((direction) => direction.categories));
    for (const category of result.topCategories) {
      expect(covered.has(category)).toBe(true);
    }
  });

  it('единственная ведущая категория даёт mixed=false и связанные направления', () => {
    const answers: Answers = {
      interestIds: ['interest-tech'],
      projectId: 'project-page',
      goalId: 'try',
    };
    const result = recommendResults(answers);
    expect(result.mixed).toBe(false);
    expect(result.topCategories).toEqual(['technology']);
    const picked = result.directionIds.map(
      (id) => directions.find((direction) => direction.id === id)!,
    );
    expect(picked[0].categories.includes('technology')).toBe(true);
  });

  it('пропуск вопросов: generalPicks без mixed', () => {
    const result = recommendResults({ interestIds: [], projectId: null, goalId: null });
    expect(result.skipped).toBe(true);
    expect(result.mixed).toBe(false);
    expect(result.directionIds).toEqual(generalPicks);
  });

  it('структура результата не содержит процентов и лишних полей', () => {
    const result = recommendResults({
      interestIds: [interestIds[2]],
      projectId: projectIds[2],
      goalId: 'nextstep',
    });
    expect(Object.keys(result).sort()).toEqual(
      ['directionIds', 'mixed', 'skipped', 'topCategories'].sort(),
    );
  });
});
