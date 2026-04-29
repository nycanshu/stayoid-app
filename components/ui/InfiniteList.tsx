import { type ReactElement, type ReactNode, useCallback } from 'react';
import {
  FlatList, View, ActivityIndicator, Platform, RefreshControl,
  type ListRenderItem,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';

interface InfiniteListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;

  /** Header rendered above the first row (search/filter bars, stats strip, etc). */
  ListHeaderComponent?: ReactElement | null;
  /** Custom empty state when data is empty (after first-load skeleton). */
  ListEmptyComponent?: ReactElement | null;
  /** Skeleton shown while the first page is loading. Falls back to nothing. */
  FirstLoadSkeleton?: ReactElement | null;

  /** First-page loading. */
  isLoading: boolean;
  /** Pull-to-refresh in progress. */
  isRefetching: boolean;
  /** Pagination in progress (next page). */
  isFetchingNextPage: boolean;
  /** Whether more pages exist. */
  hasNextPage: boolean;

  onRefresh: () => void;
  onEndReached: () => void;

  /** Spacing between rows. */
  itemGap?: number;
  /** Bottom padding (defaults to 110 to clear the floating tab bar). */
  contentBottomPadding?: number;
}

/**
 * Reusable FlatList wrapper for paginated lists. Pre-tuned for low-end Android:
 * `removeClippedSubviews`, conservative `windowSize`, small `initialNumToRender`,
 * batched rendering. Adds a footer spinner during pagination and dispatches
 * `onEndReached` only when more pages exist.
 */
export function InfiniteList<T>({
  data,
  keyExtractor,
  renderItem,
  ListHeaderComponent,
  ListEmptyComponent,
  FirstLoadSkeleton,
  isLoading,
  isRefetching,
  isFetchingNextPage,
  hasNextPage,
  onRefresh,
  onEndReached,
  itemGap = 10,
  contentBottomPadding = 110,
}: InfiniteListProps<T>): ReactElement {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const ItemSeparator = useCallback(
    () => <View style={{ height: itemGap }} />,
    [itemGap],
  );

  const Footer = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: 18, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={palette.primary} />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, palette.primary]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      onEndReached();
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, onEndReached]);

  // First-load: show header + skeleton, but use the same FlatList shell so the
  // page doesn't reflow when data lands.
  const showFirstLoadSkeleton = isLoading && data.length === 0;

  return (
    <FlatList<T>
      data={showFirstLoadSkeleton ? [] : data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          {showFirstLoadSkeleton ? FirstLoadSkeleton : null}
        </View>
      }
      ListEmptyComponent={showFirstLoadSkeleton ? null : ListEmptyComponent}
      ListFooterComponent={<Footer />}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          tintColor={palette.primary}
        />
      }
      contentContainerStyle={{ padding: 16, paddingBottom: contentBottomPadding }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      // Perf flags tuned for low-end Android.
      removeClippedSubviews={Platform.OS === 'android'}
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      updateCellsBatchingPeriod={50}
      windowSize={5}
    />
  );
}
