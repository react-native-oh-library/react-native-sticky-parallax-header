import * as React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, commonStyles } from '../../../constants';
import type { AnimatedColorProp, IconProps } from '../../common/SharedProps';
import IconRenderer from '../../common/components/IconRenderer';
import { parseAnimatedColorProp } from '../../common/utils/parseAnimatedColorProp';

interface HeaderBarProps extends IconProps {
  backgroundColor?: AnimatedColorProp;
  enableSafeAreaTopInset?: boolean;
  headerTitleContainerAnimatedStyle: { opacity: number };
  title?: string;
  titleStyle?: StyleProp<Animated.AnimateStyle<TextStyle>>;
  titleTestID?: string;
}

const HIT_SLOP = {
  top: 15,
  left: 15,
  bottom: 15,
  right: 15,
};

function useTopInsetPadding(enableSafeAreaTopInset?: boolean) {
  const insets = useSafeAreaInsets();
  if (!enableSafeAreaTopInset) {
    return 0;
  }
  // 鸿蒙 SafeAreaView edges 切换常无可见效果：显式 paddingTop
  return insets.top > 0 ? insets.top : StatusBar.currentHeight ?? 48;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  backgroundColor,
  enableSafeAreaTopInset,
  headerTitleContainerAnimatedStyle,
  leftTopIcon,
  leftTopIconAccessibilityLabel,
  leftTopIconOnPress,
  leftTopIconTestID,
  rightTopIcon,
  rightTopIconAccessibilityLabel,
  rightTopIconOnPress,
  rightTopIconTestID,
  title,
  titleStyle,
  titleTestID = 'DetailsHeaderBarTitleTestID',
}) => {
  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: parseAnimatedColorProp(backgroundColor) as string,
    };
  }, [backgroundColor]);

  const topPadding = useTopInsetPadding(enableSafeAreaTopInset);

  return (
    <Animated.View style={[styles.bar, wrapperAnimatedStyle, { paddingTop: topPadding }]}>
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={commonStyles.headerWrapper}>
          {leftTopIcon ? (
            <Pressable
              accessibilityLabel={leftTopIconAccessibilityLabel}
              accessibilityRole="button"
              hitSlop={HIT_SLOP}
              onPress={leftTopIconOnPress}
              style={styles.leftHeaderButton}
              testID={leftTopIconTestID}>
              <IconRenderer icon={leftTopIcon} />
            </Pressable>
          ) : null}
          <Animated.View style={[styles.headerTitleContainer, headerTitleContainerAnimatedStyle]}>
            <Animated.Text style={[styles.headerTitle, titleStyle]} testID={titleTestID}>
              {title}
            </Animated.Text>
          </Animated.View>
          {rightTopIcon ? (
            <Pressable
              accessibilityLabel={rightTopIconAccessibilityLabel}
              accessibilityRole="button"
              hitSlop={HIT_SLOP}
              onPress={rightTopIconOnPress}
              style={styles.rightHeaderButton}
              testID={rightTopIconTestID}>
              <IconRenderer icon={rightTopIcon} />
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  safeArea: {
    alignSelf: 'stretch',
    paddingBottom: 20,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
    textAlign: 'left',
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
    flex: 8,
  },
  leftHeaderButton: {
    alignItems: 'flex-start',
    flex: 1,
  },
  rightHeaderButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
