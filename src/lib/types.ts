export type CategoryId =
  | 'technology'
  | 'creativity'
  | 'research'
  | 'people'
  | 'organization';

export type GoalId = 'professions' | 'try' | 'nextstep';

export type Phase = 'initial' | 'questions' | 'result' | 'demo';

export type JourneyStep = 'q1' | 'q2' | 'q3';

export type JourneyMode = 'first' | 'edit';

export type ResultMode = 'personal' | 'demo';

export type MotionMode = 'full' | 'reduced' | 'static';

export type InterestOption = {
  id: string;
  label: string;
  hint: string;
  category: CategoryId;
};

export type ProjectOption = {
  id: string;
  label: string;
  category: CategoryId;
};

export type GoalOption = {
  id: GoalId;
  label: string;
};

export type DirectionSymbol =
  | 'layers'
  | 'grid'
  | 'orbit'
  | 'chart'
  | 'path'
  | 'pulse'
  | 'spark'
  | 'route'
  | 'signal'
  | 'focus';

export type Direction = {
  id: string;
  title: string;
  summary: string;
  tasks: string[];
  tryNow: string;
  nextStep: string;
  categories: CategoryId[];
  symbol: DirectionSymbol;
};

export type Answers = {
  interestIds: string[];
  projectId: string | null;
  goalId: GoalId | null;
};

export type RecommendationResult = {
  directionIds: string[];
  mixed: boolean;
  topCategories: CategoryId[];
  skipped: boolean;
};

export type ExplainedItem = {
  id: string;
  matched: CategoryId[];
  reason: string;
};

export type JourneyState = {
  version: 2;
  phase: Phase;
  step: JourneyStep;
  mode: JourneyMode;
  draft: Answers;
  committed: Answers;
  resultIds: string[] | null;
  resultMode: ResultMode | null;
  mixed: boolean;
  openedDirectionId: string | null;
  requestedCategory: CategoryId | null;
  previewCategory: CategoryId | null;
};

export type SceneState = {
  phase: Phase;
  resultMode: ResultMode | null;
  activeCategories: CategoryId[];
  previewCategory: CategoryId | null;
  routeProgress: number;
  motion: MotionMode;
};

export type EventName =
  | 'experience_start'
  | 'question_complete'
  | 'experience_complete'
  | 'experience_skip'
  | 'direction_open'
  | 'registration_click'
  | 'faq_open'
  | 'features_tab_open'
  | 'motion_reduced'
  | 'hero_branch';
