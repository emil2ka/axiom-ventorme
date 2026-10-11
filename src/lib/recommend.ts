import type { Answers, CategoryId, RecommendationResult } from './types';
import { CATEGORY_ORDER } from '../data/categories';
import { categoryOfInterest, categoryOfProject } from '../data/questions';
import { directions, generalPicks } from '../data/directions';

export function categoryScores(answers: Answers): Record<CategoryId, number> {
  const scores: Record<CategoryId, number> = {
    technology: 0,
    creativity: 0,
    research: 0,
    people: 0,
    organization: 0,
  };
  for (const id of answers.interestIds) {
    const category = categoryOfInterest(id);
    if (category) scores[category] += 2;
  }
  if (answers.projectId) {
    const category = categoryOfProject(answers.projectId);
    if (category) scores[category] += 2;
  }
  return scores;
}

export function recommendResults(answers: Answers): RecommendationResult {
  const hasAnswers = answers.interestIds.length > 0 || answers.projectId !== null;
  if (!hasAnswers) {
    return {
      directionIds: [...generalPicks],
      mixed: false,
      topCategories: [],
      skipped: true,
    };
  }

  const scores = categoryScores(answers);
  const max = Math.max(...CATEGORY_ORDER.map((category) => scores[category]));
  const topCategories = CATEGORY_ORDER.filter(
    (category) => scores[category] === max && max > 0,
  );
  const mixed = topCategories.length > 1;

  const orderIndex = new Map(directions.map((direction, index) => [direction.id, index]));
  const byScore = [...directions].sort((a, b) => {
    const scoreA = a.categories.reduce((sum, category) => sum + scores[category], 0);
    const scoreB = b.categories.reduce((sum, category) => sum + scores[category], 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);
  });

  const picked: string[] = [];
  if (mixed) {
    for (const category of topCategories) {
      const candidate = byScore.find(
        (direction) => direction.categories.includes(category) && !picked.includes(direction.id),
      );
      if (candidate && picked.length < 3) picked.push(candidate.id);
    }
  }
  for (const direction of byScore) {
    if (picked.length >= 3) break;
    if (!picked.includes(direction.id)) picked.push(direction.id);
  }

  return {
    directionIds: picked.slice(0, 3),
    mixed,
    topCategories,
    skipped: false,
  };
}
