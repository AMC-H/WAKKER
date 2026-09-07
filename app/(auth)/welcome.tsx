import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../src/lib/theme';
import { FadeIn } from '../../src/components';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PHASES = [
  { label: 'Bewustwording', color: '#1A5F7A', days: '14 dagen' },
  { label: 'Voorbereiding', color: '#D4943F', days: '21 dagen' },
  { label: 'Transformatie', color: '#2D8F6F', days: '30 dagen' },
  { label: 'Integratie', color: '#8B5E3C', days: '25 dagen' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const primaryScale = useSharedValue(1);
  const secondaryScale = useSharedValue(1);

  const primaryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryScale.value }],
  }));
  const secondaryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryScale.value }],
  }));

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || SPACING.lg }]}>
      {/* Hero */}
      <View style={styles.hero}>
        <FadeIn delay={0} from="none" duration={600}>
          <Text style={styles.emoji}>🌿</Text>
        </FadeIn>
        <FadeIn delay={150}>
          <Text style={styles.title}>Wakker</Text>
        </FadeIn>
        <FadeIn delay={250}>
          <Text style={styles.subtitle}>Word wakker uit de rook</Text>
        </FadeIn>
        <FadeIn delay={350}>
          <Text style={styles.description}>
            90 dagen begeleiding om cannabis los te laten.{'\n'}
            Op jouw tempo, met AI-coach Lina aan je zijde.
          </Text>
        </FadeIn>
      </View>

      {/* Fase badges */}
      <View style={styles.phases}>
        {PHASES.map((phase, i) => (
          <FadeIn key={i} delay={450 + i * 80} from="bottom" distance={10}>
            <View style={[styles.phaseBadge, { backgroundColor: phase.color + '18' }]}>
              <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
              <Text style={[styles.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
            </View>
          </FadeIn>
        ))}
      </View>

      {/* CTA buttons */}
      <FadeIn delay={800}>
        <View style={styles.actions}>
          <AnimatedPressable
            style={[styles.primaryButton, primaryStyle]}
            onPress={() => router.push('/onboarding/name')}
            onPressIn={() => { primaryScale.value = withSpring(0.96, { damping: 15, stiffness: 400 }); }}
            onPressOut={() => { primaryScale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
          >
            <Text style={styles.primaryButtonText}>Start je reis</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.secondaryButton, secondaryStyle]}
            onPress={() => router.push('/(auth)/login')}
            onPressIn={() => { secondaryScale.value = withSpring(0.96, { damping: 15, stiffness: 400 }); }}
            onPressOut={() => { secondaryScale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
          >
            <Text style={styles.secondaryButtonText}>Ik heb al een account</Text>
          </AnimatedPressable>
        </View>
      </FadeIn>

      <FadeIn delay={950}>
        <Text style={styles.free}>Fase 1 is gratis — geen creditcard nodig</Text>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginTop: SPACING.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  phases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  free: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
});
