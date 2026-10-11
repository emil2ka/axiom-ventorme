export type CategoryId =
  | 'technology'
  | 'creativity'
  | 'research'
  | 'people'
  | 'organization';

export type CompassMode = 'hero' | 'selection' | 'result' | 'final';

export type CompassSceneProps = {
  mode: CompassMode;
  selectedCategories: CategoryId[];
  activeCategory?: CategoryId;
  reducedMotion: boolean;
  onInterestSelect?: (category: CategoryId) => void;
  className?: string;
};

export type GoalId = 'professions' | 'try' | 'nextstep';

export type JourneyStep = 'idle' | 'q1' | 'q2' | 'q3' | 'results';

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

export type JourneyState = {
  step: JourneyStep;
  answers: Answers;
  resultIds: string[] | null;
  mixed: boolean;
  skipped?: boolean;
  openedDirectionId: string | null;
};

export type EventName =
  | 'experience_start'
  | 'question_complete'
  | 'experience_complete'
  | 'experience_skip'
  | 'direction_open'
  | 'registration_click'
  | 'faq_open'
  | 'motion_reduced';
