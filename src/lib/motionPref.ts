export const MOTION_PREF_KEY = 'vp:motion';
export const MOTION_PREF_EVENT = 'vp:motion-pref';

export function readManualReducedMotion(): boolean {
  try {
    return localStorage.getItem(MOTION_PREF_KEY) === 'reduced';
  } catch {
    return false;
  }
}

export function setManualReducedMotion(reduced: boolean): void {
  try {
    localStorage.setItem(MOTION_PREF_KEY, reduced ? 'reduced' : 'full');
  } catch {
    return;
  }
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.reduceMotion = reduced ? 'true' : 'false';
  }
  try {
    window.dispatchEvent(new CustomEvent(MOTION_PREF_EVENT, { detail: { reduced } }));
  } catch {
    return;
  }
}
