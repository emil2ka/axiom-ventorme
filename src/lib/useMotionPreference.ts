import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  MOTION_PREF_EVENT,
  MOTION_PREF_KEY,
  readManualReducedMotion,
  setManualReducedMotion,
} from './motionPref';

export { MOTION_PREF_EVENT, MOTION_PREF_KEY, readManualReducedMotion, setManualReducedMotion };

export function useMotionPreference(): boolean {
  const systemReduced = useReducedMotion();
  const [manualReduced, setManualReduced] = useState(false);

  useEffect(() => {
    setManualReduced(readManualReducedMotion());
    const onChange = () => setManualReduced(readManualReducedMotion());
    window.addEventListener(MOTION_PREF_EVENT, onChange);
    return () => window.removeEventListener(MOTION_PREF_EVENT, onChange);
  }, []);

  return Boolean(systemReduced) || manualReduced;
}
