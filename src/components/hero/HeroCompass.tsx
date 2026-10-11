import { useCallback } from 'react';
import CompassScene from '../CompassScene';
import { setPendingCategory } from '../../lib/session';
import { useMotionPreference } from '../../lib/useMotionPreference';
import type { CategoryId } from '../../lib/types';

const EMPTY_CATEGORIES: CategoryId[] = [];

export default function HeroCompass() {
  const reducedMotion = useMotionPreference();

  const handleInterestSelect = useCallback(
    (category: CategoryId) => {
      setPendingCategory(category);
      const section = document.getElementById('interests');
      section?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      document.getElementById('interests-heading')?.focus({ preventScroll: true });
    },
    [reducedMotion],
  );

  return (
    <CompassScene
      mode="hero"
      selectedCategories={EMPTY_CATEGORIES}
      reducedMotion={reducedMotion}
      onInterestSelect={handleInterestSelect}
    />
  );
}
