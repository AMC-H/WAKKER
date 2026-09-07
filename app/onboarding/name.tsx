import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../src/lib/theme';

export default function OnboardingName() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const handleNext = () => {
    // Sla naam op (wordt later via context/profile gedaan)
    router.push({ pathname: '/onboarding/motivation', params: { name } });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.step}>Stap 1 van 4</Text>
        <Text style={styles.title}>Hoe mogen we je{'\n'}noemen?</Text>
        <Text style={styles.subtitle}>
          Dit maakt je ervaring persoonlijker. Lina gebruikt je naam in gesprekken.
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Je voornaam"
          placeholderTextColor={COLORS.textMuted}
          autoFocus
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom || SPACING.lg }]}>
        <Pressable
          style={[styles.nextButton, !name.trim() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={styles.nextButtonText}>Volgende</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <Pressable style={styles.skipButton} onPress={() => router.push('/onboarding/motivation')}>
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
  progressActive: {
    backgroundColor: COLORS.primary,
    width: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -60,
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
  input: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: 0,
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
