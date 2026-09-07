import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PHASE_COLORS, PhaseId, SPACING, FONT_SIZES, RADIUS } from '../lib/theme';

interface PhaseTagProps {
  phaseId: PhaseId;
  label: string;
  compact?: boolean;
}

export function PhaseTag({ phaseId, label, compact = false }: PhaseTagProps) {
  const colors = PHASE_COLORS[phaseId];

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: colors.surface,
          paddingVertical: compact ? 3 : 5,
          paddingHorizontal: compact ? 8 : 12,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      <Text
        style={[
          styles.label,
          {
            color: colors.primaryDark,
            fontSize: compact ? FONT_SIZES.xs : FONT_SIZES.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    gap: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: '600',
  },
});
