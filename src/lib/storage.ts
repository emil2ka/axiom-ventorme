export function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    return;
  }
}

export function safeRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    return;
  }
}
