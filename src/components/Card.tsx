import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  color?: string;
  padding?: keyof typeof SPACING;
  radius?: keyof typeof RADIUS;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  color,
  padding = 'md',
  radius = 'lg',
  style,
}: CardProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.md,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: color ? color + '30' : COLORS.border,
        };
      case 'filled':
        return {
          backgroundColor: color || COLORS.surface,
        };
    }
  };

  return (
    <View
      style={[
        { padding: SPACING[padding], borderRadius: RADIUS[radius] },
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
}
