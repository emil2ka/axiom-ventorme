import { useEffect, useState } from 'react';
import type { JourneyState } from '../../lib/types';
import { getJourney, subscribeJourney } from '../../lib/journeyStore';
import { selectedCategories } from '../../lib/recommend';
import './branch-panel.css';

const RIBBONS = [
  { id: 'technology', d: 'M 14 96 C 92 108 148 150 206 168 C 268 187 318 120 392 108', tint: 'var(--cat-technology)' },
  { id: 'creativity', d: 'M 14 180 C 100 178 150 170 210 170 C 286 170 320 170 392 166', tint: 'var(--cat-creativity)' },
  { id: 'research', d: 'M 14 262 C 100 252 150 214 208 184 C 282 150 324 220 392 232', tint: 'var(--cat-research)' },
  { id: 'people', d: 'M 14 330 C 108 300 158 232 212 196 C 300 138 330 268 392 300', tint: 'var(--cat-people)' },
  { id: 'organization', d: 'M 14 58 C 108 116 160 158 214 172 C 306 198 336 152 392 130', tint: 'var(--cat-organization)' },
] as const;

export default function BranchPanel() {
  const [journey, setJourney] = useState<JourneyState>(() => getJourney());

  useEffect(() => subscribeJourney(setJourney), []);

  const answers = journey.phase === 'questions' ? journey.draft : journey.committed;
  const active = new Set(journey.phase === 'demo' ? [] : selectedCategories(answers));
  const isResult = journey.phase === 'result' || journey.phase === 'demo';

  return (
    <div className="vp-branch" data-mode={isResult ? 'result' : 'selection'} aria-hidden="true">
      <svg viewBox="0 0 400 380" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="vpb-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4cdd9" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c4cdd9" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="vpb-core">
            <stop offset="0" stopColor="#cffb74" stopOpacity="0.45" />
            <stop offset="1" stopColor="#cffb74" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="208" cy="182" r="76" fill="url(#vpb-core)" opacity="0.55" />

        {RIBBONS.map((ribbon) => (
          <g key={ribbon.id} className="vp-branch-ribbon" data-active={active.has(ribbon.id)}>
            <path d={ribbon.d} transform="translate(1 5)" fill="none" stroke="#04060b" strokeOpacity="0.85" strokeWidth="13" strokeLinecap="round" />
            <path d={ribbon.d} className="vp-branch-path" fill="none" stroke="url(#vpb-silver)" strokeWidth="9" strokeLinecap="round" />
            <path d={ribbon.d} className="vp-branch-edge" fill="none" stroke={ribbon.tint} strokeWidth="1.6" strokeLinecap="round" transform="translate(0 -4.5)" />
          </g>
        ))}

        <g className="vp-branch-nodes">
          <circle cx="300" cy="140" r="4.5" />
          <circle cx="322" cy="176" r="4.5" />
          <circle cx="306" cy="228" r="4.5" />
        </g>
      </svg>
    </div>
  );
}
