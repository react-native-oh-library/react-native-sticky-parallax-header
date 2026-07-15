import * as React from 'react';
import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { commonStyles } from '../../../constants';
import type { AnimatedColorProp } from '../../common/SharedProps';
import { parseAnimatedColorProp } from '../../common/utils/parseAnimatedColorProp';

interface HeaderBarProps {
  backgroundColor?: AnimatedColorProp;
  enableSafeAreaTopInset?: boolean;
  logo: ImageSourcePropType;
  logoContainerStyle?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  logoResizeMode?: ImageResizeMode;
  logoStyle?: StyleProp<Animated.AnimateStyle<ImageStyle>>;
}

function useTopInsetPadding(enableSafeAreaTopInset?: boolean) {
  const insets = useSafeAreaInsets();
  if (!enableSafeAreaTopInset) {
    return 0;
  }
  return insets.top > 0 ? insets.top : StatusBar.currentHeight ?? 48;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  backgroundColor,
  enableSafeAreaTopInset,
  logo,
  logoResizeMode,
  logoStyle,
  logoContainerStyle,
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
        <View style={[commonStyles.headerWrapper, logoContainerStyle as ViewStyle]}>
          <Animated.Image
            resizeMode={logoResizeMode}
            source={logo}
            style={[commonStyles.logo, logoStyle]}
          />
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
  },
});
