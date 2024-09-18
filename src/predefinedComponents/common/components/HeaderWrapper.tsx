import * as React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View, useWindowDimensions,Text} from 'react-native';
import Animated, { useAnimatedStyle,interpolate,Extrapolate} from 'react-native-reanimated';

import { colors } from '../../../constants';
import type { AnimatedColorProp } from '../SharedProps';
import { parseAnimatedColorProp } from '../utils/parseAnimatedColorProp';

import { HeaderBackground } from './HeaderBackground';
import { HeaderBackgroundImage } from './HeaderBackgroundImage';

interface HeaderWrapperProps {
  backgroundColor?: AnimatedColorProp;
  backgroundImage?: ImageSourcePropType;
  contentBackgroundColor?: AnimatedColorProp;
  hasBorderRadius?: boolean;
  parallaxHeight: number;
  scrollHeight: number;
  scrollValue: Animated.SharedValue<number>;
  tabsContainerBackgroundColor?: AnimatedColorProp;
}

export const HeaderWrapper: React.FC<React.PropsWithChildren<HeaderWrapperProps>> = ({
  backgroundColor,
  backgroundImage,
  children,
  contentBackgroundColor,
  hasBorderRadius,
  parallaxHeight,
  scrollHeight,
  scrollValue,
  tabsContainerBackgroundColor,
}) => {
  const { width } = useWindowDimensions();
  const hasBackgroundImage = !!backgroundImage;
  const foregroundAnimatedStyle = useAnimatedStyle(() => {
    if (!hasBorderRadius) {
      return { borderBottomEndRadius: 0,backgroundColor};
    }
    return {
      backgroundColor: hasBackgroundImage?colors.transparent:backgroundColor,
      transform:[
        {
          translateY:-scrollValue.value
        }
      ],
      borderBottomEndRadius: interpolate(
        scrollValue.value,
        [0, scrollHeight],
        [80, 0],
        Extrapolate.EXTEND
      ),
    };
  }, [hasBackgroundImage,backgroundColor, hasBorderRadius,tabsContainerBackgroundColor,scrollValue,scrollHeight]);

  return (
      <View style={[styles.handler,{ height: scrollHeight,width}]}>
          <View style={[styles.headerStyle,{ height: scrollHeight,width,backgroundImage:backgroundImage}]}>
            <Animated.View
            pointerEvents="box-none"
            style={[
              {
                width:'100%',
                height: scrollHeight,
                borderBottomEndRadius:200
              },
              foregroundAnimatedStyle,
            ]}
            testID="HeaderForeground">
            {children}
          </Animated.View>
          </View>
      </View>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    position: 'relative',
    left: 0,
    top: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    backgroundColor:'transparent'
  },
  handler: {
    position:'relative'
  },
  bacPanel:{
    height:2000
  },
  handlerText: {
    fontSize: 24,
    color: 'red',
  },
});
