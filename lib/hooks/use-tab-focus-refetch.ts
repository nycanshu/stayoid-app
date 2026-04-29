import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Re-runs `refetch` whenever the screen gains focus, but skips the very first
 * focus (initial mount) — that load already happens via the query's own fetch.
 *
 * Use this on tab-root screens so switching back to a tab pulls fresh data.
 */
export function useTabFocusRefetch(refetch: () => void) {
  const skipFirst = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (skipFirst.current) {
        skipFirst.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );
}
