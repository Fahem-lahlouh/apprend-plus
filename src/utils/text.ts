/** Normalises an answer for tolerant free-text comparison. */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}+#. ]/gu, '')
    .replace(/\s+/g, ' ')
    // Trailing punctuation is never meaningful in an answer.
    .replace(/^[.\s]+|[.\s]+$/g, '');
}

export function includesQuery(haystack: string, query: string): boolean {
  return normalizeAnswer(haystack).includes(normalizeAnswer(query));
}
