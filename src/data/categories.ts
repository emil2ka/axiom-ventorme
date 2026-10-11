import type { CategoryId } from '../lib/types';

export const CATEGORY_ORDER: CategoryId[] = [
  'technology',
  'creativity',
  'research',
  'people',
  'organization',
];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  technology: 'Технологии',
  creativity: 'Творчество',
  research: 'Исследования',
  people: 'Люди',
  organization: 'Организация',
};

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  technology: '#8BA4FF',
  creativity: '#B79BFF',
  research: '#85E2C9',
  people: '#F1C68A',
  organization: '#F0A6C0',
};

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && (CATEGORY_ORDER as string[]).includes(value);
}
