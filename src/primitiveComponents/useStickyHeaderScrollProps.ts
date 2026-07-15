import { useCallback, useEffect, useRef } from 'react';
import type { FlatList, NativeScrollEvent, ScrollView, SectionList } from 'react-native';
import { Platform } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
} from 'react-native-reanimated';

import { useResponsiveSize } from '../hooks/useResponsiveSize';

import type { StickyHeaderSharedProps, StickyHeaderSnapProps } from './StickyHeaderProps';

// FIXME: unknown does not work here :/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScrollComponent = ScrollView | FlatList<any> | SectionList<any, any>;

const VELOCITY_THRESHOLD = 7;

/**
 * HarmonyOS: Reanimated `scrollTo` 易闪退；ScrollView 用命令式 scrollTo 可行。
 * SectionList（TabbedHeaderList）优先走 getScrollResponder().scrollTo，
 * scrollToOffset 在鸿蒙 SectionList 上常无效果。
 */
function scrollListToOffset(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any,
  offset: number
) {
  if (!ref) {
    return;
  }

  const responder =
    (typeof ref.getScrollResponder === 'function' && ref.getScrollResponder()) ||
    (typeof ref.getNativeScrollRef === 'function' && ref.getNativeScrollRef()) ||
    null;

  if (responder && typeof responder.scrollTo === 'function') {
    responder.scrollTo({ animated: true, x: 0, y: offset });
    return;
  }

  if (typeof ref.scrollTo === 'function') {
    ref.scrollTo({ animated: true, x: 0, y: offset });
    return;
  }

  if (typeof ref.scrollToOffset === 'function') {
    ref.scrollToOffset({ animated: true, offset });
    return;
  }

  if (offset <= 0 && typeof ref.scrollToLocation === 'function') {
    ref.scrollToLocation({
      animated: true,
      itemIndex: 0,
      sectionIndex: 0,
      viewOffset: 0,
    });
  }
}

export function useStickyHeaderScrollProps<T extends ScrollComponent>(
  props: StickyHeaderSharedProps & StickyHeaderSnapProps
) {
  const { responsiveHeight } = useResponsiveSize();

  const {
    headerHeight = 100,
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    onTopReached,
    parallaxHeight = responsiveHeight(53),
    snapStartThreshold,
    snapStopThreshold,
    snapToEdge = false,
  } = props;

  const scrollValue = useSharedValue(0);

  const scrollViewRef = useAnimatedRef<T>();

  const onTopReachedRef = useRef(onTopReached);
  const onTopReachedWasCalled = useRef(false);

  useEffect(() => {
    onTopReachedRef.current = onTopReached;
  }, [onTopReached]);

  function maybeTopReached(value: number) {
    if (value <= 0) {
      if (!onTopReachedWasCalled.current && onTopReachedRef.current) {
        onTopReachedRef.current();
        onTopReachedWasCalled.current = true;
      }
    } else {
      onTopReachedWasCalled.current = false;
    }
  }

  useAnimatedReaction(
    () => scrollValue.value,
    (value) => {
      runOnJS(maybeTopReached)(value);
    },
    [scrollValue]
  );

  const scrollHeight = Math.max(parallaxHeight, headerHeight * 2);

  const snapToTop = useCallback(() => {
    scrollListToOffset(scrollViewRef.current, 0);
  }, [scrollViewRef]);

  const snapToBottom = useCallback(() => {
    scrollListToOffset(scrollViewRef.current, scrollHeight);
  }, [scrollHeight, scrollViewRef]);

  const onSnapToEdge = useCallback(
    (e: NativeScrollEvent) => {
      const scrollToHeight = snapStopThreshold ?? scrollHeight;
      const snapToEdgeThreshold = snapStartThreshold ?? scrollHeight / 2;

      const currentVal = scrollValue.value;
      const velocity = e.velocity?.y ?? 0;

      const dragsToTop = velocity >= 0;
      const dragsToBottom = !dragsToTop;
      const dragsQuickToBottom = dragsToBottom && velocity <= -VELOCITY_THRESHOLD;
      const dragsQuickToTop = dragsToTop && velocity >= VELOCITY_THRESHOLD;

      const isUnderSnapToEdgeThresholdAndDragIsSlow =
        currentVal > 0 && currentVal < snapToEdgeThreshold && !dragsQuickToBottom;
      const isUnderSnapToEdgeThresholdAndDragIsQuick =
        currentVal >= snapToEdgeThreshold / 2 &&
        currentVal < snapToEdgeThreshold &&
        dragsQuickToBottom;
      const isOverSnapToEdgeThresholdAndDragIsSlow =
        currentVal >= snapToEdgeThreshold && currentVal < scrollToHeight && !dragsQuickToTop;
      const isOverSnapToEdgeThresholdAndDragIsQuick =
        currentVal >= snapToEdgeThreshold && currentVal < scrollToHeight / 2 && dragsQuickToTop;

      if (snapToEdge) {
        if (isUnderSnapToEdgeThresholdAndDragIsSlow || isOverSnapToEdgeThresholdAndDragIsQuick) {
          snapToTop();
        } else if (
          isOverSnapToEdgeThresholdAndDragIsSlow ||
          isUnderSnapToEdgeThresholdAndDragIsQuick
        ) {
          snapToBottom();
        }
      }
    },
    [
      snapStartThreshold,
      snapStopThreshold,
      snapToBottom,
      snapToTop,
      snapToEdge,
      scrollHeight,
      scrollValue,
    ]
  );

  const onMomentumScrollEndInternal = useCallback(
    (e: NativeScrollEvent) => {
      onMomentumScrollEnd?.(e);
      onSnapToEdge(e);
    },
    [onMomentumScrollEnd, onSnapToEdge]
  );

  const onScrollEndDragInternal = useCallback(
    (e: NativeScrollEvent) => {
      onScrollEndDrag?.(e);
      // android：只走 onMomentumScrollEnd
      if (Platform.OS === 'android') {
        return;
      }
      // harmony：SectionList 常不触发 / 不可靠 onMomentumScrollEnd，拖拽结束也做吸附
      if (Platform.OS === 'harmony') {
        onSnapToEdge(e);
        return;
      }
      if (Math.abs(e.velocity?.y ?? 0) > 0) {
        return;
      }
      onSnapToEdge(e);
    },
    [onScrollEndDrag, onSnapToEdge]
  );

  const onScrollInternal = useCallback(
    (e: NativeScrollEvent) => {
      scrollValue.value = e.contentOffset.y;
      onScroll?.(e);
    },
    [onScroll]
  );

  return {
    onMomentumScrollEnd: onMomentumScrollEndInternal,
    onScroll: onScrollInternal,
    onScrollEndDrag: onScrollEndDragInternal,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  };
}
