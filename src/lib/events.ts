import type { EventName } from './types';

export type EventProps = Record<string, string | number | boolean | undefined>;

type RecordedEvent = { name: EventName; props: EventProps; ts: number };

declare global {
  interface Window {
    __vpEvents?: RecordedEvent[];
  }
}

export function track(name: EventName, props: EventProps = {}): void {
  try {
    if (typeof window === 'undefined') return;
    const detail: RecordedEvent = { name, props, ts: Date.now() };
    (window.__vpEvents ??= []).push(detail);
    window.dispatchEvent(new CustomEvent('vp:event', { detail }));
  } catch {
    return;
  }
}
