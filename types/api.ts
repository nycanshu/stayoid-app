/**
 * DRF PageNumberPagination response shape.
 *
 * Backends configured with `pagination_class = PageNumberPagination` always
 * return this envelope, even when there's only one page.  Old code unwraps to
 * `results` and throws away `count`/`next` — fine for "load all once", but
 * `useInfiniteQuery` needs `next` to know when there are more pages.
 */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
