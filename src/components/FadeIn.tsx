import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'none';
  distance?: number;
  style?: ViewStyle;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 500,
  from = 'bottom',
  distance = 16,
  style,
}: FadeInProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(
    from === 'left' ? -distance : from === 'right' ? distance : 0
  );
  const translateY = useSharedValue(
    from === 'bottom' ? distance : from === 'top' ? -distance : 0
  );

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
    translateX.value = withDelay(delay, withTiming(0, { duration, easing }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
