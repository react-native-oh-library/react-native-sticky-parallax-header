import type { AnimatedColorProp, ColorProp } from '../SharedProps';

export function parseAnimatedColorProp(
  animatedColorProp?: AnimatedColorProp
): ColorProp {
  'worklet';

  if (typeof animatedColorProp === 'undefined') {
    return 'transparent';
  }

  return typeof animatedColorProp === 'string' ||
    typeof animatedColorProp === 'number' ||
    typeof animatedColorProp === 'symbol'
    ? animatedColorProp
    : (animatedColorProp.value ?? 'transparent');
}
