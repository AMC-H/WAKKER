import React, { useCallback } from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SIZES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: FONT_SIZES.sm, iconSize: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: FONT_SIZES.body, iconSize: 18 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FONT_SIZES.md, iconSize: 20 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  color = COLORS.primary,
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const sizeConfig = SIZES[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, []);

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: color, ...SHADOWS.sm };
      case 'secondary':
        return { backgroundColor: color + '15' };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color };
      case 'ghost':
        return { backgroundColor: 'transparent' };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return color;
    }
  };

  const textColor = getTextColor();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: size === 'sm' ? RADIUS.sm : RADIUS.md,
          alignSelf: fullWidth ? 'stretch' : 'center',
          opacity: disabled ? 0.5 : 1,
        },
        getContainerStyle(),
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={sizeConfig.iconSize} color={textColor} />}
          <Text style={[styles.label, { fontSize: sizeConfig.fontSize, color: textColor }]}>
            {label}
          </Text>
          {iconRight && <Ionicons name={iconRight} size={sizeConfig.iconSize} color={textColor} />}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontWeight: '600',
  },
});
