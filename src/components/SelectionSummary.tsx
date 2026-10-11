import { useEffect, useState, type CSSProperties } from 'react';
import type { JourneyState } from '../lib/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '../data/categories';
import { categoryOfInterest, categoryOfProject } from '../data/questions';
import { directionById } from '../data/directions';
import { loadJourney } from '../lib/session';
import './interest/interest.css';

export default function SelectionSummary() {
  const [journey, setJourney] = useState<JourneyState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setJourney(loadJourney());
    setMounted(true);
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<JourneyState>).detail;
      setJourney(detail ?? loadJourney());
    };
    window.addEventListener('vp:journey', onChange);
    return () => window.removeEventListener('vp:journey', onChange);
  }, []);

  const answers = journey?.answers;
  const categories = CATEGORY_ORDER.filter((category) => {
    if (!answers) return false;
    const fromInterests = answers.interestIds.some((id) => categoryOfInterest(id) === category);
    const fromProject = answers.projectId ? categoryOfProject(answers.projectId) === category : false;
    return fromInterests || fromProject;
  });

  const resultDirections = (journey?.resultIds ?? [])
    .map((id) => directionById(id))
    .filter((direction) => direction !== null);

  const hasAnything = mounted && categories.length > 0;

  if (!hasAnything) {
    return (
      <div className="vp-summary">
        <p className="vp-summary-empty">Пока не выбрано — начни с подборки</p>
        <a className="link-arrow" href="#interests">
          К подборке
          <span className="btn-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    );
  }

  return (
    <div className="vp-summary">
      <span className="vp-summary-label">Выбранные интересы</span>
      <div className="vp-summary-chips">
        {categories.map((category) => (
          <span
            key={category}
            className="vp-direction-chip"
            style={{ '--chip-color': CATEGORY_COLORS[category] } as CSSProperties}
          >
            <span className="vp-direction-chip-dot" aria-hidden="true" />
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>

      {resultDirections.length > 0 ? (
        <>
          <span className="vp-summary-label">Направления подборки</span>
          <div className="vp-summary-list">
            {resultDirections.map((direction) => (
              <span
                key={direction.id}
                className="vp-summary-item"
                style={
                  {
                    '--item-color': CATEGORY_COLORS[direction.categories[0]],
                  } as CSSProperties
                }
              >
                <span className="vp-summary-item-dot" aria-hidden="true" />
                {direction.title}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="vp-summary-pending">Подборка ещё не собрана</p>
      )}
    </div>
  );
}
