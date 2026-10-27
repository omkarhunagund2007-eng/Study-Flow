// Creates a unique id for each task, subject and study session.
// crypto.randomUUID only exists on secure pages (https or localhost), so we
// keep a fallback for people who open the dev server from another device
// on their network over plain http.
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
