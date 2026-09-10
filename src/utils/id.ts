/** Stable, collision-safe id generator that works in browsers and tests. */
export function newId(prefix = ''): string {
  const cryptoObj = globalThis.crypto;
  const raw =
    cryptoObj && 'randomUUID' in cryptoObj
      ? cryptoObj.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${raw}` : raw;
}

/** Deterministic slug used for seeded content ids so re-seeding is idempotent. */
export function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
