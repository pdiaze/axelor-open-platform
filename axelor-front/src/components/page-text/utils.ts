/**
 * Resolves a user-entered page size against the configured max per page.
 *
 * The size is floored to an integer. When there is no configured max
 * (`maxPerPage < 1`), any positive size is allowed. Otherwise, a size above the
 * configured `maxPerPage` is capped to it.
 *
 * A non-positive, `NaN` or infinite size falls back to `fallback`
 * (the default limit).
 *
 * The returned value is always a non-negative integer.
 */
export function resolvePageSize(
  size: number,
  maxPerPage: number,
  fallback: number,
): number {
  const value = Math.floor(size);
  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }
  if (maxPerPage >= 1 && value > maxPerPage) {
    return maxPerPage;
  }
  return value;
}
