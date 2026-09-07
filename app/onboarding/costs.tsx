import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../src/lib/theme';

const PRESETS = [5, 10, 15, 20, 30];

export default function OnboardingCosts() {
  const insets = useSafeAreaInsets();
  const { name, motivation } = useLocalSearchParams<{ name?: string; motivation?: string }>();
  const [amount, setAmount] = useState('');

  const monthSaving = parseFloat(amount || '0') * 30;
  const yearSaving = parseFloat(amount || '0') * 365;

  const handleNext = () => {
    router.push({
      pathname: '/onboarding/ready',
      params: { name, motivation, dailyCost: amount },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.progress}>
        <View style={styles.progressDone} />
        <View style={styles.progressDone} />
        <View style={[styles.progressDot, styles.progressActive]} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.step}>Stap 3 van 4</Text>
        <Text style={styles.title}>Hoeveel geef je{'\n'}uit per dag?</Text>
        <Text style={styles.subtitle}>
          Zo kunnen we berekenen hoeveel je bespaart. Een schatting is prima.
        </Text>

        {/* Preset buttons */}
        <View style={styles.presets}>
          {PRESETS.map((p) => (
            <Pressable
              key={p}
              style={[styles.preset, amount === String(p) && styles.presetSelected]}
              onPress={() => setAmount(String(p))}
            >
              <Text style={[styles.presetText, amount === String(p) && styles.presetTextSelected]}>
                {'€'}{p}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Custom input */}
        <View style={styles.inputRow}>
          <Text style={styles.euro}>{'€'}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9.,]/g, ''))}
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
          <Text style={styles.perDay}>per dag</Text>
        </View>

        {/* Besparing preview */}
        {parseFloat(amount) > 0 && (
          <View style={styles.savingsCard}>
            <Text style={styles.savingsTitle}>Jouw besparing</Text>
            <View style={styles.savingsRow}>
              <View style={styles.savingsItem}>
                <Text style={styles.savingsAmount}>{'€'}{monthSaving.toFixed(0)}</Text>
                <Text style={styles.savingsPeriod}>per maand</Text>
              </View>
              <View style={styles.savingsDivider} />
              <View style={styles.savingsItem}>
                <Text style={styles.savingsAmount}>{'€'}{yearSaving.toFixed(0)}</Text>
                <Text style={styles.savingsPeriod}>per jaar</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || SPACING.lg }]}>
        <Pressable
          style={[styles.nextButton, !amount && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!amount}
        >
          <Text style={styles.nextButtonText}>Volgende</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => router.push({ pathname: '/onboarding/ready', params: { name, motivation } })}>
          <Text style={styles.skipText}>Overslaan</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingTop: SPACING.lg,
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
    marginBottom: SPACING.xl,
  },
  presets: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  preset: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  presetSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  presetText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetTextSelected: {
    color: COLORS.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  euro: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    padding: 0,
  },
  perDay: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textMuted,
  },
  savingsCard: {
    backgroundColor: '#E8F8F0',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  savingsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2D8F6F',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsItem: {
    flex: 1,
    alignItems: 'center',
  },
  savingsAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#2D8F6F',
  },
  savingsPeriod: {
    fontSize: FONT_SIZES.sm,
    color: '#2D8F6F',
    opacity: 0.7,
    marginTop: 2,
  },
  savingsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2D8F6F',
    opacity: 0.2,
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
