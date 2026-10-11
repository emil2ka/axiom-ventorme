import { useEffect, useRef, type CSSProperties } from 'react';
import type { Direction, GoalId } from '../lib/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/categories';
import './interest/interest.css';

type DirectionDialogProps = {
  direction: Direction | null;
  goalId: GoalId | null;
  onClose: () => void;
};

export default function DirectionDialog({ direction, goalId, onClose }: DirectionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (direction && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => closeRef.current?.focus());
    } else if (!direction && dialog.open) {
      dialog.close();
    }
  }, [direction]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.style.overflow = '';
      onCloseRef.current();
    };
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
      document.documentElement.style.overflow = '';
    };
  }, []);

  const tryBlock = (
    <div className="vp-direction-try" key="try">
      <span className="vp-direction-label">Попробуй сейчас</span>
      {direction?.tryNow}
    </div>
  );
  const tasksBlock = (
    <div key="tasks">
      <span className="vp-direction-label">Что можно делать</span>
      <ul className="vp-direction-tasks">
        {direction?.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
    </div>
  );
  const nextBlock = (
    <div key="next">
      <span className="vp-direction-label">Следующий шаг</span>
      <p className="vp-direction-summary">{direction?.nextStep}</p>
    </div>
  );

  const orderedBlocks =
    goalId === 'try'
      ? [tryBlock, tasksBlock, nextBlock]
      : goalId === 'nextstep'
        ? [nextBlock, tasksBlock, tryBlock]
        : [tasksBlock, tryBlock, nextBlock];

  return (
    <dialog ref={dialogRef} className="vp-dialog" aria-labelledby="vp-dialog-title">
      {direction ? (
        <div className="vp-dialog-body">
          <div className="vp-dialog-top">
            <h3 id="vp-dialog-title" className="vp-dialog-title">
              {direction.title}
            </h3>
            <button
              ref={closeRef}
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => dialogRef.current?.close()}
            >
              Закрыть
            </button>
          </div>

          <div className="vp-dialog-chips">
            {direction.categories.map((category) => (
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

          <p className="vp-direction-summary">{direction.summary}</p>

          {orderedBlocks}
        </div>
      ) : null}
    </dialog>
  );
}
