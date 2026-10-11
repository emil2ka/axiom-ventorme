export const DURATION = {
  press: 0.12,
  hover: 0.18,
  reveal: 0.24,
  question: 0.28,
  card: 0.4,
  section: 0.48,
  route: 0.8,
  ambient: 20,
} as const;

export const EASE_OUT: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
export const EASE_INOUT: [number, number, number, number] = [0.45, 0.05, 0.55, 0.95];

export const SPRING_SOFT = {
  type: 'spring',
  stiffness: 240,
  damping: 28,
  mass: 0.9,
} as const;

export const MICRO = {
  shiftQuestion: 18,
  shiftQuestionMobile: 10,
  shiftSection: 12,
  arrowShift: 3,
  tiltMax: 4,
  lightShiftMax: 16,
  pressScale: 0.985,
} as const;
