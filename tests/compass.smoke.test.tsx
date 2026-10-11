import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import CompassScene from '../src/components/CompassScene';
import { CATEGORY_LABELS } from '../src/data/categories';

describe('CompassScene SSR', () => {
  it('hero: рендерит все пять подписей и кнопки', () => {
    const html = renderToStaticMarkup(
      <CompassScene mode="hero" selectedCategories={[]} reducedMotion={false} onInterestSelect={() => {}} />,
    );
    for (const label of Object.values(CATEGORY_LABELS)) {
      expect(html).toContain(label);
    }
    expect(html.match(/aria-pressed="false"/g)?.length).toBe(5);
    expect(html).toContain('выбрать интерес');
  });

  it('selection: отмечает выбранные категории', () => {
    const html = renderToStaticMarkup(
      <CompassScene
        mode="selection"
        selectedCategories={['technology', 'creativity']}
        activeCategory="technology"
        reducedMotion={false}
        onInterestSelect={() => {}}
      />,
    );
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(2);
  });

  it('result: рисует маршрут между выбранными узлами', () => {
    const html = renderToStaticMarkup(
      <CompassScene
        mode="result"
        selectedCategories={['technology', 'research']}
        reducedMotion={false}
      />,
    );
    expect(html).toContain('vp-compass-route');
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(2);
  });

  it('reduced motion: ставит data-атрибут и не ломает рендер', () => {
    const html = renderToStaticMarkup(
      <CompassScene mode="hero" selectedCategories={[]} reducedMotion />,
    );
    expect(html).toContain('data-reduced="true"');
  });
});
