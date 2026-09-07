import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../src/lib/theme';

const MOTIVATIONS = [
  { id: 'gezondheid', emoji: '💚', label: 'Gezondheid verbeteren' },
  { id: 'geld', emoji: '💰', label: 'Geld besparen' },
  { id: 'mentaal', emoji: '🧠', label: 'Helderder denken' },
  { id: 'relaties', emoji: '👥', label: 'Betere relaties' },
  { id: 'energie', emoji: '⚡', label: 'Meer energie' },
  { id: 'controle', emoji: '🎯', label: 'Controle terugnemen' },
  { id: 'werk', emoji: '💼', label: 'Beter presteren' },
  { id: 'zelfbeeld', emoji: '🪞', label: 'Trots op mezelf zijn' },
];

export default function OnboardingMotivation() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/costs',
      params: { name, motivation: selected.join(',') },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.progress}>
        <View style={styles.progressDone} />
        <View style={[styles.progressDot, styles.progressActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Stap 2 van 4</Text>
        <Text style={styles.title}>Waarom wil je{'\n'}stoppen?</Text>
        <Text style={styles.subtitle}>
          Kies wat voor jou het belangrijkst is. Je mag er meerdere kiezen.
        </Text>

        <View style={styles.grid}>
          {MOTIVATIONS.map((m) => {
            const isSelected = selected.includes(m.id);
            return (
              <Pressable
                key={m.id}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggle(m.id)}
              >
                <Text style={styles.chipEmoji}>{m.emoji}</Text>
                <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                  {m.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || SPACING.lg }]}>
        <Pressable
          style={[styles.nextButton, selected.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selected.length === 0}
        >
          <Text style={styles.nextButtonText}>Volgende</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => router.push({ pathname: '/onboarding/costs', params: { name } })}>
          <Text style={styles.skipText}>Overslaan</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  progressDone: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.success,
  },
  progressActive: {
    backgroundColor: COLORS.primary,
    width: 48,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  step: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 46,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  grid: {
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  chipEmoji: {
    fontSize: 22,
  },
  chipLabel: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    fontWeight: '500',
    color: COLORS.text,
  },
  chipLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    gap: SPACING.md,
    paddingTop: SPACING.md,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.body,
  },
});
