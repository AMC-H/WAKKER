import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES } from '../lib/theme';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  label?: string;
  duration?: number;
}

/**
 * Circular progress ring built with Views only (no react-native-svg).
 * Uses two half-circle clips rotated to show the progress arc.
 */
export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = COLORS.primary,
  bgColor = COLORS.border,
  showLabel = true,
  label,
  duration = 800,
}: ProgressRingProps) {
  const animProgress = useSharedValue(0);
  const half = size / 2;

  useEffect(() => {
    animProgress.value = withTiming(Math.min(progress, 100), {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  // Right half: covers 0–50%
  const rightStyle = useAnimatedStyle(() => {
    const deg = interpolate(
      Math.min(animProgress.value, 50),
      [0, 50],
      [0, 180]
    );
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  // Left half: covers 50–100%
  const leftStyle = useAnimatedStyle(() => {
    const deg = interpolate(
      Math.max(animProgress.value - 50, 0),
      [0, 50],
      [0, 180]
    );
    return { transform: [{ rotate: `${deg}deg` }] };
  });

  // Hide left clip until past 50%
  const leftOpacity = useAnimatedStyle(() => ({
    opacity: animProgress.value > 50 ? 1 : 0,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* BG ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Right half (0-180°) */}
      <View style={[styles.halfClip, { width: half, height: size, left: half, overflow: 'hidden' }]}>
        <Animated.View
          style={[
            styles.halfRing,
            {
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: color,
              left: -half,
            },
            rightStyle,
          ]}
        />
      </View>

      {/* Left half (180-360°) */}
      <Animated.View style={[styles.halfClip, { width: half, height: size, left: 0, overflow: 'hidden' }, leftOpacity]}>
        <Animated.View
          style={[
            styles.halfRing,
            {
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: color,
              left: 0,
            },
            leftStyle,
          ]}
        />
      </Animated.View>

      {/* Label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.value, { fontSize: size > 60 ? FONT_SIZES.md : FONT_SIZES.sm }]}>
            {label || `${Math.round(progress)}%`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
  },
  halfClip: {
    position: 'absolute',
    top: 0,
  },
  halfRing: {
    position: 'absolute',
    top: 0,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  labelContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontWeight: '700',
    color: COLORS.text,
  },
});
